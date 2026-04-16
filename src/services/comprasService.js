const { randomUUID } = require('crypto');
const comprasStorage = require('../storage/comprasStorage');
const proveedoresStorage = require('../storage/proveedoresStorage');
const productosStorage = require('../storage/productosStorage');
const lotesService = require('./lotesService');
const movimientosStockService = require('./movimientosStockService');
const { validate } = require('../validators/comprasValidator');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const comprasService = {
  getAll() {
    return comprasStorage.getAll();
  },

  getById(id) {
    const compra = comprasStorage.getById(id);
    if (!compra) throw makeError('Compra no encontrada', 404);
    return compra;
  },

  create(data) {
    const { errors } = validate(data);
    if (errors.length > 0) {
      const err = makeError('Datos inválidos', 422);
      err.details = errors;
      throw err;
    }

    const proveedor = proveedoresStorage.getById(data.proveedor_id);
    if (!proveedor) throw makeError('Proveedor no encontrado', 404);

    // Validate all productos exist
    for (const item of data.items) {
      const producto = productosStorage.getById(item.producto_id);
      if (!producto) throw makeError(`Producto no encontrado: ${item.producto_id}`, 404);
    }

    const total = data.items.reduce((sum, item) => sum + item.cantidad * item.precio_unitario, 0);

    const items = data.items.map((item) => ({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      numero_lote: item.numero_lote,
      fecha_vencimiento: item.fecha_vencimiento,
      subtotal: item.cantidad * item.precio_unitario,
    }));

    const compra = {
      id: randomUUID(),
      proveedor_id: data.proveedor_id,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      items,
      total,
      observaciones: data.observaciones || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return comprasStorage.create(compra);
  },

  recibir(id) {
    const compra = comprasStorage.getById(id);
    if (!compra) throw makeError('Compra no encontrada', 404);

    if (compra.estado !== 'pendiente') {
      throw makeError(`No se puede recibir una compra en estado '${compra.estado}'`, 400);
    }

    for (const item of compra.items) {
      // Create lote
      const lote = lotesService.create({
        producto_id: item.producto_id,
        proveedor_id: compra.proveedor_id,
        numero_lote: item.numero_lote,
        fecha_vencimiento: item.fecha_vencimiento,
        cantidad_inicial: item.cantidad,
        cantidad_actual: item.cantidad,
        costo_unitario: item.precio_unitario,
      });

      // Update producto stock
      const producto = productosStorage.getById(item.producto_id);
      productosStorage.update(item.producto_id, {
        stock_actual: producto.stock_actual + item.cantidad,
        updated_at: new Date().toISOString(),
      });

      // Log movimiento stock
      movimientosStockService.logIngreso(
        item.producto_id,
        lote.id,
        item.cantidad,
        compra.id,
        `Recepción de compra ${compra.id}`
      );
    }

    return comprasStorage.update(id, { estado: 'recibida', updated_at: new Date().toISOString() });
  },

  cancelar(id) {
    const compra = comprasStorage.getById(id);
    if (!compra) throw makeError('Compra no encontrada', 404);

    if (compra.estado !== 'pendiente') {
      throw makeError(`No se puede cancelar una compra en estado '${compra.estado}'`, 400);
    }

    return comprasStorage.update(id, { estado: 'cancelada', updated_at: new Date().toISOString() });
  },
};

module.exports = comprasService;
