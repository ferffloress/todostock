const mongoose = require('mongoose');
const Contador = require('./Contador');



const CuentaCorrienteSchema = new mongoose.Schema({
  _id: { type: Number },
  cliente_id: { type: Number, required: true },
  tipo: { type: String, enum: ['debito', 'credito'], required: true },
  monto: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  referencia: { type: String, default: null },
  descripcion: { type: String, default: null },
  saldo_resultante: { type: Number, default: 0 },
}, { timestamps: true, _id: false });

CuentaCorrienteSchema.pre('save', async function (next) {
if (this.isNew) {
  const contador = await Contador.findOneAndUpdate(
    { _col: 'cuentasCorrientes' },
    { $inc: { sec: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  this._id = contador.sec;
}
next();
  
});

module.exports = mongoose.model('CuentaCorriente', CuentaCorrienteSchema, 'cuentasCorrientes');
