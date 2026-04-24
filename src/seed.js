const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const rutaProductos = path.join(__dirname, "data/productos.json");
const rutaProveedores = path.join(__dirname, "data/proveedores.json");
const rutaClientes = path.join(__dirname, "data/clientes.json");
const rutaLotes = path.join(__dirname, "data/lotes.json");
const rutaCompras = path.join(__dirname, "data/compras.json");
const rutaVentas = path.join(__dirname, "data/ventas.json");
const rutaMovimientos = path.join(__dirname, "data/movimientosStock.json");
const rutaCuentas = path.join(__dirname, "data/cuentasCorrientes.json");

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
}

function seed() {
    const productos = JSON.parse(fs.readFileSync(rutaProductos, "utf-8"));
    if (productos.length > 0) return;

    const now = new Date();

    const prov1 = { id: randomUUID(), nombre: "Quimica del Sur S.A.", cuit: "30-12345678-9", contacto: "Juan Perez", telefono: "011-4444-5555", email: "ventas@quimicadelsur.com", condicion_pago: "30 dias" };
    const prov2 = { id: randomUUID(), nombre: "Distribuidora Limpiar S.R.L.", cuit: "30-98765432-1", contacto: "Maria Garcia", telefono: "011-3333-4444", email: "pedidos@limpiar.com", condicion_pago: "contado" };
    const prov3 = { id: randomUUID(), nombre: "Productos Clean S.A.", cuit: "30-55555555-5", contacto: "Carlos Lopez", telefono: "011-2222-3333", email: "info@clean.com", condicion_pago: "60 dias" };
    fs.writeFileSync(rutaProveedores, JSON.stringify([prov1, prov2, prov3], null, 2));

    const prod1 = { id: randomUUID(), nombre: "Lavandina 10L", categoria: "Desinfectantes", precio_costo: 850, precio_venta: 1200, stock_actual: 150, stock_minimo: 50, unidad_medida: "unidad", activo: true };
    const prod2 = { id: randomUUID(), nombre: "Detergente Industrial 5L", categoria: "Detergentes", precio_costo: 620, precio_venta: 920, stock_actual: 80, stock_minimo: 30, unidad_medida: "unidad", activo: true };
    const prod3 = { id: randomUUID(), nombre: "Desengrasante 1L", categoria: "Desengrasantes", precio_costo: 380, precio_venta: 580, stock_actual: 200, stock_minimo: 60, unidad_medida: "unidad", activo: true };
    const prod4 = { id: randomUUID(), nombre: "Jabon Liquido 5L", categoria: "Jabones", precio_costo: 450, precio_venta: 680, stock_actual: 45, stock_minimo: 40, unidad_medida: "unidad", activo: true };
    const prod5 = { id: randomUUID(), nombre: "Alcohol en Gel 500ml", categoria: "Antisepticos", precio_costo: 290, precio_venta: 450, stock_actual: 0, stock_minimo: 20, unidad_medida: "unidad", activo: true };
    fs.writeFileSync(rutaProductos, JSON.stringify([prod1, prod2, prod3, prod4, prod5], null, 2));

    const fechaCerca = addDays(now, 20);
    const fechaLejos = addDays(now, 365);

    const lote1A = { id: randomUUID(), producto_id: prod1.id, proveedor_id: prov1.id, numero_lote: "LAV-2024-A", fecha_vencimiento: fechaCerca, fecha_ingreso: now.toISOString(), cantidad_inicial: 50, cantidad_actual: 50, costo_unitario: 850 };
    const lote1B = { id: randomUUID(), producto_id: prod1.id, proveedor_id: prov1.id, numero_lote: "LAV-2024-B", fecha_vencimiento: fechaLejos, fecha_ingreso: now.toISOString(), cantidad_inicial: 100, cantidad_actual: 100, costo_unitario: 850 };
    const lote2A = { id: randomUUID(), producto_id: prod2.id, proveedor_id: prov1.id, numero_lote: "DET-2024-A", fecha_vencimiento: fechaCerca, fecha_ingreso: now.toISOString(), cantidad_inicial: 30, cantidad_actual: 30, costo_unitario: 620 };
    const lote2B = { id: randomUUID(), producto_id: prod2.id, proveedor_id: prov1.id, numero_lote: "DET-2024-B", fecha_vencimiento: fechaLejos, fecha_ingreso: now.toISOString(), cantidad_inicial: 50, cantidad_actual: 50, costo_unitario: 620 };
    const lote3A = { id: randomUUID(), producto_id: prod3.id, proveedor_id: prov1.id, numero_lote: "DES-2024-A", fecha_vencimiento: fechaCerca, fecha_ingreso: now.toISOString(), cantidad_inicial: 100, cantidad_actual: 100, costo_unitario: 380 };
    const lote3B = { id: randomUUID(), producto_id: prod3.id, proveedor_id: prov1.id, numero_lote: "DES-2024-B", fecha_vencimiento: fechaLejos, fecha_ingreso: now.toISOString(), cantidad_inicial: 100, cantidad_actual: 100, costo_unitario: 380 };
    const lote4A = { id: randomUUID(), producto_id: prod4.id, proveedor_id: prov1.id, numero_lote: "JAB-2024-A", fecha_vencimiento: fechaCerca, fecha_ingreso: now.toISOString(), cantidad_inicial: 20, cantidad_actual: 20, costo_unitario: 450 };
    const lote4B = { id: randomUUID(), producto_id: prod4.id, proveedor_id: prov1.id, numero_lote: "JAB-2024-B", fecha_vencimiento: fechaLejos, fecha_ingreso: now.toISOString(), cantidad_inicial: 25, cantidad_actual: 25, costo_unitario: 450 };
    const lote5A = { id: randomUUID(), producto_id: prod5.id, proveedor_id: prov1.id, numero_lote: "ALC-2024-A", fecha_vencimiento: fechaCerca, fecha_ingreso: now.toISOString(), cantidad_inicial: 50, cantidad_actual: 0, costo_unitario: 290 };
    const lote5B = { id: randomUUID(), producto_id: prod5.id, proveedor_id: prov1.id, numero_lote: "ALC-2024-B", fecha_vencimiento: fechaLejos, fecha_ingreso: now.toISOString(), cantidad_inicial: 100, cantidad_actual: 0, costo_unitario: 290 };
    fs.writeFileSync(rutaLotes, JSON.stringify([lote1A, lote1B, lote2A, lote2B, lote3A, lote3B, lote4A, lote4B, lote5A, lote5B], null, 2));

    const cli1 = { id: randomUUID(), nombre: "Supermercado El Ahorro", cuit: "20-11111111-1", contacto: "Pedro Ramirez", telefono: "011-5555-6666", email: "compras@elahorro.com", limite_credito: 500000, saldo_cuenta_corriente: 0 };
    const cli2 = { id: randomUUID(), nombre: "Limpieza Total S.R.L.", cuit: "20-22222222-2", contacto: "Ana Martinez", telefono: "011-7777-8888", email: "admin@limpiezatotal.com", limite_credito: 200000, saldo_cuenta_corriente: 0 };
    const cli3 = { id: randomUUID(), nombre: "Hotel Grand Palace", cuit: "30-33333333-3", contacto: "Luis Fernandez", telefono: "011-9999-0000", email: "compras@grandpalace.com", limite_credito: 100000, saldo_cuenta_corriente: 0 };
    fs.writeFileSync(rutaClientes, JSON.stringify([cli1, cli2, cli3], null, 2));

    const compra1 = {
        id: randomUUID(),
        proveedor_id: prov1.id,
        fecha: addDays(now, -10),
        estado: "recibida",
        items: [
            { producto_id: prod1.id, cantidad: 50, precio_unitario: 850, numero_lote: lote1A.numero_lote, fecha_vencimiento: lote1A.fecha_vencimiento, subtotal: 42500 },
            { producto_id: prod2.id, cantidad: 30, precio_unitario: 620, numero_lote: lote2A.numero_lote, fecha_vencimiento: lote2A.fecha_vencimiento, subtotal: 18600 }
        ],
        total: 61100,
        observaciones: "Compra inicial de stock"
    };
    fs.writeFileSync(rutaCompras, JSON.stringify([compra1], null, 2));

    const ventaCantidad = 10;
    const ventaTotal = ventaCantidad * prod1.precio_venta;
    const venta1 = {
        id: randomUUID(),
        cliente_id: cli1.id,
        fecha: addDays(now, -5),
        estado: "despachada",
        items: [{ producto_id: prod1.id, cantidad: ventaCantidad, precio_unitario: prod1.precio_venta, subtotal: ventaTotal, lote_id: lote1A.id, lote_assignments: [{ lote_id: lote1A.id, cantidad: ventaCantidad }] }],
        total: ventaTotal,
        observaciones: null
    };
    fs.writeFileSync(rutaVentas, JSON.stringify([venta1], null, 2));

    const mov1 = { id: randomUUID(), tipo: "ingreso", producto_id: prod1.id, lote_id: lote1A.id, cantidad: 50, referencia: compra1.id, observaciones: "Recepcion de compra", fecha: addDays(now, -10) };
    const mov2 = { id: randomUUID(), tipo: "ingreso", producto_id: prod2.id, lote_id: lote2A.id, cantidad: 30, referencia: compra1.id, observaciones: "Recepcion de compra", fecha: addDays(now, -10) };
    const mov3 = { id: randomUUID(), tipo: "egreso", producto_id: prod1.id, lote_id: lote1A.id, cantidad: ventaCantidad, referencia: venta1.id, observaciones: "Despacho de venta", fecha: addDays(now, -5) };
    fs.writeFileSync(rutaMovimientos, JSON.stringify([mov1, mov2, mov3], null, 2));

    const nuevoSaldo = ventaTotal;
    const ccMov = { id: randomUUID(), cliente_id: cli1.id, tipo: "debito", monto: ventaTotal, fecha: addDays(now, -5), referencia: venta1.id, descripcion: "Venta despachada", saldo_resultante: nuevoSaldo };
    fs.writeFileSync(rutaCuentas, JSON.stringify([ccMov], null, 2));

    console.log("Seed completado:");
    console.log("  - 3 proveedores");
    console.log("  - 5 productos");
    console.log("  - 10 lotes");
    console.log("  - 3 clientes");
    console.log("  - 1 compra recibida");
    console.log("  - 1 venta despachada");
}

module.exports = seed;
