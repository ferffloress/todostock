const mongoose = require('mongoose');
const Contador = require('./Contador');


const CompraSchema = new mongoose.Schema({
  _id: { type: Number },
  proveedor_id: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, default: 'pendiente' },
  items: [{
    producto_id:       { type: Number },
    lote_id:           { type: Number },
    cantidad:          { type: Number },
    precio_unitario:   { type: Number },
    numero_lote:       { type: String },
    fecha_vencimiento: { type: Date },
    subtotal:          { type: Number },
  }],
  total: { type: Number, default: 0 },
  observaciones: { type: String, default: null },
}, { timestamps: true, _id: false });

CompraSchema.pre('save', async function () {
  if (this.isNew) {
    const contador = await Contador.findOneAndUpdate(
      { _col: 'compras' },
      { $inc: { sec: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this._id = contador.sec;
  }
});


module.exports = mongoose.model('Compra', CompraSchema, 'compras');