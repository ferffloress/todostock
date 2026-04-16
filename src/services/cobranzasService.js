const { randomUUID } = require('crypto');
const cobranzasStorage = require('../storage/cobranzasStorage');
const clientesStorage = require('../storage/clientesStorage');
const cuentasCorrientesService = require('./cuentasCorrientesService');
const { validate } = require('../validators/cobranzasValidator');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const cobranzasService = {
  getAll() {
    return cobranzasStorage.getAll();
  },

  getById(id) {
    const cobranza = cobranzasStorage.getById(id);
    if (!cobranza) throw makeError('Cobranza no encontrada', 404);
    return cobranza;
  },

  create(data) {
    const { errors } = validate(data);
    if (errors.length > 0) {
      const err = makeError('Datos inválidos', 422);
      err.details = errors;
      throw err;
    }

    const cliente = clientesStorage.getById(data.cliente_id);
    if (!cliente) throw makeError('Cliente no encontrado', 404);

    const cobranza = {
      id: randomUUID(),
      cliente_id: data.cliente_id,
      monto: data.monto,
      forma_pago: data.forma_pago,
      fecha: new Date().toISOString(),
      observaciones: data.observaciones || null,
      created_at: new Date().toISOString(),
    };

    cobranzasStorage.create(cobranza);

    // Update cuenta corriente (credito reduces the saldo)
    const nuevoSaldo = cliente.saldo_cuenta_corriente - data.monto;

    cuentasCorrientesService.createMovimiento({
      cliente_id: data.cliente_id,
      tipo: 'credito',
      monto: data.monto,
      referencia: cobranza.id,
      descripcion: 'Cobro registrado',
      saldo_resultante: nuevoSaldo,
    });

    clientesStorage.update(data.cliente_id, {
      saldo_cuenta_corriente: nuevoSaldo,
      updated_at: new Date().toISOString(),
    });

    return cobranza;
  },
};

module.exports = cobranzasService;
