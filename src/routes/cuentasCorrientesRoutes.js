const express = require("express");
const router = express.Router();
const { obtenerCuentaPorCliente } = require("../controllers/cuentasCorrientesController");

router.get("/:cliente_id", obtenerCuentaPorCliente);

module.exports = router;
