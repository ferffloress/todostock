const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const Venta = require("../models/Venta");

const rutaVentas = path.join(__dirname, "../data/ventas.json");
const rutaClientes = path.join(__dirname, "../data/clientes.json");
const rutaProductos = path.join(__dirname, "../data/productos.json");
const rutaLotes = path.join(__dirname, "../data/lotes.json");
const rutaMovimientos = path.join(__dirname, "../data/movimientosStock.json");
const rutaCuentas = path.join(__dirname, "../data/cuentasCorrientes.json");

const leerVentas = () => JSON.parse(fs.readFileSync(rutaVentas, "utf-8"));
const guardarVentas = (data) => fs.writeFileSync(rutaVentas, JSON.stringify(data, null, 2));

const leerClientes = () => JSON.parse(fs.readFileSync(rutaClientes, "utf-8"));
const guardarClientes = (data) => fs.writeFileSync(rutaClientes, JSON.stringify(data, null, 2));

const leerProductos = () => JSON.parse(fs.readFileSync(rutaProductos, "utf-8"));
const guardarProductos = (data) => fs.writeFileSync(rutaProductos, JSON.stringify(data, null, 2));

const leerLotes = () => JSON.parse(fs.readFileSync(rutaLotes, "utf-8"));
const guardarLotes = (data) => fs.writeFileSync(rutaLotes, JSON.stringify(data, null, 2));

const leerMovimientos = () => JSON.parse(fs.readFileSync(rutaMovimientos, "utf-8"));
const guardarMovimientos = (data) => fs.writeFileSync(rutaMovimientos, JSON.stringify(data, null, 2));

const leerCuentas = () => JSON.parse(fs.readFileSync(rutaCuentas, "utf-8"));
const guardarCuentas = (data) => fs.writeFileSync(rutaCuentas, JSON.stringify(data, null, 2));

const obtenerVentas = (req, res) => {
    const ventas = leerVentas();
    res.json(ventas);
};

const obtenerVentaPorId = (req, res) => {
    const ventas = leerVentas();
    const venta = ventas.find(v => v.id === req.params.id);
    if (!venta) return res.status(404).json({ error: "Venta no encontrada" });

    const clientes = leerClientes();
    const productos = leerProductos();

    const cliente = clientes.find(c => c.id === venta.cliente_id);
    const itemsEnriquecidos = venta.items.map(item => {
        const producto = productos.find(p => p.id === item.producto_id);
        return { ...item, nombre_producto: producto ? producto.nombre : null };
    });

    res.json({ ...venta, nombre_cliente: cliente ? cliente.nombre : null, items: itemsEnriquecidos });
};

const crearVenta = (req, res) => {
    const { cliente_id, items } = req.body;

    if (!cliente_id || !items || items.length === 0) {
        return res.status(400).json({ error: "Faltan datos obligatorios: cliente_id, items" });
    }

    const clientes = leerClientes();
    const cliente = clientes.find(c => c.id === cliente_id);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });

    const productos = leerProductos();
    const lotes = leerLotes();

    const itemsConLote = [];

    for (const item of items) {
        if (!item.producto_id || !item.cantidad || !item.precio_unitario) {
            return res.status(400).json({ error: "Cada item debe tener producto_id, cantidad y precio_unitario" });
        }

        const producto = productos.find(p => p.id === item.producto_id);
        if (!producto) return res.status(404).json({ error: `Producto no encontrado: ${item.producto_id}` });

        const lotesActivos = lotes
            .filter(l => l.producto_id === item.producto_id && l.cantidad_actual > 0)
            .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

        const stockTotal = lotesActivos.reduce((sum, l) => sum + l.cantidad_actual, 0);
        if (stockTotal < item.cantidad) {
            return res.status(400).json({ error: `Stock insuficiente para: ${producto.nombre}` });
        }

        let restante = item.cantidad;
        const asignaciones = [];
        for (const lote of lotesActivos) {
            if (restante <= 0) break;
            const consumir = Math.min(restante, lote.cantidad_actual);
            asignaciones.push({ lote_id: lote.id, cantidad: consumir });
            restante -= consumir;
        }

        itemsConLote.push({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.cantidad * item.precio_unitario,
            lote_id: asignaciones[0].lote_id,
            lote_assignments: asignaciones
        });
    }

    const total = itemsConLote.reduce((sum, i) => sum + i.subtotal, 0);

    if (cliente.saldo_cuenta_corriente + total > cliente.limite_credito) {
        return res.status(400).json({ error: "Limite de credito insuficiente" });
    }

    const nuevaVenta = new Venta(
        randomUUID(),
        cliente_id,
        new Date().toISOString(),
        "pendiente",
        itemsConLote,
        total,
        req.body.observaciones || null
    );

    const ventas = leerVentas();
    ventas.push(nuevaVenta);
    guardarVentas(ventas);
    res.status(201).json(nuevaVenta);
};

