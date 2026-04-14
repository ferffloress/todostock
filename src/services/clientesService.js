const { randomUUID } = require('crypto');
const clientesStorage = require('../storage/clientesStorage');
const { validate } = require('../validators/clientesValidator');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const clientesService = {
  getAll() {
    return clientesStorage.getAll();
  },

  getById(id) {
    const cliente = clientesStorage.getById(id);
    if (!cliente) throw makeError('Cliente no encontrado', 404);
    return cliente;
  },

  create(data) {
    const { errors } = validate(data);
    if (errors.length > 0) {
      const err = makeError('Datos inválidos', 422);
      err.details = errors;
      throw err;
    }
    const cliente = {
      id: randomUUID(),
      nombre: data.nombre.trim(),
      cuit: data.cuit.trim(),
      contacto: data.contacto || null,
      telefono: data.telefono || null,
      email: data.email || null,
      limite_credito: data.limite_credito,
      saldo_cuenta_corriente: data.saldo_cuenta_corriente !== undefined ? data.saldo_cuenta_corriente : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return clientesStorage.create(cliente);
  },

  update(id, data) {
    const existing = clientesStorage.getById(id);
    if (!existing) throw makeError('Cliente no encontrado', 404);

    const merged = { ...existing, ...data };
    const { errors } = validate(merged);
    if (errors.length > 0) {
      const err = makeError('Datos inválidos', 422);
      err.details = errors;
      throw err;
    }

    const updateData = { ...data, updated_at: new Date().toISOString() };
    return clientesStorage.update(id, updateData);
  },

  delete(id) {
    const existing = clientesStorage.getById(id);
    if (!existing) throw makeError('Cliente no encontrado', 404);
    return clientesStorage.delete(id);
  },
};

module.exports = clientesService;
