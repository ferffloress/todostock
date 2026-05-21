const mongoose = require('mongoose');
const Contador = require('./Contador');


const CompraSchema = new mongoose.Schema({
  _id: { type: Number },
  proveedor_id: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, default: 'pendiente' },
  items: { type: Array, default: [] },
  total: { type: Number, default: 0 },
  observaciones: { type: String, default: null },
}, { timestamps: true, _id: false });

CompraSchema.pre('save', async function (next) {
if (this.isNew) {
  const contador = await Contador.findOneAndUpdate(
    { _col: 'compras' },
    { $inc: { sec: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  this._id = contador.sec;
}
next();
  
});


module.exports = mongoose.model('Compra', CompraSchema, 'compras');