require('dotenv').config();
const mongoose = require('mongoose');
const conectarDB = require('./src/config/db');

const Cliente = require('./src/models/Cliente');
const Compra = require('./src/models/Compra');
const Contador = require('./src/models/Contador');
const CuentaCorriente = require('./src/models/CuentaCorriente');
const Lote = require('./src/models/Lote');
const MovimientoStock = require('./src/models/MovimientoStock');
const Producto = require('./src/models/Producto');
const Proveedor = require('./src/models/Proveedor');
const Venta = require('./src/models/Venta');
const Usuario = require('./src/models/Usuario');

const clientes = require('./src/data/clientes.json');
const compras = require('./src/data/compras.json');
const contadores = require('./src/data/contadores.json');
const cuentasCorrientes = require('./src/data/cuentasCorrientes.json');
const lotes = require('./src/data/lotes.json');
const movimientosStock = require('./src/data/movimientosStock.json');
const productos = require('./src/data/productos.json');
const proveedores = require('./src/data/proveedores.json');
const ventas = require('./src/data/ventas.json');

const colecciones = [
  { modelo: Cliente,         datos: clientes,         nombre: 'clientes' },
  { modelo: Compra,          datos: compras,           nombre: 'compras' },
  { modelo: Contador,        datos: contadores,        nombre: 'contadores' },
  { modelo: CuentaCorriente, datos: cuentasCorrientes, nombre: 'cuentasCorrientes' },
  { modelo: Lote,            datos: lotes,             nombre: 'lotes' },
  { modelo: MovimientoStock, datos: movimientosStock,  nombre: 'movimientosStock' },
  { modelo: Producto,        datos: productos,          nombre: 'productos' },
  { modelo: Proveedor,       datos: proveedores,        nombre: 'proveedores' },
  { modelo: Venta,           datos: ventas,             nombre: 'ventas' },
];

const seed = async () => {
  await conectarDB();

  for (const { modelo, datos, nombre } of colecciones) {
    await modelo.deleteMany({});
    await modelo.insertMany(datos);
    console.log(`✓ ${nombre}: ${datos.length} documentos insertados`);
  }

  // Crear usuario admin por defecto (la contraseña se hashea automáticamente)
  await Usuario.deleteMany({});
  await new Usuario({
    nombre: 'Administrador',
    email: 'usuario',
    password: '123456',
    rol: 'admin'
  }).save();
  console.log('✓ usuarios: usuario admin creado (usuario / 123456)');

  await mongoose.disconnect();
  console.log('Seed completado. Conexión cerrada.');
};

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
