const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

// GET /ventas
router.get('/', ventasController.listarVista);

// GET /ventas/:id
router.get('/:id', ventasController.obtener);

// POST /ventas
router.post('/', ventasController.crear);

// PATCH /ventas/:id/despachar
router.patch('/:id/despachar', ventasController.despachar);

// PATCH /ventas/:id/cancelar
router.patch('/:id/cancelar', ventasController.cancelar);

module.exports = router;
