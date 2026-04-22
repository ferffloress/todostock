const Cobranza = require('../models/Cobranza');
const CuentaCorriente = require('../models/CuentaCorriente');
const createStore = require('../data/store');
const { validate } = require('../validators/cobranzasValidator');

const cobranzasStore = createStore('cobranzas.json');
const clientesStore = createStore('clientes.json');
const cuentasStore = createStore('cuentasCorrientes.json');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const cobranzasController = {
  listar(req, res, next) {
    try {
      res.json(cobranzasStore.getAll());
    } catch (err) {
      next(err);
    }
  },

  obtener(req, res, next) {
    try {
      const cobranza = cobranzasStore.getById(req.params.id);
      if (!cobranza) throw makeError('Cobranza no encontrada', 404);
      res.json(cobranza);
    } catch (err) {
      next(err);
    }
  },

  crear(req, res, next) {
    try {
      const { errors } = validate(req.body);
      if (errors.length > 0) {
        const err = makeError('Datos inválidos', 422);
        err.details = errors;
        throw err;
      }
      const cliente = clientesStore.getById(req.body.cliente_id);
      if (!cliente) throw makeError('Cliente no encontrado', 404);

      const cobranza = new Cobranza(req.body);
      cobranzasStore.create(cobranza);

      const nuevoSaldo = cliente.saldo_cuenta_corriente - req.body.monto;
      const movCC = new CuentaCorriente({
        cliente_id: req.body.cliente_id,
        tipo: 'credito',
        monto: req.body.monto,
        referencia: cobranza.id,
        descripcion: 'Cobro registrado',
        saldo_resultante: nuevoSaldo,
      });
      cuentasStore.create(movCC);
      clientesStore.update(req.body.cliente_id, {
        saldo_cuenta_corriente: nuevoSaldo,
        updated_at: new Date().toISOString(),
      });

      res.status(201).json(cobranza);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = cobranzasController;
