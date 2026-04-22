const express = require('express');
const router = express.Router();
const clientesService = require('../services/clientesService');
const cuentasCorrientesService = require('../services/cuentasCorrientesService');

// GET /clientes
router.get('/', (req, res, next) => {
  try {
    const clientes = clientesService.getAll();
    res.render('clientes', { 
        titulo: 'Listado de Clientes', 
        clientes: clientes 
    });
  } catch (err) {
    next(err);
  }
});

// GET /clientes/:id/cuenta-corriente
router.get('/:id/cuenta-corriente', (req, res, next) => {
  try {
    const cliente = clientesService.getById(req.params.id);
    const cuentaCorriente = cuentasCorrientesService.getByCliente(req.params.id);

    res.render('cuentaCorriente', {
      titulo: 'Cuenta Corriente',
      cliente: {
        ...cliente,
        movimientos: cuentaCorriente.movimientos,
        saldo_actual: cuentaCorriente.saldo_actual,
        limite_credito: cuentaCorriente.limite_credito ?? cliente.limite_credito
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /nuevo-cliente
router.get('/nuevo-cliente', (req, res) => {
  res.render('nuevoCliente', { titulo: 'Alta Nuevo Cliente' });
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
