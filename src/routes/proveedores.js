const express = require('express');
const router = express.Router();
const proveedoresService = require('../services/proveedoresService');

// GET /proveedores
router.get('/', (req, res, next) => {
  try {
    const proveedores = proveedoresService.getAll();
    res.render('proveedores', { 
      titulo: 'Listado de Proveedores', 
      proveedores: proveedores 
    });
  } catch (err) {
    next(err);
  }
});

// GET /proveedores/:id
router.get('/:id', (req, res, next) => {
  try {
    const proveedor = proveedoresService.getById(req.params.id);
    res.json(proveedor);
  } catch (err) {
    next(err);
  }
});

// POST /proveedores
router.post('/', (req, res, next) => {
  try {
    const proveedor = proveedoresService.create(req.body);
    res.status(201).json(proveedor);
  } catch (err) {
    next(err);
  }
});

// PUT /proveedores/:id
router.put('/:id', (req, res, next) => {
  try {
    const proveedor = proveedoresService.update(req.params.id, req.body);
    res.json(proveedor);
  } catch (err) {
    next(err);
  }
});

// DELETE /proveedores/:id
router.delete('/:id', (req, res, next) => {
  try {
    proveedoresService.delete(req.params.id);
    res.status(200).json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
