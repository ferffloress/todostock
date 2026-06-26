const express = require('express');
const router = express.Router();
const lotesController = require('../controllers/lotesController');

router.get('/', lotesController.listarVista);
router.get('/nuevo', lotesController.formularioNuevo);
router.post('/', lotesController.crear);
router.get('/producto/:producto_id', lotesController.listarPorProducto);
router.get('/:id/movimientos', lotesController.detalleVista);
router.get('/siguiente-numero', lotesController.siguienteNumero);
router.get('/:id', lotesController.obtener);
router.get('/:id/editar', lotesController.formularioEditar);
router.post('/:id/editar', lotesController.actualizar);
router.post('/:id/eliminar', lotesController.eliminar);

module.exports = router;
