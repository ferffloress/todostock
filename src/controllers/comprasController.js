const Compra = require('../models/Compra');
const Lote = require('../models/Lote');
const Producto = require('../models/Producto');
const MovimientoStock = require('../models/MovimientoStock');
const Proveedor = require('../models/Proveedor');
const { validate } = require('../validators/comprasValidator');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const comprasController = {

  async listar(req, res, next) {
    try {
      res.json(await Compra.find());
    } catch (err) { next(err); }
  },

  async listarVista(req, res, next) {
    try {
      const compras = await Compra.find();
      res.render('compras', { titulo: 'Listado de Compras', compras });
    } catch (err) { next(err); }
  },

  async obtener(req, res, next) {
    try {
      const compra = await Compra.findById(Number(req.params.id));
      if (!compra) throw makeError('Compra no encontrada', 404);
      res.json(compra);
    } catch (err) { next(err); }
  },

  async crear(req, res, next) {
    try {
      const { errors } = validate(req.body);
      if (errors && errors.length > 0) {
        console.log("ERRORES DETECTADOS:", errors);
        const err = makeError('Datos inválidos', 422);
        err.details = errors;
        throw err;
      }

      for (const item of req.body.items) {
        const producto = await Producto.findById(Number(item.producto_id));
        if (!producto) throw makeError(`Producto no encontrado: ${item.producto_id}`, 404);
      }

      const items = req.body.items.map(item => ({
        producto_id:      Number(item.producto_id),
        cantidad:         Number(item.cantidad),
        precio_unitario:  Number(item.precio_unitario),
        numero_lote:      item.numero_lote,
        fecha_vencimiento: item.fecha_vencimiento,
        subtotal:         Number(item.cantidad) * Number(item.precio_unitario),
      }));

      const total = items.reduce((sum, i) => sum + i.subtotal, 0);
      const compra = await new Compra({ ...req.body, items, total }).save();
      res.status(201).json(compra);
    } catch (err) { next(err); }
  },

  async recibir(req, res, next) {
    try {
      const compra = await Compra.findById(Number(req.params.id));
      if (!compra) throw makeError('Compra no encontrada', 404);
      if (compra.estado !== 'pendiente') throw makeError(`No se puede recibir una compra en estado '${compra.estado}'`, 400);

      for (const item of compra.items) {
        const lote = await new Lote({
          producto_id:      item.producto_id,
          proveedor_id:     compra.proveedor_id,
          numero_lote:      item.numero_lote,
          fecha_vencimiento: item.fecha_vencimiento,
          cantidad_inicial: item.cantidad,
          cantidad_actual:  item.cantidad,
          costo_unitario:   item.precio_unitario,
        }).save();

        await Producto.findByIdAndUpdate(item.producto_id, {
          $inc: { stock_actual: item.cantidad }
        });

        await new MovimientoStock({
          tipo:          'ingreso',
          producto_id:   item.producto_id,
          lote_id:       lote._id,
          cantidad:      item.cantidad,
          referencia:    compra._id,
          observaciones: `Recepción de compra ${compra._id}`,
        }).save();
      }

      const updated = await Compra.findByIdAndUpdate(
        Number(req.params.id),
        { estado: 'recibida' },
        { new: true }
      );
      res.json(updated);
    } catch (err) { next(err); }
  },

  async cancelar(req, res, next) {
    try {
      const compra = await Compra.findById(Number(req.params.id));
      if (!compra) throw makeError('Compra no encontrada', 404);
      if (compra.estado !== 'pendiente') throw makeError(`No se puede cancelar una compra en estado '${compra.estado}'`, 400);
      const updated = await Compra.findByIdAndUpdate(
        Number(req.params.id),
        { estado: 'cancelada' },
        { new: true }
      );
      res.json(updated);
    } catch (err) { next(err); }
  },
};

module.exports = comprasController;
