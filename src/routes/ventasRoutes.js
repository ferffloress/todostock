const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventasController");

router.get("/", ventasController.listar);
router.get("/:id", ventasController.obtener);

module.exports = router;
