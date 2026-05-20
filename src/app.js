const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //leer datos de formularios

//vistas
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

//api
const apiProductosRouter = require('./routes/productosRoutes');
const apiProveedoresRouter = require('./routes/proveedoresRoutes');
const apiClientesRouter = require('./routes/clientesRoutes');
const apiVentasRouter      = require('./routes/ventasRoutes');
const apiLotesRouter       = require('./routes/lotesRoutes');
const apiComprasRouter     = require('./routes/comprasRoutes');
const apiMovimientosRouter = require('./routes/movimientosStockRoutes');
const apiCuentasRouter     = require('./routes/cuentasCorrientesRoutes');


app.use('/api/productos', apiProductosRouter);
app.use('/api/proveedores', apiProveedoresRouter);
app.use('/api/clientes', apiClientesRouter);
app.use('/api/ventas', apiVentasRouter);
app.use('/api/lotes', apiLotesRouter);
app.use('/api/compras', apiComprasRouter);
app.use('/api/movimientos-stock', apiMovimientosRouter);
app.use('/api/cuentas-corrientes', apiCuentasRouter);

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
