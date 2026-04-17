const express = require("express");
const app = express();

app.use(express.json());

const productosRoutes = require("./src/routes/productosRoutes");
const proveedoresRoutes = require("./src/routes/proveedoresRoutes");
const clientesRoutes = require("./src/routes/clientesRoutes");
const ventasRoutes = require("./src/routes/ventasRoutes");
const comprasRoutes = require("./src/routes/comprasRoutes");
const lotesRoutes = require("./src/routes/lotesRoutes");
const movimientosStockRoutes = require("./src/routes/movimientosStockRoutes");
const cuentasCorrientesRoutes = require("./src/routes/cuentasCorrientesRoutes");

app.use("/productos", productosRoutes);
app.use("/proveedores", proveedoresRoutes);
app.use("/clientes", clientesRoutes);
app.use("/ventas", ventasRoutes);
app.use("/compras", comprasRoutes);
app.use("/lotes", lotesRoutes);
app.use("/movimientos-stock", movimientosStockRoutes);
app.use("/cuentas-corrientes", cuentasCorrientesRoutes);

app.use((req, res) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

module.exports = app;
