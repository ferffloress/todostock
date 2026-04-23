const createStore = require('../data/store');

const store = createStore('lotes.json');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const lotesController = {
  listar(req, res, next) {
    try {
      res.json(store.getAll());
    } catch (err) {
      next(err);
    }
  },

    listarVista(req, res, next) {
    try {
      const lotes = store.getAll();
      res.render('lotes', { titulo: 'Gestión de Lotes (Stock)', lotes });
    } catch (err) {
      next(err);
    }
  },

  listarPorProducto(req, res, next) {
    try {
      const lotes = store.findWhere(l => l.producto_id === req.params.producto_id);
      res.json(lotes);
    } catch (err) {
      next(err);
    }
  },

  obtener(req, res, next) {
    try {
      const lote = store.getById(req.params.id);
      if (!lote) throw makeError('Lote no encontrado', 404);
      res.json(lote);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = lotesController;
