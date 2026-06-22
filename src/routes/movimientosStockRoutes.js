const express = require("express");
const router = express.Router();
const { listar, listarPorProducto  } = require("../controllers/movimientosStockController");

router.get("/", listar);
router.get("/:producto_id", listarPorProducto);

module.exports = router;
