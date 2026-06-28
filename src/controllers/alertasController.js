const Producto = require('../models/Producto');
const Lote = require('../models/Lote');
const Cliente = require('../models/Cliente');
const RevisionPrecio = require('../models/RevisionPrecio');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const alertasController = {

  async obtener(req, res, next) {
    try {
      const ahora = new Date();

      const stock_bajo = await Producto.find({
        $expr: { $lte: ['$stock_actual', '$stock_minimo'] }
      });

      const lotes_raw = await Lote.find({
        cantidad_actual:  { $gt: 0 },
        fecha_vencimiento: {
          $gte: ahora,
          $lte: new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000)
        }
      }).lean();

      const lotes_por_vencer = await Promise.all(
        lotes_raw.map(async (l) => {
          const producto = await Producto.findById(l.producto_id).lean();
          return { ...l, nombreProducto: producto?.nombre ?? `Producto #${l.producto_id}` };
        })
      );

      const clientes_excedidos = await Cliente.find({
        $expr: { $gt: ['$saldo_cuenta_corriente', '$limite_credito'] }
      });

      const revisiones_raw = await RevisionPrecio.find({ resuelto: false }).lean();
      const revisiones_precio = await Promise.all(
        revisiones_raw.map(async (r) => {
          const producto = await Producto.findById(r.producto_id).lean();
          return {
            ...r,
            nombreProducto:      producto?.nombre ?? `Producto #${r.producto_id}`,
            precio_venta_actual: producto?.precio_venta ?? null,
          };
        })
      );

      res.render('alertas', {
        stock_bajo,
        lotes_por_vencer,
        clientes_excedidos,
        revisiones_precio,
      });

    } catch (err) {
      next(err);
    }
  },

  async resolverRevision(req, res, next) {
    try {
      const revision = await RevisionPrecio.findById(Number(req.params.id));
      if (!revision) throw makeError('Revisión no encontrada', 404);

      const precio_venta_nuevo = Number(req.body.precio_venta_nuevo);
      if (!precio_venta_nuevo || precio_venta_nuevo <= 0)
        throw makeError('El precio debe ser mayor a cero', 400);

      await Producto.findByIdAndUpdate(revision.producto_id, {
        precio_venta: precio_venta_nuevo,
      });
      await RevisionPrecio.findByIdAndUpdate(Number(req.params.id), { resuelto: true });

      res.redirect('/alertas');
    } catch (err) { next(err); }
  },

};

module.exports = alertasController;