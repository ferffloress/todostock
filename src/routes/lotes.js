const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotesController');

router.get('/', lotesController.listar);
router.get('/producto/:producto_id', lotesController.listarPorProducto);
router.get('/:id', lotesController.obtener);

module.exports = router;
