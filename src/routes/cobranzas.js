const express = require('express');
const router = express.Router();
const cobranzasService = require('../services/cobranzasService');

// GET /cobranzas
router.get('/', (req, res, next) => {
  try {
    const cobranzas = cobranzasService.getAll();
    res.json(cobranzas);
  } catch (err) {
    next(err);
  }
});

// GET /cobranzas/:id
router.get('/:id', (req, res, next) => {
  try {
    const cobranza = cobranzasService.getById(req.params.id);
    res.json(cobranza);
  } catch (err) {
    next(err);
  }
});

// POST /cobranzas
router.post('/', (req, res, next) => {
  try {
    const cobranza = cobranzasService.create(req.body);
    res.status(201).json(cobranza);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
