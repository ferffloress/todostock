const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotesController');

// GET /lotes
router.get('/', lotesController.listarVista);

// GET /lotes/nuevo
router.get('/nuevo', lotesController.formularioNuevo);

// POST /lotes
router.post('/', lotesController.crear);

// GET /lotes/producto/:producto_id
router.get('/producto/:producto_id', lotesController.listarPorProducto);

// GET /lotes/:id/movimientos
router.get('/:id/movimientos', lotesController.detalleVista);

// GET /lotes/:id
router.get('/:id', lotesController.obtener);

module.exports = router;
