const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const Compra = require("../models/Compra");

const rutaCompras = path.join(__dirname, "../data/compras.json");
const rutaProveedores = path.join(__dirname, "../data/proveedores.json");
const rutaProductos = path.join(__dirname, "../data/productos.json");
const rutaLotes = path.join(__dirname, "../data/lotes.json");
const rutaMovimientos = path.join(__dirname, "../data/movimientosStock.json");

const leerCompras = () => JSON.parse(fs.readFileSync(rutaCompras, "utf-8"));
const guardarCompras = (data) => fs.writeFileSync(rutaCompras, JSON.stringify(data, null, 2));

const leerProveedores = () => JSON.parse(fs.readFileSync(rutaProveedores, "utf-8"));
const leerProductos = () => JSON.parse(fs.readFileSync(rutaProductos, "utf-8"));
const guardarProductos = (data) => fs.writeFileSync(rutaProductos, JSON.stringify(data, null, 2));
const leerLotes = () => JSON.parse(fs.readFileSync(rutaLotes, "utf-8"));
const guardarLotes = (data) => fs.writeFileSync(rutaLotes, JSON.stringify(data, null, 2));
const leerMovimientos = () => JSON.parse(fs.readFileSync(rutaMovimientos, "utf-8"));
const guardarMovimientos = (data) => fs.writeFileSync(rutaMovimientos, JSON.stringify(data, null, 2));

const obtenerCompras = (req, res) => {
    const compras = leerCompras();
    res.json(compras);
};

const obtenerCompraPorId = (req, res) => {
    const compras = leerCompras();
    const compra = compras.find(c => c.id === req.params.id);
    if (!compra) return res.status(404).json({ error: "Compra no encontrada" });

    const proveedores = leerProveedores();
    const productos = leerProductos();

    const proveedor = proveedores.find(p => p.id === compra.proveedor_id);
    const itemsEnriquecidos = compra.items.map(item => {
        const producto = productos.find(p => p.id === item.producto_id);
        return { ...item, nombre_producto: producto ? producto.nombre : null };
    });

    res.json({ ...compra, nombre_proveedor: proveedor ? proveedor.nombre : null, items: itemsEnriquecidos });
};

const crearCompra = (req, res) => {
    const { proveedor_id, items } = req.body;

    if (!proveedor_id || !items || items.length === 0) {
        return res.status(400).json({ error: "Faltan datos obligatorios: proveedor_id, items" });
    }

    const proveedores = leerProveedores();
    const proveedor = proveedores.find(p => p.id === proveedor_id);
    if (!proveedor) return res.status(404).json({ error: "Proveedor no encontrado" });

    const productos = leerProductos();
    for (const item of items) {
        if (!item.producto_id || !item.cantidad || !item.precio_unitario || !item.numero_lote || !item.fecha_vencimiento) {
            return res.status(400).json({ error: "Cada item debe tener producto_id, cantidad, precio_unitario, numero_lote y fecha_vencimiento" });
        }
        const producto = productos.find(p => p.id === item.producto_id);
        if (!producto) return res.status(404).json({ error: `Producto no encontrado: ${item.producto_id}` });
    }

    const itemsConSubtotal = items.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        numero_lote: item.numero_lote,
        fecha_vencimiento: item.fecha_vencimiento,
        subtotal: item.cantidad * item.precio_unitario
    }));

    const total = itemsConSubtotal.reduce((sum, i) => sum + i.subtotal, 0);

    const nuevaCompra = new Compra(
        randomUUID(),
        proveedor_id,
        new Date().toISOString(),
        "pendiente",
        itemsConSubtotal,
        total,
        req.body.observaciones || null
    );

    const compras = leerCompras();
    compras.push(nuevaCompra);
    guardarCompras(compras);
    res.status(201).json(nuevaCompra);
};

const recibirCompra = (req, res) => {
    const compras = leerCompras();
    const index = compras.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Compra no encontrada" });

    const compra = compras[index];
    if (compra.estado !== "pendiente") {
        return res.status(400).json({ error: `No se puede recibir una compra en estado '${compra.estado}'` });
    }

    const lotes = leerLotes();
    const productos = leerProductos();
    const movimientos = leerMovimientos();

    for (const item of compra.items) {
        const nuevoLote = {
            id: randomUUID(),
            producto_id: item.producto_id,
            proveedor_id: compra.proveedor_id,
            numero_lote: item.numero_lote,
            fecha_vencimiento: item.fecha_vencimiento,
            fecha_ingreso: new Date().toISOString(),
            cantidad_inicial: item.cantidad,
            cantidad_actual: item.cantidad,
            costo_unitario: item.precio_unitario
        };
        lotes.push(nuevoLote);

        const prodIndex = productos.findIndex(p => p.id === item.producto_id);
        if (prodIndex !== -1) {
            productos[prodIndex].stock_actual += item.cantidad;
        }

        movimientos.push({
            id: randomUUID(),
            tipo: "ingreso",
            producto_id: item.producto_id,
            lote_id: nuevoLote.id,
            cantidad: item.cantidad,
            referencia: compra.id,
            observaciones: `Recepcion de compra ${compra.id}`,
            fecha: new Date().toISOString()
        });
    }

    compras[index].estado = "recibida";

    guardarCompras(compras);
    guardarLotes(lotes);
    guardarProductos(productos);
    guardarMovimientos(movimientos);

    res.json(compras[index]);
};

const cancelarCompra = (req, res) => {
    const compras = leerCompras();
    const index = compras.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Compra no encontrada" });

    if (compras[index].estado !== "pendiente") {
        return res.status(400).json({ error: `No se puede cancelar una compra en estado '${compras[index].estado}'` });
    }

    compras[index].estado = "cancelada";
    guardarCompras(compras);
    res.json(compras[index]);
};

module.exports = { obtenerCompras, obtenerCompraPorId, crearCompra, recibirCompra, cancelarCompra };
