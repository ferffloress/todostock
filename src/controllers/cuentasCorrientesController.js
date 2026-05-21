const CuentaCorriente = require('../models/CuentaCorriente');
const Cliente = require('../models/Cliente');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const cuentasCorrientesController = {

  async obtenerCuentaPorCliente(req, res, next) {
    try {
      const cliente = await Cliente.findById(Number(req.params.cliente_id));
      if (!cliente) throw makeError('Cliente no encontrado', 404);

      const movimientos = await CuentaCorriente
        .find({ cliente_id: Number(req.params.cliente_id) })
        .sort({ fecha: -1 });

      res.json({
        cliente: {
          id:                     cliente._id,
          nombre:                 cliente.nombre,
          saldo_cuenta_corriente: cliente.saldo_cuenta_corriente,
          limite_credito:         cliente.limite_credito
        },
        movimientos,
        saldo_actual: cliente.saldo_cuenta_corriente
      });
    } catch (err) { next(err); }
  },
};

module.exports = cuentasCorrientesController;