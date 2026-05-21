const mongoose = require('mongoose');
const Contador = require('./Contador');

const ClientSchema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true, trim: true },
  cuit: { type: String, required: true },
  contacto: { type: String },
  telefono: { type: String },
  email: { type: String },
  limite_credito: { type: Number },
  saldo_cuenta_corriente: { type: Number, default: 0 },
  
  }, { timestamps: true, _id: false });

ClientSchema.pre('save', async function (next) {
if (this.isNew) {
  const contador = await Contador.findOneAndUpdate(
    { _col: 'cliente' },
    { $inc: { sec: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  this._id = contador.sec;
}
next();
  
});


module.exports = mongoose.model('Cliente', ClientSchema, 'clientes');
