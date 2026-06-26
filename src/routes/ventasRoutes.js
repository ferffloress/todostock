const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventasController");

router.get("/", ventasController.listarVista); 
router.get("/nueva", ventasController.formularioVenta); 
router.get("/ver/:id", ventasController.obtener);
router.post("/", ventasController.crear); 
router.post("/despachar/:id", ventasController.despachar);
router.post("/cancelar/:id", ventasController.cancelar);
router.get("/api/json", ventasController.listar); 

module.exports = router;