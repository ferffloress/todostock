const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Routes
const productosRouter = require('./routes/productos');
const proveedoresRouter = require('./routes/proveedores');
const clientesRouter = require('./routes/clientes');
const lotesRouter = require('./routes/lotes');
const comprasRouter = require('./routes/compras');
const ventasRouter = require('./routes/ventas');
const cobranzasRouter = require('./routes/cobranzas');
const movimientosStockRouter = require('./routes/movimientosStock');
const alertasRouter = require('./routes/alertas');
const resumenesRouter = require('./routes/resumenes');

app.use('/productos', productosRouter);
app.use('/proveedores', proveedoresRouter);
app.use('/clientes', clientesRouter);
app.use('/lotes', lotesRouter);
app.use('/compras', comprasRouter);
app.use('/ventas', ventasRouter);
app.use('/cobranzas', cobranzasRouter);
app.use('/movimientos-stock', movimientosStockRouter);
app.use('/alertas', alertasRouter);
app.use('/resumen', resumenesRouter);

// Run seed on startup
const seed = require('./seed');
seed();

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    ...(err.details && { details: err.details }),
  });
});

module.exports = app;
