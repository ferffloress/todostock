const Producto = require('../models/Producto');
const createStore = require('../data/store');
const { validate } = require('../validators/productosValidator');
const ventasStore = createStore('ventas.json');
const lotesStore = createStore('lotes.json');

const store = createStore('productos.json');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const productosController = {
  listar(req, res, next) {
    try {
      const productos = store.getAll();
      res.render('productos', { titulo: 'Listado de Productos', productos });
    } catch (err) {
      next(err);
    }
  },

  formularioNuevo(req, res) {
    res.render('nuevoProducto', { titulo: 'Nuevo Producto' });
  },

  obtener(req, res, next) {
    try {
      const producto = store.getById(req.params.id);
      if (!producto) throw makeError('Producto no encontrado', 404);
      res.json(producto);
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
      const producto = new Producto(req.body);
      store.create(producto);
      res.status(201).json(producto);
    } catch (err) {
      next(err);
    }
  },

  actualizar(req, res, next) {
    try {
      const existing = store.getById(req.params.id);
      if (!existing) throw makeError('Producto no encontrado', 404);
      const merged = { ...existing, ...req.body };
      const { errors } = validate(merged);
      if (errors.length > 0) {
        const err = makeError('Datos inválidos', 422);
        err.details = errors;
        throw err;
      }
      const updated = store.update(req.params.id, { ...req.body, updated_at: new Date().toISOString() });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  eliminar(req, res, next) {
    try {
      const existing = store.getById(req.params.id);
      if (!existing) throw makeError('Producto no encontrado', 404);
      const ventas = ventasStore.findWhere(v => v.items.some(i => i.producto_id === req.params.id));
      const lotes = lotesStore.findWhere(l => l.producto_id === req.params.id);
      if (ventas.length > 0) throw makeError('No se puede eliminar: el producto tiene ventas activas', 400);
      if (lotes.length > 0) throw makeError('No se puede eliminar: el producto tiene lotes registrados', 400);
      store.delete(req.params.id);
      res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = productosController;
