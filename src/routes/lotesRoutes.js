const express = require("express");
const router = express.Router();
const { listar, obtener, listarPorProducto  } = require("../controllers/lotesController");

router.get("/", listar);
router.get("/producto/:producto_id", listarPorProducto );
router.get("/:id", obtener);

module.exports = router;
