const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');

// GET /compras
router.get('/', comprasController.listarVista);
 
// GET /compras/:id
router.get('/:id', comprasController.obtener);
 
// POST /compras
router.post('/', comprasController.crear);
 
// PATCH /compras/:id/recibir
router.patch('/:id/recibir', comprasController.recibir);
 
// PATCH /compras/:id/cancelar
router.patch('/:id/cancelar', comprasController.cancelar);

module.exports = router;
