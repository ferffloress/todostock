const express = require('express');
const router = express.Router();
const resumenesService = require('../services/resumenesService');

// GET /resumen/inventario
router.get('/inventario', (req, res, next) => {
  try {
    const inventario = resumenesService.getInventario();
    res.json(inventario);
  } catch (err) {
    next(err);
  }
});

// GET /resumen/caja
router.get('/caja', (req, res, next) => {
  try {
    const caja = resumenesService.getCaja();
    res.json(caja);
  } catch (err) {
    next(err);
  }
});

// GET /resumen/ventas
router.get('/ventas', (req, res, next) => {
  try {
    const ventas = resumenesService.getVentas();
    res.json(ventas);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
