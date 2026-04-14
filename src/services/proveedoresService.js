const { randomUUID } = require('crypto');
const proveedoresStorage = require('../storage/proveedoresStorage');
const { validate } = require('../validators/proveedoresValidator');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const proveedoresService = {
  getAll() {
    return proveedoresStorage.getAll();
  },

  getById(id) {
    const proveedor = proveedoresStorage.getById(id);
    if (!proveedor) throw makeError('Proveedor no encontrado', 404);
    return proveedor;
  },

  create(data) {
    const { errors } = validate(data);
    if (errors.length > 0) {
      const err = makeError('Datos inválidos', 422);
      err.details = errors;
      throw err;
    }
    const proveedor = {
      id: randomUUID(),
      nombre: data.nombre.trim(),
      cuit: data.cuit.trim(),
      contacto: data.contacto || null,
      telefono: data.telefono || null,
      email: data.email || null,
      condicion_pago: data.condicion_pago || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return proveedoresStorage.create(proveedor);
  },

  update(id, data) {
    const existing = proveedoresStorage.getById(id);
    if (!existing) throw makeError('Proveedor no encontrado', 404);

    const merged = { ...existing, ...data };
    const { errors } = validate(merged);
    if (errors.length > 0) {
      const err = makeError('Datos inválidos', 422);
      err.details = errors;
      throw err;
    }

    const updateData = { ...data, updated_at: new Date().toISOString() };
    return proveedoresStorage.update(id, updateData);
  },

  delete(id) {
    const existing = proveedoresStorage.getById(id);
    if (!existing) throw makeError('Proveedor no encontrado', 404);
    return proveedoresStorage.delete(id);
  },
};

module.exports = proveedoresService;
