const mongoose = require('mongoose');
const Contador = require('./Contador');


const ventaSchema = new mongoose.Schema({
    _id: { type: Number },
    cliente_id: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    estado: { type: String, default: 'pendiente' },
    items: { type: Array, default: [] },
    total: { type: Number, default: 0 },
    forma_pago: { type: String, default: 'efectivo' },
    observaciones: { type: String, default: null }
},{
    timestamps: true,
    _id: false  // deshabilita el _id automático de MongoDB ??
});

ventaSchema.pre('save', async function() {
  if (this.isNew) {
    const contador = await Contador.findOneAndUpdate(
      { _col: 'ventas' },
      { $inc: { sec: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this._id = contador.sec;
  }
});

module.exports = mongoose.model('Venta', ventaSchema, 'ventas');

