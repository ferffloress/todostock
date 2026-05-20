const mongoose = require('mongoose');
const Contador = require('./Contador');

const MovimientoStockSchema = new mongoose.Schema({
  _id: { type: Number },
  tipo: { type: String, enum: ['entrada', 'salida', 'ajuste'], required: true },
  producto_id: { type: Number, required: true },
  lote_id: { type: Number, default: null },
  cantidad: { type: Number, required: true },
  referencia: { type: String, default: null },
  observaciones: { type: String, default: null },
  fecha: { type: Date, default: Date.now },
}, { timestamps: true, _id: false });

MovimientoStockSchema.pre('save', async function (next) {
if (this.isNew) {
  const contador = await Contador.findOneAndUpdate(
    { _col: 'movimientos_stock' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this._id = contador.seq;
}
next();
  
});

module.exports = mongoose.model('MovimientoStock', MovimientoStockSchema);
