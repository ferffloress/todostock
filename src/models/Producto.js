const mongoose = require('mongoose');
const Contador = require('./Contador');

const productoSchema = new mongoose.Schema({
  _id:           { type: Number },
  nombre:        { type: String, required: true, trim: true },
  categoria:     { type: String, required: true, trim: true },
  precio_costo:  { type: Number, required: true },
  precio_venta:  { type: Number, required: true },
  stock_actual:  { type: Number, default: 0 },
  stock_minimo:  { type: Number, default: 0 },
  unidad_medida: { type: String, required: true },
  activo:        { type: Boolean, default: true },
}, { timestamps: true,
    _id: false
 });  


productoSchema.pre('save', async function(next) {
  if (this.isNew) {
    const contador = await Contador.findOneAndUpdate(
      { _col: 'productos' },
      { $inc: { sec: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this._id = contador.sec;
  }
  next();
});


module.exports = mongoose.model('Producto', productoSchema, 'productos');