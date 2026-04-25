const Proveedor = require('../models/Proveedor');
const createStore = require('../data/store');
const { validate } = require('../validators/proveedoresValidator');
const comprasStore = createStore('compras.json');

const store = createStore('proveedores.json');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const proveedoresController = {
  listar(req, res, next) {
    try {
      res.json(store.getAll());
    } catch (err) {
      next(err);
    }
  },

  listarVista(req, res, next) {
    try {
      const proveedores = store.getAll();
      res.render('proveedores', { titulo: 'Listado de Proveedores', proveedores });
    } catch (err) {
      next(err);
    }
  },

  obtener(req, res, next) {
    try {
      const proveedor = store.getById(req.params.id);
      if (!proveedor) throw makeError('Proveedor no encontrado', 404);
      res.json(proveedor);
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
      const proveedor = new Proveedor(req.body);
      store.create(proveedor);
      res.status(201).json(proveedor);
    } catch (err) {
      next(err);
    }
  },

  actualizar(req, res, next) {
    try {
      const existing = store.getById(req.params.id);
      if (!existing) throw makeError('Proveedor no encontrado', 404);
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
      if (!existing) throw makeError('Proveedor no encontrado', 404);
      const compras = comprasStore.findWhere(c => c.proveedor_id === req.params.id);
      if (compras.length > 0) throw makeError('No se puede eliminar: el proveedor tiene compras registradas', 400);
      store.delete(req.params.id);
      res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = proveedoresController;
