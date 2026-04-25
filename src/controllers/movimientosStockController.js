const createStore = require('../data/store');

const store = createStore('movimientosStock.json');

const movimientosStockController = {
  listar(req, res, next) {
    try {
      res.json(store.getAll());
    } catch (err) {
      next(err);
    }
  },

  listarPorProducto(req, res, next) {
    try {
      const movimientos = store.findWhere(m => m.producto_id === req.params.producto_id);
      res.json(movimientos);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = movimientosStockController;
