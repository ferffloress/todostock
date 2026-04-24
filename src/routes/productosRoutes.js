const express = require("express");
const router = express.Router();
const { listarJSON, obtener, crear, actualizar, eliminar } = require("../controllers/productosController");

router.get("/", listarJSON);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

module.exports = router;
