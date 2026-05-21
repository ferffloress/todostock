const Producto = require('../models/Producto');
const Lote = require('../models/Lote');
const Cliente = require('../models/Cliente');

const alertasController = {

  async obtener(req, res, next) {
    try {
      const ahora = new Date();

      const stock_bajo = await Producto.find({
        $expr: { $lte: ['$stock_actual', '$stock_minimo'] }
      });

      const lotes_por_vencer = await Lote.find({
        cantidad_actual:  { $gt: 0 },
        fecha_vencimiento: {
          $gte: ahora,
          $lte: new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      const clientes_excedidos = await Cliente.find({
        $expr: { $gt: ['$saldo_cuenta_corriente', '$limite_credito'] }
      });

      res.json({ stock_bajo, lotes_por_vencer, clientes_excedidos });
    } catch (err) { next(err); }
  },
};

module.exports = alertasController;