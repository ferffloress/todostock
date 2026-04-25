const { randomUUID } = require('crypto');
const cuentasCorrientesStorage = require('../storage/cuentasCorrientesStorage');
const clientesStorage = require('../storage/clientesStorage');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const cuentasCorrientesService = {
  getByCliente(cliente_id) {
    const cliente = clientesStorage.getById(cliente_id);
    if (!cliente) throw makeError('Cliente no encontrado', 404);

    const movimientos = cuentasCorrientesStorage
      .findWhere((m) => m.cliente_id === cliente_id)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return {
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        saldo_cuenta_corriente: cliente.saldo_cuenta_corriente,
        limite_credito: cliente.limite_credito,
      },
      movimientos,
      saldo_actual: cliente.saldo_cuenta_corriente,
    };
  },

  createMovimiento(data) {
    const movimiento = {
      id: randomUUID(),
      cliente_id: data.cliente_id,
      tipo: data.tipo,
      monto: data.monto,
      fecha: data.fecha || new Date().toISOString(),
      referencia: data.referencia || null,
      descripcion: data.descripcion || null,
      saldo_resultante: data.saldo_resultante,
    };
    return cuentasCorrientesStorage.create(movimiento);
  },
};

module.exports = cuentasCorrientesService;
