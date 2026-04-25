const Venta = require('../models/Venta');
const MovimientoStock = require('../models/MovimientoStock');
const CuentaCorriente = require('../models/CuentaCorriente');
const createStore = require('../data/store');
const { validate } = require('../validators/ventasValidator');

const ventasStore = createStore('ventas.json');
const clientesStore = createStore('clientes.json');
const productosStore = createStore('productos.json');
const lotesStore = createStore('lotes.json');
const movimientosStore = createStore('movimientosStock.json');
const cuentasStore = createStore('cuentasCorrientes.json');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const ventasController = {
  listar(req, res, next) {
    try {
      res.json(ventasStore.getAll());
    } catch (err) {
      next(err);
    }
  },

  listarVista(req, res, next) {
    try {
      const ventas = ventasStore.getAll();
      res.render('ventas', { titulo: 'Ventas', ventas });
    } catch (err) {
      next(err);
    }
  },

  formularioVenta(req, res, next) {
    try {
      const clientes = clientesStore.getAll();
      const productos = productosStore.getAll();
      res.render('nuevaVenta', {
        titulo: 'Registrar Nueva Venta',
        clientes,
        productos,
        error: null
      });
    } catch (err) {
      next(err);
    }
  },

  obtener(req, res, next) {
    try {
      const venta = ventasStore.getById(req.params.id);
      if (!venta) throw makeError('Venta no encontrada', 404);
      res.json(venta);
    } catch (err) {
      next(err);
    }
  },

  crear(req, res, next) {
    try {
      // 1. Limpieza de datos numéricos
      if (req.body.items && Array.isArray(req.body.items)) {
        req.body.items.forEach(item => {
          item.cantidad = Number(item.cantidad) || 0;
          item.precio_unitario = Number(item.precio_unitario) || 0;
        });
      }

      // 2. Validación de esquema
      const { errors } = validate(req.body);
      if (errors.length > 0) {
        throw makeError(`Datos inválidos: ${errors.join(', ')}`, 422);
      }

      const cliente = clientesStore.getById(req.body.cliente_id);
      if (!cliente) throw makeError('Cliente no encontrado', 404);

      const itemsConLote = [];
      for (const item of req.body.items) {
        const producto = productosStore.getById(item.producto_id);
        if (!producto) throw makeError(`Producto no encontrado: ${item.producto_id}`, 404);

        // --- LÓGICA DE CONVERSIÓN Y PRECIOS ---
        const factor = producto.unidades_por_bulto || 1;
        let cantidadEnUnidades = item.cantidad;
        
        // Si es bulto, calculamos la cantidad real de unidades para descontar del stock
        if (item.tipo_venta === 'bulto') {
          cantidadEnUnidades = item.cantidad * factor;
        }

        // Búsqueda de lotes disponibles (FIFO: Primero en vencer, primero en salir)
        const lotesActivos = lotesStore
          .findWhere(l => l.producto_id === item.producto_id && l.cantidad_actual > 0)
          .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

        const stockTotalUnidades = lotesActivos.reduce((sum, l) => sum + l.cantidad_actual, 0);
        
        if (stockTotalUnidades < cantidadEnUnidades) {
          throw makeError(`Stock insuficiente para ${producto.nombre}. Disponible: ${stockTotalUnidades} unidades.`, 400);
        }

        // Asignación de lotes
        let remaining = cantidadEnUnidades;
        const loteAssignments = [];
        for (const lote of lotesActivos) {
          if (remaining <= 0) break;
          const consume = Math.min(remaining, lote.cantidad_actual);
          loteAssignments.push({ lote_id: lote.id, cantidad: consume });
          remaining -= consume;
        }

        itemsConLote.push({
          producto_id: item.producto_id,
          tipo_venta: item.tipo_venta || 'unidad',
          cantidad_form: item.cantidad,           // Cantidad original (unidades o bultos)
          cantidad_unidades: cantidadEnUnidades,  // Total convertido a unidades
          precio_facturado: item.precio_unitario, // Precio ya procesado por el JS (unidad o bulto completo)
          subtotal: item.cantidad * item.precio_unitario,
          lote_assignments: loteAssignments,
        });
      }

      const totalVenta = itemsConLote.reduce((sum, item) => sum + item.subtotal, 0);
      
      // Validar crédito si es cuenta corriente
      if (req.body.forma_pago === 'cuenta_corriente') {
        if (cliente.saldo_cuenta_corriente + totalVenta > (cliente.limite_credito || 0)) {
          throw makeError('Límite de crédito insuficiente', 400);
        }
      }

      const venta = new Venta({ 
        ...req.body, 
        items: itemsConLote, 
        total: totalVenta,
        forma_pago: req.body.forma_pago || 'efectivo',
        estado: req.body.estado || 'pendiente'
      });

      const nuevaVenta = ventasStore.create(venta);

      // Si el usuario eligió "Despachada" de entrada, ejecutamos la lógica de despacho
      if (req.body.estado === 'despachada') {
        // En un entorno ideal, llamaríamos internamente a despachar() 
        // Para este ejemplo, el usuario deberá darle al botón "Despachar" en la lista.
      }

      res.redirect('/ventas'); 

    } catch (err) {
      const clientes = clientesStore.getAll();
      const productos = productosStore.getAll();
      res.render('nuevaVenta', {
        titulo: 'Registrar Nueva Venta',
        clientes,
        productos,
        error: err.message,
        datosTemporales: req.body
      });
    }
  },

  despachar(req, res, next) {
    try {
      const venta = ventasStore.getById(req.params.id);
      if (!venta) throw makeError('Venta no encontrada', 404);
      if (venta.estado !== 'pendiente') {
        throw makeError(`La venta ya está ${venta.estado}`, 400);
      }

      // 1. Procesar Egreso de Stock
      for (const item of venta.items) {
        for (const assignment of item.lote_assignments) {
          const lote = lotesStore.getById(assignment.lote_id);
          if (lote) {
            lotesStore.update(assignment.lote_id, {
              cantidad_actual: lote.cantidad_actual - assignment.cantidad,
              updated_at: new Date().toISOString(),
            });
          }
          
          const producto = productosStore.getById(item.producto_id);
          if (producto) {
            productosStore.update(item.producto_id, {
              stock_actual: producto.stock_actual - assignment.cantidad,
              updated_at: new Date().toISOString(),
            });
          }
          
          const mov = new MovimientoStock({
            tipo: 'egreso',
            producto_id: item.producto_id,
            lote_id: assignment.lote_id,
            cantidad: assignment.cantidad,
            referencia: venta.id,
            observaciones: `Venta ${venta.id} - ${item.tipo_venta}`,
          });
          movimientosStore.create(mov);
        }
      }

      // 2. Procesar Movimientos de Cuenta Corriente
      const cliente = clientesStore.getById(venta.cliente_id);
      let nuevoSaldo = cliente.saldo_cuenta_corriente || 0;

      if (venta.forma_pago === 'cuenta_corriente') {
        nuevoSaldo += venta.total;
        cuentasStore.create(new CuentaCorriente({
          cliente_id: venta.cliente_id,
          tipo: 'debito',
          monto: venta.total,
          referencia: venta.id,
          descripcion: 'Venta a Cta. Cte.',
          saldo_resultante: nuevoSaldo,
        }));
      } else {
        // Operación de contado (Débito y Crédito simultáneo para historial)
        cuentasStore.create(new CuentaCorriente({
          cliente_id: venta.cliente_id,
          tipo: 'debito',
          monto: venta.total,
          referencia: venta.id,
          descripcion: `Venta Contado (${venta.forma_pago})`,
          saldo_resultante: nuevoSaldo + venta.total,
        }));
        cuentasStore.create(new CuentaCorriente({
          cliente_id: venta.cliente_id,
          tipo: 'credito',
          monto: venta.total,
          referencia: venta.id,
          descripcion: `Pago Recibido (${venta.forma_pago})`,
          saldo_resultante: nuevoSaldo,
        }));
      }

      clientesStore.update(venta.cliente_id, {
        saldo_cuenta_corriente: nuevoSaldo,
        updated_at: new Date().toISOString(),
      });

      const updated = ventasStore.update(req.params.id, { 
        estado: 'despachada', 
        updated_at: new Date().toISOString() 
      });
      
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  cancelar(req, res, next) {
    try {
      const venta = ventasStore.getById(req.params.id);
      if (!venta) throw makeError('Venta no encontrada', 404);
      if (venta.estado !== 'pendiente') {
        throw makeError('Solo se pueden cancelar ventas pendientes', 400);
      }
      const updated = ventasStore.update(req.params.id, { 
        estado: 'cancelada', 
        updated_at: new Date().toISOString() 
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ventasController;