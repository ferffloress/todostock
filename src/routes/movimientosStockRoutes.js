const express = require("express");
const router = express.Router();
const { listar, listarPorProducto  } = require("../controllers/movimientosStockController");

router.get("/", listar);
router.get("/:id", listarPorProducto );

module.exports = router;
