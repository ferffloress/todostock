const express = require("express");
const router = express.Router();
const { listarJSON, obtener, crear, actualizar, eliminar } = require("../controllers/clientesController");
const { soloAdmin } = require("../controllers/authController");

router.get("/", listarJSON);
router.get("/:id", obtener);
router.post("/", crear);
router.put("/:id", actualizar);
router.delete("/:id", soloAdmin, eliminar);

module.exports = router;
