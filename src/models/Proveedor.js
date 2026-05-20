const mongoose = require('mongoose');
const Contador = require('./Contador');


const ProveedorSchema = new mongoose.Schema({
  _id: { type: Number },
  nombre: { type: String, required: true, trim: true },
  cuit: { type: String, required: true },
  contacto: { type: String },
  telefono: { type: String },
  email: { type: String },
  condicion_pago: { type: String },
}, { timestamps: true, _id: false });

ProveedorSchema.pre('save', async function (next) {
if (this.isNew) {
  const contador = await Contador.findOneAndUpdate(
    { _col: 'proveedor' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this._id = contador.seq;
}
next();
  
});

module.exports = mongoose.model('Proveedor', ProveedorSchema);
