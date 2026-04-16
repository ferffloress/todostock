const express = require('express');
const router = express.Router();
const clientesService = require('../services/clientesService');
const cuentasCorrientesService = require('../services/cuentasCorrientesService');

// GET /clientes
router.get('/', (req, res, next) => {
  try {
    const clientes = clientesService.getAll();
    res.json(clientes);
  } catch (err) {
    next(err);
  }
});

// GET /clientes/:id/cuenta-corriente
router.get('/:id/cuenta-corriente', (req, res, next) => {
  try {
    const cuentaCorriente = cuentasCorrientesService.getByCliente(req.params.id);
    res.json(cuentaCorriente);
  } catch (err) {
    next(err);
  }
});

// GET /clientes/:id
router.get('/:id', (req, res, next) => {
  try {
    const cliente = clientesService.getById(req.params.id);
    res.json(cliente);
  } catch (err) {
    next(err);
  }
});

// POST /clientes
router.post('/', (req, res, next) => {
  try {
    const cliente = clientesService.create(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
});

// PUT /clientes/:id
router.put('/:id', (req, res, next) => {
  try {
    const cliente = clientesService.update(req.params.id, req.body);
    res.json(cliente);
  } catch (err) {
    next(err);
  }
});

// DELETE /clientes/:id
router.delete('/:id', (req, res, next) => {
  try {
    clientesService.delete(req.params.id);
    res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
