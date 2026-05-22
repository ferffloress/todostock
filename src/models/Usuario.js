const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  rol: { type: String, default: 'user' }, 
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);