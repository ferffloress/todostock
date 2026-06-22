const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');
const Producto = require('../models/Producto');
const Proveedor = require('../models/Proveedor');

// GET /compras - Listado de compras
router.get('/', comprasController.listarVista);

// GET /compras/ver/:id - Detalle de compra
router.get('/ver/:id', comprasController.detalleVista);

// POST /compras/:id/recibir
router.post('/:id/recibir', comprasController.recibirVista);

// POST /compras/:id/cancelar
router.post('/:id/cancelar', comprasController.cancelarVista);

// GET /compras/nueva - Formulario
router.get('/nueva', async (req, res, next) => {
  try {
    const [productos, proveedores] = await Promise.all([
      Producto.find().lean(),
      Proveedor.find().lean()
    ]);
    
    res.render('nuevaCompra', { 
      titulo: 'Registrar Compra', 
      productos: productos || [], 
      proveedores: proveedores || [] 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;