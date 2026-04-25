const { randomUUID } = require('crypto');

class Cliente {
  constructor(data) {
    this.id = data.id || randomUUID();
    this.nombre = (data.nombre || '').trim();
    this.cuit = (data.cuit || '').trim();
    this.contacto = data.contacto || null;
    this.telefono = data.telefono || null;
    this.email = data.email || null;
    this.limite_credito = data.limite_credito;
    this.saldo_cuenta_corriente = data.saldo_cuenta_corriente !== undefined ? data.saldo_cuenta_corriente : 0;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }
}

module.exports = Cliente;
