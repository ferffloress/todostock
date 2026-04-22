const express = require('express');
const router = express.Router();
const ventasService = require('../services/ventasService');

// GET /ventas
router.get('/', (req, res, next) => {
  try {
    const ventas = ventasService.getAll();
    res.render('ventas', { titulo: 'Ventas', ventas: ventas })
  } catch (err) {
    next(err);
  }
});

// GET /ventas/:id
router.get('/:id', (req, res, next) => {
  try {
    const venta = ventasService.getById(req.params.id);
    res.json(venta);
  } catch (err) {
    next(err);
  }
});

// POST /ventas
router.post('/', (req, res, next) => {
  try {
    const venta = ventasService.create(req.body);
    res.status(201).json(venta);
  } catch (err) {
    next(err);
  }
});

// PATCH /ventas/:id/despachar
router.patch('/:id/despachar', (req, res, next) => {
  try {
    const venta = ventasService.despachar(req.params.id);
    res.json(venta);
  } catch (err) {
    next(err);
  }
});

// PATCH /ventas/:id/cancelar
router.patch('/:id/cancelar', (req, res, next) => {
  try {
    const venta = ventasService.cancelar(req.params.id);
    res.json(venta);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
