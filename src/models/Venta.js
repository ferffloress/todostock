const { randomUUID } = require('crypto');

class Venta {
  constructor(data) {
    this.id = data.id || randomUUID();
    this.cliente_id = data.cliente_id;
    this.fecha = data.fecha || new Date().toISOString();
    this.estado = data.estado || 'pendiente';
    this.items = data.items || [];
    this.total = data.total || 0;
    this.observaciones = data.observaciones || null;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }
}

module.exports = Venta;
