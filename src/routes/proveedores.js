const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');


router.get('/', proveedoresController.listarVista);
router.get('/nuevo', proveedoresController.formularioNuevo);
router.get('/:id/editar', proveedoresController.formularioEditar);
router.get('/:id', proveedoresController.obtener);
router.post('/', proveedoresController.crear);
router.put('/:id', proveedoresController.actualizar);
router.delete('/:id', proveedoresController.eliminar);

module.exports = router;
