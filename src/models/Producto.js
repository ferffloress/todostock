const { randomUUID } = require('crypto');

class Producto {
  constructor(data) {
    this.id = data.id || randomUUID();
    this.nombre = (data.nombre || '').trim();
    this.categoria = (data.categoria || '').trim();
    this.precio_costo = data.precio_costo;
    this.precio_venta = data.precio_venta;
    this.stock_actual = data.stock_actual;
    this.stock_minimo = data.stock_minimo;
    this.unidad_medida = (data.unidad_medida || '').trim();
    this.activo = data.activo !== undefined ? data.activo : true;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }
}

module.exports = Producto;
