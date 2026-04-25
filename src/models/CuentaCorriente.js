const { randomUUID } = require('crypto');

class CuentaCorriente {
  constructor(data) {
    this.id = data.id || randomUUID();
    this.cliente_id = data.cliente_id;
    this.tipo = data.tipo;
    this.monto = data.monto;
    this.fecha = data.fecha || new Date().toISOString();
    this.referencia = data.referencia || null;
    this.descripcion = data.descripcion || null;
    this.saldo_resultante = data.saldo_resultante;
  }
}

module.exports = CuentaCorriente;
