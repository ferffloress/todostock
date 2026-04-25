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
      const { errors } = validate(req.body);
      if (errors.length > 0) {
        const err = makeError('Datos inválidos', 422);
        err.details = errors;
        throw err;
      }
      const cliente = clientesStore.getById(req.body.cliente_id);
      if (!cliente) throw makeError('Cliente no encontrado', 404);

      const itemsConLote = [];
      for (const item of req.body.items) {
        const producto = productosStore.getById(item.producto_id);
        if (!producto) throw makeError(`Producto no encontrado: ${item.producto_id}`, 404);

        const lotesActivos = lotesStore
          .findWhere(l => l.producto_id === item.producto_id && l.cantidad_actual > 0)
          .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

        const stockTotal = lotesActivos.reduce((sum, l) => sum + l.cantidad_actual, 0);
        if (stockTotal < item.cantidad) {
          throw makeError(`Stock insuficiente para producto ${producto.nombre}`, 400);
        }

        let remaining = item.cantidad;
        const loteAssignments = [];
        for (const lote of lotesActivos) {
          if (remaining <= 0) break;
          const consume = Math.min(remaining, lote.cantidad_actual);
          loteAssignments.push({ lote_id: lote.id, cantidad: consume });
          remaining -= consume;
        }

        itemsConLote.push({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.cantidad * item.precio_unitario,
          lote_id: loteAssignments[0].lote_id,
          lote_assignments: loteAssignments,
        });
      }

      const total = itemsConLote.reduce((sum, item) => sum + item.subtotal, 0);
      if (cliente.saldo_cuenta_corriente + total > cliente.limite_credito) {
        throw makeError('Límite de crédito insuficiente', 400);
      }

      const venta = new Venta({ ...req.body, items: itemsConLote, total });
      ventasStore.create(venta);
      res.status(201).json(venta);
    } catch (err) {
      next(err);
    }
  },

  despachar(req, res, next) {
    try {
      const venta = ventasStore.getById(req.params.id);
      if (!venta) throw makeError('Venta no encontrada', 404);
      if (venta.estado !== 'pendiente') {
        throw makeError(`No se puede despachar una venta en estado '${venta.estado}'`, 400);
      }

      for (const item of venta.items) {
        const assignments = item.lote_assignments || [{ lote_id: item.lote_id, cantidad: item.cantidad }];
        for (const assignment of assignments) {
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
            observaciones: `Despacho de venta ${venta.id}`,
          });
          movimientosStore.create(mov);
        }
      }

      const cliente = clientesStore.getById(venta.cliente_id);
      const nuevoSaldo = cliente.saldo_cuenta_corriente + venta.total;
      const movCC = new CuentaCorriente({
        cliente_id: venta.cliente_id,
        tipo: 'debito',
        monto: venta.total,
        referencia: venta.id,
        descripcion: 'Venta despachada',
        saldo_resultante: nuevoSaldo,
      });
      cuentasStore.create(movCC);
      clientesStore.update(venta.cliente_id, {
        saldo_cuenta_corriente: nuevoSaldo,
        updated_at: new Date().toISOString(),
      });

      const updated = ventasStore.update(req.params.id, { estado: 'despachada', updated_at: new Date().toISOString() });
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
        throw makeError(`No se puede cancelar una venta en estado '${venta.estado}'`, 400);
      }
      const updated = ventasStore.update(req.params.id, { estado: 'cancelada', updated_at: new Date().toISOString() });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = ventasController;
