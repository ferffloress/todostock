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

ProveedorSchema.pre('save', async function () {
  if (this.isNew) {
    const contador = await Contador.findOneAndUpdate(
      { _col: 'proveedores' },
      { $inc: { sec: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this._id = contador.sec;
  }
});

module.exports = mongoose.model('Proveedor', ProveedorSchema, 'proveedores');
