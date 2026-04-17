const fs = require("fs");
const path = require("path");

const rutaArchivo = path.join(__dirname, "../data/lotes.json");

const leerLotes = () => {
    const data = fs.readFileSync(rutaArchivo, "utf-8");
    return JSON.parse(data);
};

const obtenerLotes = (req, res) => {
    const lotes = leerLotes();
    res.json(lotes);
};

const obtenerLotePorId = (req, res) => {
    const lotes = leerLotes();
    const lote = lotes.find(l => l.id === req.params.id);
    if (!lote) return res.status(404).json({ error: "Lote no encontrado" });
    res.json(lote);
};

const obtenerLotesPorProducto = (req, res) => {
    const lotes = leerLotes();
    const resultado = lotes.filter(l => l.producto_id === req.params.producto_id);
    res.json(resultado);
};

module.exports = { obtenerLotes, obtenerLotePorId, obtenerLotesPorProducto };
