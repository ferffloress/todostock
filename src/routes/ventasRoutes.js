const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventasController");

// --- 1. RUTAS DE VISTAS ---

// Listado vistas
router.get("/", ventasController.listarVista); 
router.get("/nueva", ventasController.formularioVenta); 
router.get("/ver/:id", ventasController.obtener);


// --- 2. RUTAS DE ACCIÓN (POST) ---

router.post("/", ventasController.crear); 
router.post("/despachar/:id", ventasController.despachar);
router.post("/cancelar/:id", ventasController.cancelar);


// --- 3. RUTAS DE DATOS (API) ---

router.get("/api/json", ventasController.listar); 

module.exports = router;