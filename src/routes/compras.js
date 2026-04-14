const express = require('express');
const router = express.Router();
const comprasService = require('../services/comprasService');

// GET /compras
router.get('/', (req, res, next) => {
  try {
    const compras = comprasService.getAll();
    res.json(compras);
  } catch (err) {
    next(err);
  }
});

// GET /compras/:id
router.get('/:id', (req, res, next) => {
  try {
    const compra = comprasService.getById(req.params.id);
    res.json(compra);
  } catch (err) {
    next(err);
  }
});

// POST /compras
router.post('/', (req, res, next) => {
  try {
    const compra = comprasService.create(req.body);
    res.status(201).json(compra);
  } catch (err) {
    next(err);
  }
});

// PATCH /compras/:id/recibir
router.patch('/:id/recibir', (req, res, next) => {
  try {
    const compra = comprasService.recibir(req.params.id);
    res.json(compra);
  } catch (err) {
    next(err);
  }
});

// PATCH /compras/:id/cancelar
router.patch('/:id/cancelar', (req, res, next) => {
  try {
    const compra = comprasService.cancelar(req.params.id);
    res.json(compra);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
