const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/comprasController');
const Producto = require('../models/Producto');
const Proveedor = require('../models/Proveedor');
const Lote = require('../models/Lote');


router.get('/', comprasController.listarVista);
router.get('/ver/:id', comprasController.detalleVista);
router.post('/:id/recibir', comprasController.recibirVista);
router.post('/:id/cancelar', comprasController.cancelarVista);
router.get('/nueva', async (req, res, next) => {
  try {
    const [productos, proveedores, lotes] = await Promise.all([
      Producto.find().lean(),
      Proveedor.find().lean(),
      Lote.find().lean()
    ]);
    
    res.render('nuevaCompra', { 
      titulo: 'Registrar Compra', 
      productos: productos || [], 
      proveedores: proveedores || [], 
      lotes: lotes || []
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;