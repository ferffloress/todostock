const { randomUUID } = require('crypto');
const productosStorage = require('../storage/productosStorage');
const ventasStorage = require('../storage/ventasStorage');
const comprasStorage = require('../storage/comprasStorage');
const { validate } = require('../validators/productosValidator');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const productosService = {
  getAll() {
    return productosStorage.getAll();
  },

  getById(id) {
    const producto = productosStorage.getById(id);
    if (!producto) throw makeError('Producto no encontrado', 404);
    return producto;
  },

  create(data) {
    const { errors } = validate(data);
    if (errors.length > 0) {
      const err = makeError('Datos inválidos', 422);
      err.details = errors;
      throw err;
    }
    const producto = {
      id: randomUUID(),
      nombre: data.nombre.trim(),
      categoria: data.categoria.trim(),
      precio_costo: data.precio_costo,
      precio_venta: data.precio_venta,
      stock_actual: data.stock_actual,
      stock_minimo: data.stock_minimo,
      unidad_medida: data.unidad_medida.trim(),
      activo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return productosStorage.create(producto);
  },

  update(id, data) {
    const existing = productosStorage.getById(id);
    if (!existing) throw makeError('Producto no encontrado', 404);

    // Build merged object for validation (partial update)
    const merged = { ...existing, ...data };
    const { errors } = validate(merged);
    if (errors.length > 0) {
      const err = makeError('Datos inválidos', 422);
      err.details = errors;
      throw err;
    }

    const updateData = { ...data, updated_at: new Date().toISOString() };
    return productosStorage.update(id, updateData);
  },

  delete(id) {
    const existing = productosStorage.getById(id);
    if (!existing) throw makeError('Producto no encontrado', 404);

    const ventasActivas = ventasStorage.findWhere(
      (v) => v.estado !== 'cancelada' && v.items.some((i) => i.producto_id === id)
    );
    if (ventasActivas.length > 0) {
      throw makeError('No se puede eliminar un producto con ventas activas', 400);
    }

    const comprasActivas = comprasStorage.findWhere(
      (c) => c.estado !== 'cancelada' && c.items.some((i) => i.producto_id === id)
    );
    if (comprasActivas.length > 0) {
      throw makeError('No se puede eliminar un producto con compras activas', 400);
    }

    return productosStorage.delete(id);
  },

  checkStockAlert(producto) {
    return producto.stock_actual <= producto.stock_minimo;
  },
};

module.exports = productosService;
