const MovimientoStock  = require('../models/MovimientoStock');

const movimientosStockController = {
  async listar(req, res, next) {
    try {
      res.json((await MovimientoStock.find()).toSorted({ fecha: -1 }));
    } catch (err) {
      next(err);
    }
  },

  async listarPorProducto(req, res, next) {
    try {
      const movimientos = await MovimientoStock.find({ producto_id: Number(req.params.producto_id) }).sort({ fecha: -1});
      res.json(movimientos);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = movimientosStockController;
