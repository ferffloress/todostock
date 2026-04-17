const fs = require("fs");
const path = require("path");

const rutaArchivo = path.join(__dirname, "../data/movimientosStock.json");

const leerMovimientos = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const obtenerMovimientos = (req, res) => {
    const movimientos = leerMovimientos();
    res.json(movimientos);
};

const obtenerMovimientosPorProducto = (req, res) => {
    const movimientos = leerMovimientos();
    const resultado = movimientos.filter(m => m.producto_id === req.params.producto_id);
    res.json(resultado);
};

module.exports = { obtenerMovimientos, obtenerMovimientosPorProducto };
