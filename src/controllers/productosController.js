const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const Producto = require("../models/Producto");

const rutaArchivo = path.join(__dirname, "../data/productos.json");

const leerProductos = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const guardarProductos = (productos) => {
    fs.writeFileSync(rutaArchivo, JSON.stringify(productos, null, 2));
};

const obtenerProductos = (req, res) => {
    const productos = leerProductos();
    res.json(productos);
};

const obtenerProductoPorId = (req, res) => {
    const productos = leerProductos();
    const producto = productos.find(p => p.id === req.params.id);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
};

const crearProducto = (req, res) => {
    const { nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, unidad_medida } = req.body;

    if (!nombre || !categoria || precio_costo === undefined || precio_venta === undefined || stock_actual === undefined || stock_minimo === undefined || !unidad_medida) {
        return res.status(400).json({ error: "Faltan datos obligatorios: nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, unidad_medida" });
    }

    const productos = leerProductos();
    const nuevoProducto = new Producto(
        randomUUID(),
        nombre.trim(),
        categoria.trim(),
        precio_costo,
        precio_venta,
        stock_actual,
        stock_minimo,
        unidad_medida.trim(),
        true
    );

    productos.push(nuevoProducto);
    guardarProductos(productos);
    res.status(201).json(nuevoProducto);
};

const actualizarProducto = (req, res) => {
    const productos = leerProductos();
    const index = productos.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });

    productos[index] = { ...productos[index], ...req.body };
    guardarProductos(productos);
    res.json(productos[index]);
};

const eliminarProducto = (req, res) => {
    const productos = leerProductos();
    const index = productos.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });

    const ventas = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/ventas.json"), "utf-8"));
    const ventasActivas = ventas.filter(v => v.estado !== "cancelada" && v.items.some(i => i.producto_id === req.params.id));
    if (ventasActivas.length > 0) {
        return res.status(400).json({ error: "No se puede eliminar un producto con ventas activas" });
    }

    const compras = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/compras.json"), "utf-8"));
    const comprasActivas = compras.filter(c => c.estado !== "cancelada" && c.items.some(i => i.producto_id === req.params.id));
    if (comprasActivas.length > 0) {
        return res.status(400).json({ error: "No se puede eliminar un producto con compras activas" });
    }

    productos.splice(index, 1);
    guardarProductos(productos);
    res.json({ message: "Producto eliminado correctamente" });
};

module.exports = { obtenerProductos, obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto };
