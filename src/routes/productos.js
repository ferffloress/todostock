const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/', productosController.listar);
router.get('/nuevo-producto', productosController.formularioNuevo);
router.get('/:id/editar', productosController.formularioEditar);
router.get('/:id', productosController.obtener);
router.post('/', productosController.crear);
router.put('/:id', productosController.actualizar);
router.delete('/:id', productosController.eliminar);

module.exports = router;
