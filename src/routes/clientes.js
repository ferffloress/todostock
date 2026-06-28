const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/', clientesController.listar);
router.get('/nuevo-cliente', clientesController.formularioNuevo);
router.get('/:id/cuenta-corriente', clientesController.cuentaCorriente);
router.get('/:id/cobrar', clientesController.formularioCobrar);
router.post('/:id/cobrar', clientesController.registrarCobro);
router.get('/:id', clientesController.obtener);
router.get('/:id/editar', clientesController.formularioEditar);
router.post('/', clientesController.crear);
router.put('/:id', clientesController.actualizar);
router.delete('/:id', clientesController.eliminar);

module.exports = router;
