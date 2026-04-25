const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventasController");

// --- 1. RUTAS DE VISTAS ---

// Listado general (donde están los botones de la tabla)
router.get("/", ventasController.listarVista); 
const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventasController");

// --- 1. RUTAS DE VISTAS ---

// Listado general
router.get("/", ventasController.listarVista); 

// Formulario de creación
router.get("/nueva", ventasController.formularioVenta); 

// Vista de detalle (Coincide con /ventas/ver/ID)
router.get("/ver/:id", ventasController.obtener);


// --- 2. RUTAS DE ACCIÓN (POST) ---

// Procesa la creación de la venta
router.post("/", ventasController.crear); 

/**
 * CORRECCIÓN: El navegador busca /ventas/despachar/ID.
 * Por eso ponemos "despachar" ANTES del ":id".
 */
router.post("/despachar/:id", ventasController.despachar);
router.post("/cancelar/:id", ventasController.cancelar);


// --- 3. RUTAS DE DATOS (API) ---

router.get("/api/json", ventasController.listar); 

module.exports = router;