const Compra = require('../models/Compra');
const Lote = require('../models/Lote');
const MovimientoStock = require('../models/MovimientoStock');
const createStore = require('../data/store');
const { validate } = require('../validators/comprasValidator');

const comprasStore = createStore('compras.json');
const proveedoresStore = createStore('proveedores.json');
const productosStore = createStore('productos.json');
const lotesStore = createStore('lotes.json');
const movimientosStore = createStore('movimientosStock.json');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const comprasController = {
  listar(req, res, next) {
    try {
      res.json(comprasStore.getAll());
    } catch (err) {
      next(err);
    }
  },

  obtener(req, res, next) {
    try {
      const compra = comprasStore.getById(req.params.id);
      if (!compra) throw makeError('Compra no encontrada', 404);
      res.json(compra);
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
      if (!proveedoresStore.getById(req.body.proveedor_id)) {
        throw makeError('Proveedor no encontrado', 404);
      }
      for (const item of req.body.items) {
        if (!productosStore.getById(item.producto_id)) {
          throw makeError(`Producto no encontrado: ${item.producto_id}`, 404);
        }
      }
      const items = req.body.items.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        numero_lote: item.numero_lote,
        fecha_vencimiento: item.fecha_vencimiento,
        subtotal: item.cantidad * item.precio_unitario,
      }));
      const total = items.reduce((sum, item) => sum + item.subtotal, 0);
      const compra = new Compra({ ...req.body, items, total });
      comprasStore.create(compra);
      res.status(201).json(compra);
    } catch (err) {
      next(err);
    }
  },

  recibir(req, res, next) {
    try {
      const compra = comprasStore.getById(req.params.id);
      if (!compra) throw makeError('Compra no encontrada', 404);
      if (compra.estado !== 'pendiente') {
        throw makeError(`No se puede recibir una compra en estado '${compra.estado}'`, 400);
      }
      for (const item of compra.items) {
        const lote = new Lote({
          producto_id: item.producto_id,
          proveedor_id: compra.proveedor_id,
          numero_lote: item.numero_lote,
          fecha_vencimiento: item.fecha_vencimiento,
          cantidad_inicial: item.cantidad,
          cantidad_actual: item.cantidad,
          costo_unitario: item.precio_unitario,
        });
        lotesStore.create(lote);
        const producto = productosStore.getById(item.producto_id);
        productosStore.update(item.producto_id, {
          stock_actual: producto.stock_actual + item.cantidad,
          updated_at: new Date().toISOString(),
        });
        const mov = new MovimientoStock({
          tipo: 'ingreso',
          producto_id: item.producto_id,
          lote_id: lote.id,
          cantidad: item.cantidad,
          referencia: compra.id,
          observaciones: `Recepción de compra ${compra.id}`,
        });
        movimientosStore.create(mov);
      }
      const updated = comprasStore.update(req.params.id, { estado: 'recibida', updated_at: new Date().toISOString() });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  cancelar(req, res, next) {
    try {
      const compra = comprasStore.getById(req.params.id);
      if (!compra) throw makeError('Compra no encontrada', 404);
      if (compra.estado !== 'pendiente') {
        throw makeError(`No se puede cancelar una compra en estado '${compra.estado}'`, 400);
      }
      const updated = comprasStore.update(req.params.id, { estado: 'cancelada', updated_at: new Date().toISOString() });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = comprasController;
