const express = require('express');
const router = express.Router();
const movimientosStockService = require('../services/movimientosStockService');

// GET /movimientos-stock
router.get('/', (req, res, next) => {
  try {
    const movimientos = movimientosStockService.getAll();
    res.json(movimientos);
  } catch (err) {
    next(err);
  }
});

// GET /movimientos-stock/producto/:producto_id
router.get('/producto/:producto_id', (req, res, next) => {
  try {
    const movimientos = movimientosStockService.getByProducto(req.params.producto_id);
    res.json(movimientos);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
