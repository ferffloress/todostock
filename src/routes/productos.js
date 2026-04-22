const express = require('express');
const router = express.Router();
const productosService = require('../services/productosService');

// GET /productos
router.get('/', (req, res, next) => {
  try {
    const productos = productosService.getAll();
    res.render('productos', {
      titulo: 'Listado de Productos',
      productos
    });
  } catch (err) {
    next(err);
  }
});

// GET /productos/nuevo-producto 
router.get('/nuevo-producto', (req, res) => {
  res.render('nuevoProducto', { titulo: 'Nuevo Producto' });
});


// GET /productos/:id
router.get('/:id', (req, res, next) => {
  try {
    const producto = productosService.getById(req.params.id);
    res.json(producto);
  } catch (err) {
    next(err);
  }
});

// POST /productos
router.post('/', (req, res, next) => {
  try {
    const producto = productosService.create(req.body);
    res.status(201).json(producto);
  } catch (err) {
    next(err);
  }
});

// PUT /productos/:id
router.put('/:id', (req, res, next) => {
  try {
    const producto = productosService.update(req.params.id, req.body);
    res.json(producto);
  } catch (err) {
    next(err);
  }
});

// DELETE /productos/:id
router.delete('/:id', (req, res, next) => {
  try {
    productosService.delete(req.params.id);
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
