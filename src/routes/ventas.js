const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

// Listado principal
router.get('/', ventasController.listarVista);

// Formulario de creación
router.get('/nueva-venta', ventasController.formularioVenta);

// Detalle de una venta específica (coincide con /ventas/ver/:id)
router.get('/ver/:id', ventasController.obtener);

// Crear la venta (Procesa el formulario de nueva-venta)
router.post('/', ventasController.crear);

// Acciones de cambio de estado (Cambiamos PATCH por POST para compatibilidad con el Form de Pug)
router.post('/despachar/:id', ventasController.despachar);
router.post('/eliminar/:id', ventasController.cancelar);

module.exports = router;
