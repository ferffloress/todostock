const express = require('express');
const router = express.Router();
const lotesService = require('../services/lotesService');
const lotesController = require('../controllers/lotesController');

// GET /lotes
router.get('/', (req, res, next) => {
  try {
    const lotes = lotesService.getAll();
     res.render('lotes', { 
      titulo: 'Gestión de Lotes (Stock)', 
      lotes: lotes 
    });
  } catch (err) {
    next(err);
  }
});

// GET /lotes/producto/:producto_id
router.get('/producto/:producto_id', (req, res, next) => {
  try {
    const lotes = lotesService.getByProducto(req.params.producto_id);
    res.json(lotes);
  } catch (err) {
    next(err);
  }
});

// GET /lotes/:id
router.get('/:id', (req, res, next) => {
  try {
    const lote = lotesService.getById(req.params.id);
    res.json(lote);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
