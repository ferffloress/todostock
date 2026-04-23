const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotesController');

// GET /lotes
router.get('/', lotesController.listarVista);
 
// GET /lotes/producto/:producto_id
router.get('/producto/:producto_id', lotesController.listarPorProducto);
 
// GET /lotes/:id
router.get('/:id', lotesController.obtener);

module.exports = router;
