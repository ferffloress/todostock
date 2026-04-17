const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const Proveedor = require("../models/Proveedor");

const rutaArchivo = path.join(__dirname, "../data/proveedores.json");

const leerProveedores = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const guardarProveedores = (proveedores) => {
    fs.writeFileSync(rutaArchivo, JSON.stringify(proveedores, null, 2));
};

const obtenerProveedores = (req, res) => {
    const proveedores = leerProveedores();
    res.json(proveedores);
};

const obtenerProveedorPorId = (req, res) => {
    const proveedores = leerProveedores();
    const proveedor = proveedores.find(p => p.id === req.params.id);
    if (!proveedor) return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json(proveedor);
};

const crearProveedor = (req, res) => {
    const { nombre, cuit } = req.body;

    if (!nombre || !cuit) {
        return res.status(400).json({ error: "Faltan datos obligatorios: nombre, cuit" });
    }

    const proveedores = leerProveedores();
    const nuevoProveedor = new Proveedor(
        randomUUID(),
        nombre.trim(),
        cuit.trim(),
        req.body.contacto || null,
        req.body.telefono || null,
        req.body.email || null,
        req.body.condicion_pago || null
    );

    proveedores.push(nuevoProveedor);
    guardarProveedores(proveedores);
    res.status(201).json(nuevoProveedor);
};

const actualizarProveedor = (req, res) => {
    const proveedores = leerProveedores();
    const index = proveedores.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Proveedor no encontrado" });

    proveedores[index] = { ...proveedores[index], ...req.body };
    guardarProveedores(proveedores);
    res.json(proveedores[index]);
};

const eliminarProveedor = (req, res) => {
    const proveedores = leerProveedores();
    const index = proveedores.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Proveedor no encontrado" });

    const compras = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/compras.json"), "utf-8"));
    const comprasActivas = compras.filter(c => c.proveedor_id === req.params.id && c.estado !== "cancelada");
    if (comprasActivas.length > 0) {
        return res.status(400).json({ error: "No se puede eliminar un proveedor con compras activas" });
    }

    proveedores.splice(index, 1);
    guardarProveedores(proveedores);
    res.json({ message: "Proveedor eliminado correctamente" });
};

module.exports = { obtenerProveedores, obtenerProveedorPorId, crearProveedor, actualizarProveedor, eliminarProveedor };
