const { randomUUID } = require('crypto');

class Lote {
  constructor(data) {
    this.id = data.id || randomUUID();
    this.producto_id = data.producto_id;
    this.proveedor_id = data.proveedor_id || null;
    this.numero_lote = data.numero_lote;
    this.fecha_vencimiento = data.fecha_vencimiento;
    this.fecha_ingreso = data.fecha_ingreso || new Date().toISOString();
    this.cantidad_inicial = data.cantidad_inicial;
    this.cantidad_actual = data.cantidad_actual !== undefined ? data.cantidad_actual : data.cantidad_inicial;
    this.costo_unitario = data.costo_unitario || 0;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }
}

module.exports = Lote;
