const express = require("express");
const router = express.Router();
const { obtenerVentas, obtenerVentaPorId, crearVenta, despacharVenta, cancelarVenta } = require("../controllers/ventasController");

router.get("/", obtenerVentas);
router.get("/:id", obtenerVentaPorId);
router.post("/", crearVenta);
router.patch("/:id/despachar", despacharVenta);
router.patch("/:id/cancelar", cancelarVenta);

module.exports = router;
