const mongoose = require('mongoose');


const contadorSchema = new mongoose.Schema({
  _col:  { type: String, required: true, unique: true },   // nombre de la colección, ej: "ventas"
  sec:  { type: Number, default: 0 },  // el número secuencial actual
});

module.exports = mongoose.model('Contador', contadorSchema, 'contadores');