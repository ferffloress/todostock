const mongoose = require('mongoose');
const Contador = require('./Contador');


const CobranzaSchema = new mongoose.Schema({
  _id: { type: Number },
  cliente_id: { type: Number, required: true },
  monto: { type: Number, required: true },
  forma_pago: { type: String, enum: ['efectivo', 'transferencia'] ,required: true },
  fecha: { type: Date, default: Date.now },
  observaciones: { type: String, default: null },
}, { timestamps: true, _id: false });

CobranzaSchema.pre('save', async function (next) {
if (this.isNew) {
  const contador = await Contador.findOneAndUpdate(
    { _col: 'cobranzas' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this._id = contador.seq;
}
next();
  
});

module.exports = mongoose.model('Cobranza', CobranzaSchema);

