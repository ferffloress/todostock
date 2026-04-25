const express = require("express");
const router = express.Router();
const { obtenerLotes, obtenerLotePorId, obtenerLotesPorProducto } = require("../controllers/lotesController");

router.get("/", obtenerLotes);
router.get("/producto/:producto_id", obtenerLotesPorProducto);
router.get("/:id", obtenerLotePorId);

module.exports = router;
