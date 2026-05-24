const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');
const Producto = require('../models/Producto');
const Proveedor = require('../models/Proveedor');

// GET /compras - Listado de compras
router.get('/', comprasController.listarVista);

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