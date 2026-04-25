const { randomUUID } = require('crypto');

class Proveedor {
  constructor(data) {
    this.id = data.id || randomUUID();
    this.nombre = (data.nombre || '').trim();
    this.cuit = (data.cuit || '').trim();
    this.contacto = data.contacto || null;
    this.telefono = data.telefono || null;
    this.email = data.email || null;
    this.condicion_pago = data.condicion_pago || null;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }
}

module.exports = Proveedor;
