const mongoose = require('mongoose');
const Contador = require('./Contador');

const RevisionPrecioSchema = new mongoose.Schema({
  _id: { type: Number },
  producto_id: { type: Number, required: true },
  compra_id: { type: Number, required: true },
  precio_costo_nuevo: { type: Number, required: true },
  precio_venta_sugerido: { type: Number, required: true },
  resuelto: { type: Boolean, default: false },
  fecha: { type: Date, default: Date.now },
}, { timestamps: true, _id: false });

RevisionPrecioSchema.pre('save', async function () {
  if (this.isNew) {
    const contador = await Contador.findOneAndUpdate(
      { _col: 'revisionesPrecio' },
      { $inc: { sec: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this._id = contador.sec;
  }
});

module.exports = mongoose.model('RevisionPrecio', RevisionPrecioSchema, 'revisionesPrecio');