const { randomUUID } = require('crypto');

const productosStorage = require('./storage/productosStorage');
const proveedoresStorage = require('./storage/proveedoresStorage');
const clientesStorage = require('./storage/clientesStorage');
const lotesStorage = require('./storage/lotesStorage');
const comprasStorage = require('./storage/comprasStorage');
const ventasStorage = require('./storage/ventasStorage');
const cuentasCorrientesStorage = require('./storage/cuentasCorrientesStorage');
const movimientosStockStorage = require('./storage/movimientosStockStorage');

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

function seed() {
  const now = new Date();

  // ─────────────────────────────────────────────
  // PROVEEDORES
  // ─────────────────────────────────────────────
  const prov1 = {
    id: randomUUID(),
    nombre: 'Química del Sur S.A.',
    cuit: '30-12345678-9',
    contacto: 'Juan Pérez',
    telefono: '011-4444-5555',
    email: 'ventas@quimicadelsur.com',
    condicion_pago: '30 días',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const prov2 = {
    id: randomUUID(),
    nombre: 'Distribuidora Limpiar S.R.L.',
    cuit: '30-98765432-1',
    contacto: 'María García',
    telefono: '011-3333-4444',
    email: 'pedidos@limpiar.com',
    condicion_pago: 'contado',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const prov3 = {
    id: randomUUID(),
    nombre: 'Productos Clean S.A.',
    cuit: '30-55555555-5',
    contacto: 'Carlos López',
    telefono: '011-2222-3333',
    email: 'info@clean.com',
    condicion_pago: '60 días',
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  proveedoresStorage.create(prov1);
  proveedoresStorage.create(prov2);
  proveedoresStorage.create(prov3);

  // ─────────────────────────────────────────────
  // PRODUCTOS
  // ─────────────────────────────────────────────
  // Producto 1: Lavandina 10L  — stock_actual=150 (loteA=50, loteB=100)
  const prod1 = {
    id: randomUUID(),
    nombre: 'Lavandina 10L',
    categoria: 'Desinfectantes',
    precio_costo: 850,
    precio_venta: 1200,
    stock_actual: 150,
    stock_minimo: 50,
    unidad_medida: 'unidad',
    activo: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  // Producto 2: Detergente Industrial 5L — stock_actual=80 (loteA=30, loteB=50)
  const prod2 = {
    id: randomUUID(),
    nombre: 'Detergente Industrial 5L',
    categoria: 'Detergentes',
    precio_costo: 620,
    precio_venta: 920,
    stock_actual: 80,
    stock_minimo: 30,
    unidad_medida: 'unidad',
    activo: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  // Producto 3: Desengrasante 1L — stock_actual=200 (loteA=100, loteB=100)
  const prod3 = {
    id: randomUUID(),
    nombre: 'Desengrasante 1L',
    categoria: 'Desengrasantes',
    precio_costo: 380,
    precio_venta: 580,
    stock_actual: 200,
    stock_minimo: 60,
    unidad_medida: 'unidad',
    activo: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  // Producto 4: Jabón Líquido 5L — stock_actual=45 (stock bajo!) (loteA=20, loteB=25)
  const prod4 = {
    id: randomUUID(),
    nombre: 'Jabón Líquido 5L',
    categoria: 'Jabones',
    precio_costo: 450,
    precio_venta: 680,
    stock_actual: 45,
    stock_minimo: 40,
    unidad_medida: 'unidad',
    activo: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  // Producto 5: Alcohol en Gel 500ml — stock_actual=0 (sin stock) (loteA=0, loteB=0)
  const prod5 = {
    id: randomUUID(),
    nombre: 'Alcohol en Gel 500ml',
    categoria: 'Antisépticos',
    precio_costo: 290,
    precio_venta: 450,
    stock_actual: 0,
    stock_minimo: 20,
    unidad_medida: 'unidad',
    activo: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  productosStorage.create(prod1);
  productosStorage.create(prod2);
  productosStorage.create(prod3);
  productosStorage.create(prod4);
  productosStorage.create(prod5);

  // ─────────────────────────────────────────────
  // LOTES (2 per product)
  // Lote A: vence en 20 días (próximo a vencer)
  // Lote B: vence en 1 año
  // ─────────────────────────────────────────────
  const fechaVencCerca = addDays(now, 20);
  const fechaVencLejos = addDays(now, 365);

  // Prod1 lotes: A=50, B=100 → total 150
  const lote1A = {
    id: randomUUID(),
    producto_id: prod1.id,
    proveedor_id: prov1.id,
    numero_lote: 'LAV-2024-A',
    fecha_vencimiento: fechaVencCerca,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 50,
    cantidad_actual: 50,
    costo_unitario: 850,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const lote1B = {
    id: randomUUID(),
    producto_id: prod1.id,
    proveedor_id: prov1.id,
    numero_lote: 'LAV-2024-B',
    fecha_vencimiento: fechaVencLejos,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 100,
    cantidad_actual: 100,
    costo_unitario: 850,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Prod2 lotes: A=30, B=50 → total 80
  const lote2A = {
    id: randomUUID(),
    producto_id: prod2.id,
    proveedor_id: prov1.id,
    numero_lote: 'DET-2024-A',
    fecha_vencimiento: fechaVencCerca,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 30,
    cantidad_actual: 30,
    costo_unitario: 620,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const lote2B = {
    id: randomUUID(),
    producto_id: prod2.id,
    proveedor_id: prov1.id,
    numero_lote: 'DET-2024-B',
    fecha_vencimiento: fechaVencLejos,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 50,
    cantidad_actual: 50,
    costo_unitario: 620,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Prod3 lotes: A=100, B=100 → total 200
  const lote3A = {
    id: randomUUID(),
    producto_id: prod3.id,
    proveedor_id: prov1.id,
    numero_lote: 'DES-2024-A',
    fecha_vencimiento: fechaVencCerca,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 100,
    cantidad_actual: 100,
    costo_unitario: 380,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const lote3B = {
    id: randomUUID(),
    producto_id: prod3.id,
    proveedor_id: prov1.id,
    numero_lote: 'DES-2024-B',
    fecha_vencimiento: fechaVencLejos,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 100,
    cantidad_actual: 100,
    costo_unitario: 380,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Prod4 lotes: A=20, B=25 → total 45
  const lote4A = {
    id: randomUUID(),
    producto_id: prod4.id,
    proveedor_id: prov1.id,
    numero_lote: 'JAB-2024-A',
    fecha_vencimiento: fechaVencCerca,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 20,
    cantidad_actual: 20,
    costo_unitario: 450,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const lote4B = {
    id: randomUUID(),
    producto_id: prod4.id,
    proveedor_id: prov1.id,
    numero_lote: 'JAB-2024-B',
    fecha_vencimiento: fechaVencLejos,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 25,
    cantidad_actual: 25,
    costo_unitario: 450,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Prod5 lotes: A=0, B=0 → total 0 (sin stock)
  const lote5A = {
    id: randomUUID(),
    producto_id: prod5.id,
    proveedor_id: prov1.id,
    numero_lote: 'ALC-2024-A',
    fecha_vencimiento: fechaVencCerca,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 50,
    cantidad_actual: 0,
    costo_unitario: 290,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const lote5B = {
    id: randomUUID(),
    producto_id: prod5.id,
    proveedor_id: prov1.id,
    numero_lote: 'ALC-2024-B',
    fecha_vencimiento: fechaVencLejos,
    fecha_ingreso: now.toISOString(),
    cantidad_inicial: 100,
    cantidad_actual: 0,
    costo_unitario: 290,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  lotesStorage.create(lote1A);
  lotesStorage.create(lote1B);
  lotesStorage.create(lote2A);
  lotesStorage.create(lote2B);
  lotesStorage.create(lote3A);
  lotesStorage.create(lote3B);
  lotesStorage.create(lote4A);
  lotesStorage.create(lote4B);
  lotesStorage.create(lote5A);
  lotesStorage.create(lote5B);

  // ─────────────────────────────────────────────
  // CLIENTES
  // ─────────────────────────────────────────────
  const cli1 = {
    id: randomUUID(),
    nombre: 'Supermercado El Ahorro',
    cuit: '20-11111111-1',
    contacto: 'Pedro Ramírez',
    telefono: '011-5555-6666',
    email: 'compras@elahorro.com',
    limite_credito: 500000,
    saldo_cuenta_corriente: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const cli2 = {
    id: randomUUID(),
    nombre: 'Limpieza Total S.R.L.',
    cuit: '20-22222222-2',
    contacto: 'Ana Martínez',
    telefono: '011-7777-8888',
    email: 'admin@limpiezatotal.com',
    limite_credito: 200000,
    saldo_cuenta_corriente: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  const cli3 = {
    id: randomUUID(),
    nombre: 'Hotel Grand Palace',
    cuit: '30-33333333-3',
    contacto: 'Luis Fernández',
    telefono: '011-9999-0000',
    email: 'compras@grandpalace.com',
    limite_credito: 100000,
    saldo_cuenta_corriente: 0,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
  clientesStorage.create(cli1);
  clientesStorage.create(cli2);
  clientesStorage.create(cli3);

  // ─────────────────────────────────────────────
  // COMPRA RECIBIDA (seed — set directly, no recibir flow)
  // Proveedor 1, items: prod1 x 50, prod2 x 30
  // (references the lotes already created)
  // ─────────────────────────────────────────────
  const compra1Items = [
    {
      producto_id: prod1.id,
      cantidad: 50,
      precio_unitario: 850,
      numero_lote: lote1A.numero_lote,
      fecha_vencimiento: lote1A.fecha_vencimiento,
      subtotal: 50 * 850,
    },
    {
      producto_id: prod2.id,
      cantidad: 30,
      precio_unitario: 620,
      numero_lote: lote2A.numero_lote,
      fecha_vencimiento: lote2A.fecha_vencimiento,
      subtotal: 30 * 620,
    },
  ];
  const compra1 = {
    id: randomUUID(),
    proveedor_id: prov1.id,
    fecha: addDays(now, -10),
    estado: 'recibida',
    items: compra1Items,
    total: compra1Items.reduce((s, i) => s + i.subtotal, 0),
    observaciones: 'Compra inicial de stock',
    created_at: addDays(now, -10),
    updated_at: addDays(now, -10),
  };
  comprasStorage.create(compra1);

  // Log ingreso movimientos for the received compra
  const mov1 = {
    id: randomUUID(),
    tipo: 'ingreso',
    producto_id: prod1.id,
    lote_id: lote1A.id,
    cantidad: 50,
    referencia: compra1.id,
    observaciones: `Recepción de compra ${compra1.id}`,
    fecha: addDays(now, -10),
  };
  const mov2 = {
    id: randomUUID(),
    tipo: 'ingreso',
    producto_id: prod2.id,
    lote_id: lote2A.id,
    cantidad: 30,
    referencia: compra1.id,
    observaciones: `Recepción de compra ${compra1.id}`,
    fecha: addDays(now, -10),
  };
  movimientosStockStorage.create(mov1);
  movimientosStockStorage.create(mov2);

  // ─────────────────────────────────────────────
  // VENTA DESPACHADA (seed — set directly)
  // Cliente 1, 10 unidades de prod1 (Lavandina 10L) a precio_venta
  // FEFO: consume from lote1A first (20 días de vencimiento)
  // ─────────────────────────────────────────────
  const ventaCantidad = 10;
  const ventaPrecio = prod1.precio_venta;
  const ventaTotal = ventaCantidad * ventaPrecio;

  const venta1Items = [
    {
      producto_id: prod1.id,
      cantidad: ventaCantidad,
      precio_unitario: ventaPrecio,
      subtotal: ventaTotal,
      lote_id: lote1A.id,
      lote_assignments: [{ lote_id: lote1A.id, cantidad: ventaCantidad }],
    },
  ];

  const venta1 = {
    id: randomUUID(),
    cliente_id: cli1.id,
    fecha: addDays(now, -5),
    estado: 'despachada',
    items: venta1Items,
    total: ventaTotal,
    observaciones: null,
    created_at: addDays(now, -5),
    updated_at: addDays(now, -5),
  };
  ventasStorage.create(venta1);

  // Deduct stock: lote1A cantidad_actual -= 10, prod1 stock_actual -= 10
  lotesStorage.update(lote1A.id, {
    cantidad_actual: lote1A.cantidad_actual - ventaCantidad,
    updated_at: now.toISOString(),
  });
  productosStorage.update(prod1.id, {
    stock_actual: prod1.stock_actual - ventaCantidad,
    updated_at: now.toISOString(),
  });

  // Log egreso movimiento for the dispatched venta
  const mov3 = {
    id: randomUUID(),
    tipo: 'egreso',
    producto_id: prod1.id,
    lote_id: lote1A.id,
    cantidad: ventaCantidad,
    referencia: venta1.id,
    observaciones: `Despacho de venta ${venta1.id}`,
    fecha: addDays(now, -5),
  };
  movimientosStockStorage.create(mov3);

  // Cuenta corriente debito for venta1
  const nuevoSaldoCli1 = cli1.saldo_cuenta_corriente + ventaTotal;
  const ccMov1 = {
    id: randomUUID(),
    cliente_id: cli1.id,
    tipo: 'debito',
    monto: ventaTotal,
    fecha: addDays(now, -5),
    referencia: venta1.id,
    descripcion: 'Venta despachada',
    saldo_resultante: nuevoSaldoCli1,
  };
  cuentasCorrientesStorage.create(ccMov1);

  // Update cliente saldo
  clientesStorage.update(cli1.id, {
    saldo_cuenta_corriente: nuevoSaldoCli1,
    updated_at: now.toISOString(),
  });

  console.log('Seed completado:');
  console.log(`  - 3 proveedores`);
  console.log(`  - 5 productos`);
  console.log(`  - 10 lotes (2 por producto)`);
  console.log(`  - 3 clientes`);
  console.log(`  - 1 compra recibida`);
  console.log(`  - 1 venta despachada`);
}

module.exports = seed;
