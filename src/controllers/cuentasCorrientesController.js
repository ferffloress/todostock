const fs = require("fs");
const path = require("path");

const rutaCuentas = path.join(__dirname, "../data/cuentasCorrientes.json");
const rutaClientes = path.join(__dirname, "../data/clientes.json");

const leerCuentas = () => JSON.parse(fs.readFileSync(rutaCuentas, "utf-8"));
const leerClientes = () => JSON.parse(fs.readFileSync(rutaClientes, "utf-8"));

const obtenerCuentaPorCliente = (req, res) => {
    const clientes = leerClientes();
    const cliente = clientes.find(c => c.id === req.params.cliente_id);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });

    const cuentas = leerCuentas();
    const movimientos = cuentas
        .filter(m => m.cliente_id === req.params.cliente_id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json({
        cliente: {
            id: cliente.id,
            nombre: cliente.nombre,
            saldo_cuenta_corriente: cliente.saldo_cuenta_corriente,
            limite_credito: cliente.limite_credito
        },
        movimientos,
        saldo_actual: cliente.saldo_cuenta_corriente
    });
};

module.exports = { obtenerCuentaPorCliente };
