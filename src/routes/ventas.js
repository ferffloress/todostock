const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.get('/', ventasController.listar);
router.get('/:id', ventasController.obtener);
router.post('/', ventasController.crear);
router.patch('/:id/despachar', ventasController.despachar);
router.patch('/:id/cancelar', ventasController.cancelar);

module.exports = router;
