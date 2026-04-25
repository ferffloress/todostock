const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

// GET /proveedores
router.get('/', proveedoresController.listarVista);
 
// GET /proveedores/:id
router.get('/:id', proveedoresController.obtener);
 
// POST /proveedores
router.post('/', proveedoresController.crear);
 
// PUT /proveedores/:id
router.put('/:id', proveedoresController.actualizar);
 
// DELETE /proveedores/:id
router.delete('/:id', proveedoresController.eliminar);

module.exports = router;
