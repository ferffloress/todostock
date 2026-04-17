const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const Cliente = require("../models/Cliente");

const rutaArchivo = path.join(__dirname, "../data/clientes.json");

const leerClientes = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const guardarClientes = (clientes) => {
    fs.writeFileSync(rutaArchivo, JSON.stringify(clientes, null, 2));
};

const obtenerClientes = (req, res) => {
    const clientes = leerClientes();
    res.json(clientes);
};

const obtenerClientePorId = (req, res) => {
    const clientes = leerClientes();
    const cliente = clientes.find(c => c.id === req.params.id);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
};

const crearCliente = (req, res) => {
    const { nombre, cuit, limite_credito } = req.body;

    if (!nombre || !cuit || limite_credito === undefined) {
        return res.status(400).json({ error: "Faltan datos obligatorios: nombre, cuit, limite_credito" });
    }

    const clientes = leerClientes();
    const nuevoCliente = new Cliente(
        randomUUID(),
        nombre.trim(),
        cuit.trim(),
        req.body.contacto || null,
        req.body.telefono || null,
        req.body.email || null,
        limite_credito,
        0
    );

    clientes.push(nuevoCliente);
    guardarClientes(clientes);
    res.status(201).json(nuevoCliente);
};

const actualizarCliente = (req, res) => {
    const clientes = leerClientes();
    const index = clientes.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Cliente no encontrado" });

    clientes[index] = { ...clientes[index], ...req.body };
    guardarClientes(clientes);
    res.json(clientes[index]);
};

const eliminarCliente = (req, res) => {
    const clientes = leerClientes();
    const index = clientes.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Cliente no encontrado" });

    const ventas = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/ventas.json"), "utf-8"));
    const ventasActivas = ventas.filter(v => v.cliente_id === req.params.id && v.estado !== "cancelada");
    if (ventasActivas.length > 0) {
        return res.status(400).json({ error: "No se puede eliminar un cliente con ventas activas" });
    }

    clientes.splice(index, 1);
    guardarClientes(clientes);
    res.json({ message: "Cliente eliminado correctamente" });
};

module.exports = { obtenerClientes, obtenerClientePorId, crearCliente, actualizarCliente, eliminarCliente };
