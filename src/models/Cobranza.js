const { randomUUID } = require('crypto');

class Cobranza {
  constructor(data) {
    this.id = data.id || randomUUID();
    this.cliente_id = data.cliente_id;
    this.monto = data.monto;
    this.forma_pago = data.forma_pago;
    this.fecha = data.fecha || new Date().toISOString();
    this.observaciones = data.observaciones || null;
    this.created_at = data.created_at || new Date().toISOString();
  }
}

module.exports = Cobranza;
