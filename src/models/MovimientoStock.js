const { randomUUID } = require('crypto');

class MovimientoStock {
  constructor(data) {
    this.id = data.id || randomUUID();
    this.tipo = data.tipo;
    this.producto_id = data.producto_id;
    this.lote_id = data.lote_id || null;
    this.cantidad = data.cantidad;
    this.referencia = data.referencia || null;
    this.observaciones = data.observaciones || null;
    this.fecha = data.fecha || new Date().toISOString();
  }
}

module.exports = MovimientoStock;
