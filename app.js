require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src/views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //leer datos de formularios

const productosRouter = require('./src/routes/productos');
const proveedoresRouter = require('./src/routes/proveedores');
const clientesRouter = require('./src/routes/clientes');
const apiProductosRouter = require('./src/routes/productosRoutes');
const apiProveedoresRouter = require('./src/routes/proveedoresRoutes');
const apiClientesRouter = require('./src/routes/clientesRoutes');
const lotesRouter = require('./src/routes/lotes');
const comprasRouter = require('./src/routes/compras');
const ventasRouter = require('./src/routes/ventas');
const apiVentasRouter = require('./src/routes/ventasRoutes');
const cobranzasRouter = require('./src/routes/cobranzas');
const movimientosStockRouter = require('./src/routes/movimientosStock');
const alertasRouter = require('./src/routes/alertas');
const resumenesRouter = require('./src/routes/resumenes');

app.use('/productos', productosRouter);
app.use('/proveedores', proveedoresRouter);
app.use('/clientes', clientesRouter);
app.use('/api/productos', apiProductosRouter);
app.use('/api/proveedores', apiProveedoresRouter);
app.use('/api/clientes', apiClientesRouter);
app.use('/lotes', lotesRouter);
app.use('/compras', comprasRouter);
app.use('/ventas', ventasRouter);
app.use('/api/ventas', apiVentasRouter);
app.use('/cobranzas', cobranzasRouter);
app.use('/movimientos-stock', movimientosStockRouter);
app.use('/alertas', alertasRouter);
app.use('/resumen', resumenesRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
    ...(err.details && { details: err.details }),
  });
});

module.exports = app;