const despacharVenta = (req, res) => {
    const ventas = leerVentas();
    const index = ventas.findIndex(v => v.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Venta no encontrada" });

    const venta = ventas[index];
    if (venta.estado !== "pendiente") {
        return res.status(400).json({ error: `No se puede despachar una venta en estado '${venta.estado}'` });
    }

    const lotes = leerLotes();
    const productos = leerProductos();
    const movimientos = leerMovimientos();
    const clientes = leerClientes();
    const cuentas = leerCuentas();

    for (const item of venta.items) {
        const asignaciones = item.lote_assignments || [{ lote_id: item.lote_id, cantidad: item.cantidad }];

        for (const asignacion of asignaciones) {
            const loteIndex = lotes.findIndex(l => l.id === asignacion.lote_id);
            if (loteIndex !== -1) {
                lotes[loteIndex].cantidad_actual -= asignacion.cantidad;
            }

            const prodIndex = productos.findIndex(p => p.id === item.producto_id);
            if (prodIndex !== -1) {
                productos[prodIndex].stock_actual -= asignacion.cantidad;
            }

            movimientos.push({
                id: randomUUID(),
                tipo: "egreso",
                producto_id: item.producto_id,
                lote_id: asignacion.lote_id,
                cantidad: asignacion.cantidad,
                referencia: venta.id,
                observaciones: `Despacho de venta ${venta.id}`,
                fecha: new Date().toISOString()
            });
        }
    }

    const clienteIndex = clientes.findIndex(c => c.id === venta.cliente_id);
    const nuevoSaldo = clientes[clienteIndex].saldo_cuenta_corriente + venta.total;
    clientes[clienteIndex].saldo_cuenta_corriente = nuevoSaldo;

    cuentas.push({
        id: randomUUID(),
        cliente_id: venta.cliente_id,
        tipo: "debito",
        monto: venta.total,
        fecha: new Date().toISOString(),
        referencia: venta.id,
        descripcion: "Venta despachada",
        saldo_resultante: nuevoSaldo
    });

    ventas[index].estado = "despachada";

    guardarVentas(ventas);
    guardarLotes(lotes);
    guardarProductos(productos);
    guardarMovimientos(movimientos);
    guardarClientes(clientes);
    guardarCuentas(cuentas);

    res.json(ventas[index]);
};

const cancelarVenta = (req, res) => {
    const ventas = leerVentas();
    const index = ventas.findIndex(v => v.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Venta no encontrada" });

    if (ventas[index].estado !== "pendiente") {
        return res.status(400).json({ error: `No se puede cancelar una venta en estado '${ventas[index].estado}'` });
    }

    ventas[index].estado = "cancelada";
    guardarVentas(ventas);
    res.json(ventas[index]);
};

module.exports = { obtenerVentas, obtenerVentaPorId, crearVenta, despacharVenta, cancelarVenta };
