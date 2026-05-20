const Lote = require('../models/Lote');
const createStore = require('../models/Lote');


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
      const lotes = await Lote.find({ producto_id: req.params.producto_id });
      if (!lotes.length) throw makeError('No se encontraron lotes para este producto', 404);
      res.json(lotes);
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const lote = await Lote.find({ _id: req.params.id });
      if (!lote) throw makeError('Lote no encontrado', 404);
      res.json(lote);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = lotesController;
