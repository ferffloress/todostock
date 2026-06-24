const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');


router.get('/', ventasController.listarVista);
router.get('/nueva-venta', ventasController.formularioVenta);
router.get('/ver/:id', ventasController.detalleVista);
router.post('/', ventasController.crear);
router.post('/despachar/:id', ventasController.despachar);
router.post('/eliminar/:id', ventasController.cancelar);

module.exports = router;
