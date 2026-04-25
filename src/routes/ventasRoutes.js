const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventasController");

// --- 1. RUTAS DE VISTAS (Prioridad Alta) ---

// Renderiza el listado general de ventas
router.get("/", ventasController.listarVista); 

// Renderiza el formulario (Asegúrate de que esté arriba de /:id)
router.get("/nueva", ventasController.formularioVenta); 


// --- 2. RUTAS DE ACCIÓN (POST/PATCH) ---

// Recibe el formulario de 'nuevaVenta.pug' (con unidades y bultos)
router.post("/", ventasController.crear); 

// Acciones de estado (se disparan desde botones en la tabla)
router.patch("/:id/despachar", ventasController.despachar);
router.patch("/:id/cancelar", ventasController.cancelar);


// --- 3. RUTAS DE DATOS (API / Consultas) ---

// Devuelve el JSON de todas las ventas (para reportes o Excel)
router.get("/api/json", ventasController.listar); 

// Devuelve el JSON de una sola venta (por si necesitas un modal de detalle)
router.get("/:id", ventasController.obtener);

module.exports = router;
