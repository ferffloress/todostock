const express = require('express');
const router = express.Router();
const movimientosStockController = require('../controllers/movimientosStockController');

router.get('/', movimientosStockController.listar);
router.get('/producto/:producto_id', movimientosStockController.listarPorProducto);

module.exports = router;
