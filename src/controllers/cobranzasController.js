const Cobranza = require('../models/Cobranza');
const CuentaCorriente = require('../models/CuentaCorriente');
const Cliente = require('../models/Cliente');
const { validate } = require('../validators/cobranzasValidator');


function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const cobranzasController = {
 async listar(req, res, next) {
    try {
      const cobranzas = await Cobranza.find();
      res.render('cobranzas', { cobranzas });
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const cobranza = await Cobranza.findById(Number(req.params.id));
      if (!cobranza) throw makeError('Cobranza no encontrada', 404);
      res.json(cobranza);
    } catch (err) {
      next(err);
    }
  },

 async crear(req, res, next) {
    try {
      const { errors } = validate(req.body);
      if (errors.length > 0) {
        const err = makeError('Datos inválidos', 422);
        err.details = errors;
        throw err;
      }
      const cliente = await Cliente.findById(Number(req.body.cliente_id));
      if (!cliente) throw makeError('Cliente no encontrado', 404);

      const cobranza = new Cobranza(req.body);
      await cobranza.save();

      const nuevoSaldo = cliente.saldo_cuenta_corriente - Number(req.body.monto);
      
      await new CuentaCorriente({
        cliente_id: Number(req.body.cliente_id),
        tipo: 'credito',
        monto: Number(req.body.monto),
        referencia: cobranza._id,
        descripcion: 'Cobro registrado',
        saldo_resultante: nuevoSaldo,
      }).save();

      await Cliente.findByIdAndUpdate(Number(req.body.cliente_id), {
        saldo_cuenta_corriente: nuevoSaldo,
      });

      res.status(201).json(cobranza);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = cobranzasController;
