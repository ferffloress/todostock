const express = require("express");
const router = express.Router();
const { listar, obtener, crear, recibir, cancelar } = require("../controllers/comprasController");

router.get("/", listar);
router.get("/:id", obtener);
router.post("/", crear);
router.patch("/:id/recibir", recibir);
router.patch("/:id/cancelar", cancelar);

module.exports = router;
