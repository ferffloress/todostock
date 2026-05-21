const mongoose = require('mongoose');
const Contador = require('./Contador');

const loteSchema  = new mongoose.Schema({
    _id: { type: Number },
    producto_id: { type: Number, required: true },
    proveedor_id: { type: Number, default: null },
    numero_lote: { type: String, required: true },
    fecha_vencimiento: { type: Date, required: true },
    fecha_ingreso: { type: Date, default: Date.now },
    cantidad_inicial: { type: Number, required: true },
    cantidad_actual: { type: Number },
    costo_unitario: { type: Number, default: 0 },
}, {
  timestamps: true, // reemplaza created_at y updated_at
  _id: false
});

// Antes de guardar asigna el próximo número como ID
loteSchema.pre('save', async function(next) {
  if (this.isNew) {
    const contador = await Contador.findOneAndUpdate(
      { _col: 'lotes' },
      { $inc: { sec: 1 } },
      { new: true, upsert: true }
    );
    this._id = contador.sec;
    // Si no se pasó cantidad_actual, arranca igual a cantidad_inicial
    if (this.cantidad_actual === undefined) {
      this.cantidad_actual = this.cantidad_inicial;
    }
  }
  next();
});

module.exports = mongoose.model('Lote', loteSchema, 'lotes');
