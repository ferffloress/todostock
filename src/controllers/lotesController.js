const Lote = require('../models/Lote');
const MovimientoStock = require('../models/MovimientoStock');
const Producto = require('../models/Producto');


function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const lotesController = {
 async listar(req, res, next) {
    try {
      const lotes = await Lote.find();
      res.json(lotes);
    } catch (err) {
      next(err);
    }
  },

    async listarVista(req, res, next) {
    try {
      const lotes = await Lote.find ();
      res.render('lotes', { titulo: 'Gestión de Lotes (Stock)', lotes });
    } catch (err) {
      next(err);
    }
  },

  async listarPorProducto(req, res, next) {
    try {
      const lotes = await Lote.find({ producto_id: Number(req.params.producto_id) });
      if (!lotes.length) throw makeError('No se encontraron lotes para este producto', 404);
      res.json(lotes);
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const lote = await Lote.findById(Number(req.params.id));
      if (!lote) throw makeError('Lote no encontrado', 404);
      res.json(lote);
    } catch (err) {
      next(err);
    }
  },

  async detalleVista(req, res, next) {
    try {
      const lote = await Lote.findById(Number(req.params.id));
      if (!lote) throw makeError('Lote no encontrado', 404);
      const producto = await Producto.findById(lote.producto_id);
      const movimientos = await MovimientoStock.find({ lote_id: Number(req.params.id) }).sort({ fecha: -1 });
      res.render('detalleLote', { titulo: `Lote #${lote._id} - ${lote.numero_lote}`, lote, producto, movimientos });
    } catch (err) { next(err); }
  },

  async formularioNuevo(req, res) {
    res.render('nuevoLote', { titulo: 'Nuevo Lote' });
  },

  async crear(req, res, next) {
    try {
      const body = {
        ...req.body,
        producto_id: Number(req.body.producto_id),
        proveedor_id: req.body.proveedor_id ? Number(req.body.proveedor_id) : null,
        cantidad_inicial: Number(req.body.cantidad_inicial),
        costo_unitario: Number(req.body.costo_unitario),
      };
      await new Lote(body).save();
      res.redirect('/lotes');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = lotesController;
