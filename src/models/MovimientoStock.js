const mongoose = require('mongoose');
const Contador = require('./Contador');

const MovimientoStockSchema = new mongoose.Schema({
  _id: { type: Number },
  tipo: { type: String, enum: ['ingreso', 'egreso', 'ajuste'], required: true },
  producto_id: { type: Number, required: true },
  lote_id: { type: Number, default: null },
  cantidad: { type: Number, required: true },
  referencia: { type: String, default: null },
  observaciones: { type: String, default: null },
  fecha: { type: Date, default: Date.now },
}, { timestamps: true, _id: false });

MovimientoStockSchema.pre('save', async function () {
  if (this.isNew) {
    const contador = await Contador.findOneAndUpdate(
      { _col: 'movimientosStock' },
      { $inc: { sec: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this._id = contador.sec;
  }
});

module.exports = mongoose.model('MovimientoStock', MovimientoStockSchema, 'movimientosStock');

