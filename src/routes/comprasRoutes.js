const express = require("express");
const router = express.Router();
const { obtenerCompras, obtenerCompraPorId, crearCompra, recibirCompra, cancelarCompra } = require("../controllers/comprasController");

router.get("/", obtenerCompras);
router.get("/:id", obtenerCompraPorId);
router.post("/", crearCompra);
router.patch("/:id/recibir", recibirCompra);
router.patch("/:id/cancelar", cancelarCompra);

module.exports = router;
