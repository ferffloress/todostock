const express = require("express");
const router = express.Router();
const { obtenerMovimientos, obtenerMovimientosPorProducto } = require("../controllers/movimientosStockController");

router.get("/", obtenerMovimientos);
router.get("/producto/:producto_id", obtenerMovimientosPorProducto);

module.exports = router;
