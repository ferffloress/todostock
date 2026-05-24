const express = require('express');
const router = express.Router();
const { listar, obtener, crear, recibir, cancelar } = require('../controllers/comprasController');

router.get("/", listar);
router.post("/", crear);
router.patch("/:id/recibir", recibir);
router.patch("/:id/cancelar", cancelar);
router.get("/:id", obtener);

module.exports = router;
