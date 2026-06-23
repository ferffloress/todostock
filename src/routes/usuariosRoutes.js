const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

router.get('/', usuariosController.listar);
router.post('/:id/rol', usuariosController.cambiarRol);
router.get('/:id/editar', usuariosController.mostrarEditar);
router.post('/:id/editar', usuariosController.editar);
router.post('/:id/rol', usuariosController.cambiarRol);
router.post('/:id/eliminar', usuariosController.eliminar);


module.exports = router;