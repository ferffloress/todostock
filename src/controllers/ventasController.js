const Venta = require("../models/Venta");
const Producto = require("../models/Producto");
const Lote = require("../models/Lote");
const Cliente = require("../models/Cliente");
const MovimientoStock = require("../models/MovimientoStock");
const CuentaCorriente = require("../models/CuentaCorriente");
const { validate } = require("../validators/ventasValidator");
const {
  calcularPrecioFacturado,
  calcularSubtotalItem,
  calcularTotalConDescuentoEfectivo,
} = require("../utils/precios");

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const ventasController = {
  async listar(req, res, next) {
    try {
      res.json(await Venta.find());
    } catch (err) {
      next(err);
    }
  },

  async listarVista(req, res, next) {
    try {
      const ventas = await Venta.find().lean();
      const clientes = await Cliente.find().lean();
      const clienteMap = {};
      clientes.forEach((c) => {
        clienteMap[c._id] = c.nombre;
      });
      const ventasConNombre = ventas.map((v) => ({
        ...v,
        nombreCliente: clienteMap[v.cliente_id] || `#${v.cliente_id}`,
      }));
      res.render("ventas", { titulo: "Ventas", ventas: ventasConNombre });
    } catch (err) {
      next(err);
    }
  },

  async formularioVenta(req, res, next) {
    try {
      const clientes = await Cliente.find();
      const productos = await Producto.find({ activo: true });
      res.render("nuevaVenta", {
        titulo: "Registrar Nueva Venta",
        clientes,
        productos,
        error: null,
      });
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const venta = await Venta.findById(Number(req.params.id));
      if (!venta) throw makeError("Venta no encontrada", 404);
      res.json(venta);
    } catch (err) {
      next(err);
    }
  },

  async detalleVista(req, res, next) {
    try {
      const venta = await Venta.findById(Number(req.params.id));
      if (!venta) throw makeError("Venta no encontrada", 404);

      const cliente = await Cliente.findById(venta.cliente_id);

      const itemsConNombre = await Promise.all(
        venta.items.map(async (item) => {
          const producto = await Producto.findById(item.producto_id);
          return {
            ...item,
            nombreProducto: producto?.nombre ?? `Producto #${item.producto_id}`,
          };
        }),
      );

      res.render("detalleVenta", {
        titulo: `Venta #${venta._id}`,
        venta,
        cliente,
        items: itemsConNombre,
      });
    } catch (err) {
      next(err);
    }
  },

  async crear(req, res, next) {
    try {
      // 1. Limpieza numérica
      if (Array.isArray(req.body.items)) {
        req.body.items.forEach((item) => {
          item.cantidad = Number(item.cantidad) || 0;
          item.precio_unitario = Number(item.precio_unitario) || 0;
          item.producto_id = Number(item.producto_id);
        });
      }

      // 2. Validación
      const { errors } = validate(req.body);
      if (errors.length > 0)
        throw makeError(`Datos inválidos: ${errors.join(", ")}`, 422);

      const cliente = await Cliente.findById(Number(req.body.cliente_id));
      if (!cliente) throw makeError("Cliente no encontrado", 404);

      // 3. Procesar items y asignar lotes (FIFO)
      const itemsConLote = [];
      for (const item of req.body.items) {
        const producto = await Producto.findById(item.producto_id);
        if (!producto)
          throw makeError(`Producto no encontrado: ${item.producto_id}`, 404);

        const factor = producto.unidades_por_bulto || 1;
        const cantidadEnUnidades =
          item.tipo_venta === "bulto" ? item.cantidad * factor : item.cantidad;

        // Lotes disponibles ordenados por fecha vencimiento (FIFO)
        const lotesActivos = await Lote.find({
          producto_id: item.producto_id,
          cantidad_actual: { $gt: 0 },
        }).sort({ fecha_vencimiento: 1 });

        const stockTotal = lotesActivos.reduce(
          (sum, l) => sum + l.cantidad_actual,
          0,
        );
        if (stockTotal < cantidadEnUnidades) {
          throw makeError(
            `Stock insuficiente para ${producto.nombre}. Disponible: ${stockTotal} unidades.`,
            400,
          );
        }

        // Asignación de lotes
        let remaining = cantidadEnUnidades;
        const loteAssignments = [];
        for (const lote of lotesActivos) {
          if (remaining <= 0) break;
          const consume = Math.min(remaining, lote.cantidad_actual);
          loteAssignments.push({ lote_id: lote._id, cantidad: consume });
          remaining -= consume;
        }

        const precioFacturado = calcularPrecioFacturado(
          item.tipo_venta,
          item.precio_unitario,
        );
        const subtotal = calcularSubtotalItem({
          tipoVenta: item.tipo_venta,
          cantidad: item.cantidad,
          precioUnitario: item.precio_unitario,
        });

        itemsConLote.push({
          producto_id: item.producto_id,
          tipo_venta: item.tipo_venta || "unidad",
          cantidad_form: item.cantidad,
          cantidad_unidades: cantidadEnUnidades,
          precio_facturado: precioFacturado,
          subtotal,
          lote_assignments: loteAssignments,
        });
      }

      const totalVentaBruto = itemsConLote.reduce(
        (sum, i) => sum + i.subtotal,
        0,
      );
      const formaPago = req.body.forma_pago || "efectivo";
      const totalVenta = calcularTotalConDescuentoEfectivo(
        totalVentaBruto,
        formaPago,
      );

      // 4. Validar crédito
      if (req.body.forma_pago === "cuenta_corriente") {
        if (
          cliente.saldo_cuenta_corriente + totalVenta >
          (cliente.limite_credito || 0)
        ) {
          throw makeError("Límite de crédito insuficiente", 400);
        }
      }

      // 5. Guardar venta
      await new Venta({
        cliente_id: Number(req.body.cliente_id),
        items: itemsConLote,
        total: totalVenta,
        forma_pago: req.body.forma_pago || "efectivo",
        estado: req.body.estado || "pendiente",
        observaciones: req.body.observaciones || null,
      }).save();

      res.redirect("/ventas");
    } catch (err) {
      const clientes = await Cliente.find();
      const productos = await Producto.find({ activo: true });
      res.render("nuevaVenta", {
        titulo: "Registrar Nueva Venta",
        clientes,
        productos,
        error: err.message,
        datosTemporales: req.body,
      });
    }
  },

  async despachar(req, res, next) {
    try {
      const venta = await Venta.findById(Number(req.params.id));
      if (!venta) throw makeError("Venta no encontrada", 404);
      if (venta.estado !== "pendiente")
        throw makeError(`La venta ya está ${venta.estado}`, 400);

      // 1. Egreso de stock
      for (const item of venta.items) {
        for (const assignment of item.lote_assignments) {
          // Descontar lote
          await Lote.findByIdAndUpdate(assignment.lote_id, {
            $inc: { cantidad_actual: -assignment.cantidad },
          });
          // Descontar producto
          await Producto.findByIdAndUpdate(item.producto_id, {
            $inc: { stock_actual: -assignment.cantidad },
          });
          // Registrar movimiento
          await new MovimientoStock({
            tipo: "egreso",
            producto_id: item.producto_id,
            lote_id: assignment.lote_id,
            cantidad: assignment.cantidad,
            referencia: venta._id,
            observaciones: `Venta ${venta._id} - ${item.tipo_venta}`,
          }).save();
        }
      }

      // 2. Movimientos cuenta corriente
      const cliente = await Cliente.findById(venta.cliente_id);
      let nuevoSaldo = cliente.saldo_cuenta_corriente || 0;

      if (venta.forma_pago === "cuenta_corriente") {
        nuevoSaldo += venta.total;
        await new CuentaCorriente({
          cliente_id: venta.cliente_id,
          tipo: "debito",
          monto: venta.total,
          referencia: venta._id,
          descripcion: "Venta a Cta. Cte.",
          saldo_resultante: nuevoSaldo,
        }).save();
        
        await Cliente.findByIdAndUpdate(venta.cliente_id, {
          saldo_cuenta_corriente: nuevoSaldo,
        });
      } else {
        // Efectivo u otro medio: registra el movimiento doble para reflejar el historial sin alterar el saldo final neto

        
        await new CuentaCorriente({
        cliente_id: venta.cliente_id,
        tipo: 'ingreso',
        monto: venta.total,
        referencia: venta._id,
        descripcion: `Venta Contado (${venta.forma_pago})`,
        saldo_resultante: nuevoSaldo, 
      }).save();
      }

      await Cliente.findByIdAndUpdate(venta.cliente_id, {
        saldo_cuenta_corriente: nuevoSaldo,
      });

      await Venta.findByIdAndUpdate(Number(req.params.id), {
        estado: "despachada",
      });
      
      res.redirect(`/ventas/ver/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  },

  async cancelar(req, res, next) {
    try {
      const venta = await Venta.findById(Number(req.params.id));
      if (!venta) throw makeError("Venta no encontrada", 404);
      if (venta.estado !== "pendiente")
        throw makeError("Solo se pueden cancelar ventas pendientes", 400);
      await Venta.findByIdAndUpdate(Number(req.params.id), {
        estado: "cancelada",
      });
      res.redirect(`/ventas/ver/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ventasController;
