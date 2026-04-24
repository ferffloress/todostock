const express = require('express');
const router = express.Router();
const resumenesController = require('../controllers/resumenesController');

router.get('/inventario', resumenesController.inventario);
router.get('/caja', resumenesController.caja);
router.get('/ventas', resumenesController.ventas);

module.exports = router;
