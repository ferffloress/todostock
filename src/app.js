const express = require('express');
const app = express();
const path = require('path');

//CONFIGURACIONES DEL SERVIDOR
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//MIDDLEWARES 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//CANDADO DE AUTENTICACIÓN
const protegerRuta = (req, res, next) => {
  if (global.usuarioLogueado === true) {
    next(); 
  } else {
    res.redirect('/login'); 
  }
};

//IMPORTACIÓN DE ENRUTADORES
const authRouter = require('./routes/authRoutes');
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

//APIs 
const apiProductosRouter = require('./routes/productosRoutes');
const apiProveedoresRouter = require('./routes/proveedoresRoutes');
const apiClientesRouter = require('./routes/clientesRoutes');
const apiVentasRouter = require('./routes/ventasRoutes');
const apiLotesRouter = require('./routes/lotesRoutes');
const apiComprasRouter = require('./routes/comprasRoutes');
const apiMovimientosRouter = require('./routes/movimientosStockRoutes');

app.use('/api/productos', apiProductosRouter);
app.use('/api/proveedores', apiProveedoresRouter);
app.use('/api/clientes', apiClientesRouter);
app.use('/api/ventas', apiVentasRouter);
app.use('/api/lotes', apiLotesRouter);
app.use('/api/compras', apiComprasRouter);
app.use('/api/movimientos-stock', apiMovimientosRouter);

try {
  const apiCuentasRouter = require('./routes/cuentasCorrientesRoutes');
  app.use('/api/cuentas-corrientes', apiCuentasRouter);
} catch (error) {
  console.log("Nota: Las rutas de cuentas-corrientes no se cargaron.");
}

//RUTAS DE VISTAS
app.get('/', protegerRuta, (req, res) => {
  res.render('index');
});

app.use('/', authRouter);
app.use('/productos', protegerRuta, productosRouter);
app.use('/proveedores', protegerRuta, proveedoresRouter);
app.use('/clientes', protegerRuta, clientesRouter);
app.use('/lotes', protegerRuta, lotesRouter);
app.use('/compras', protegerRuta, comprasRouter);
app.use('/ventas', protegerRuta, ventasRouter);
app.use('/cobranzas', protegerRuta, cobranzasRouter);
app.use('/movimientos-stock', protegerRuta, movimientosStockRouter);
app.use('/alertas', protegerRuta, alertasRouter);
app.use('/resumen', protegerRuta, resumenesRouter);

//MANEJO DE ERRORES 
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
