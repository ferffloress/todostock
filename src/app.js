const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const session = require('express-session');

//CONFIGURACIONES DEL SERVIDOR
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'todostock_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 8 }
}));

//CANDADO DE AUTENTICACIÓN
const protegerRuta = (req, res, next) => {
  if (req.session && req.session.usuarioLogueado === true) {
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

//RUTA TEMPORAL - carga datos de ejemplo desde los JSON
app.get('/cargar-datos', async (req, res) => {
  try {
    const Cliente = require('./models/Cliente');
    const Compra = require('./models/Compra');
    const Contador = require('./models/Contador');
    const CuentaCorriente = require('./models/CuentaCorriente');
    const Lote = require('./models/Lote');
    const MovimientoStock = require('./models/MovimientoStock');
    const Producto = require('./models/Producto');
    const Proveedor = require('./models/Proveedor');
    const Venta = require('./models/Venta');

    const clientes = require('./data/clientes.json');
    const compras = require('./data/compras.json');
    const contadores = require('./data/contadores.json');
    const cuentasCorrientes = require('./data/cuentasCorrientes.json');
    const lotes = require('./data/lotes.json');
    const movimientosStock = require('./data/movimientosStock.json');
    const productos = require('./data/productos.json');
    const proveedores = require('./data/proveedores.json');
    const ventas = require('./data/ventas.json');

    const colecciones = [
      { modelo: Cliente,         datos: clientes,          nombre: 'clientes' },
      { modelo: Compra,          datos: compras,           nombre: 'compras' },
      { modelo: Contador,        datos: contadores,        nombre: 'contadores' },
      { modelo: CuentaCorriente, datos: cuentasCorrientes, nombre: 'cuentasCorrientes' },
      { modelo: Lote,            datos: lotes,             nombre: 'lotes' },
      { modelo: MovimientoStock, datos: movimientosStock,  nombre: 'movimientosStock' },
      { modelo: Producto,        datos: productos,          nombre: 'productos' },
      { modelo: Proveedor,       datos: proveedores,        nombre: 'proveedores' },
      { modelo: Venta,           datos: ventas,             nombre: 'ventas' },
    ];

    const resultados = [];
    for (const { modelo, datos, nombre } of colecciones) {
      await modelo.deleteMany({});
      await modelo.insertMany(datos);
      resultados.push(`✓ ${nombre}: ${datos.length} documentos`);
    }
    res.send('<pre>' + resultados.join('\n') + '\n\nDatos cargados. Ya podés borrar esta ruta.</pre>');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

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
