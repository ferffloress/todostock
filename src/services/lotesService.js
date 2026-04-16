const { randomUUID } = require('crypto');
const lotesStorage = require('../storage/lotesStorage');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const lotesService = {
  getAll() {
    return lotesStorage.getAll();
  },

  getById(id) {
    const lote = lotesStorage.getById(id);
    if (!lote) throw makeError('Lote no encontrado', 404);
    return lote;
  },

  getByProducto(producto_id) {
    return lotesStorage.findWhere((lote) => lote.producto_id === producto_id);
  },

  getActivosByProducto(producto_id) {
    return lotesStorage
      .findWhere((lote) => lote.producto_id === producto_id && lote.cantidad_actual > 0)
      .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));
  },

  create(data) {
    const lote = {
      id: randomUUID(),
      producto_id: data.producto_id,
      proveedor_id: data.proveedor_id || null,
      numero_lote: data.numero_lote,
      fecha_vencimiento: data.fecha_vencimiento,
      fecha_ingreso: data.fecha_ingreso || new Date().toISOString(),
      cantidad_inicial: data.cantidad_inicial,
      cantidad_actual: data.cantidad_actual !== undefined ? data.cantidad_actual : data.cantidad_inicial,
      costo_unitario: data.costo_unitario || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return lotesStorage.create(lote);
  },

  checkVencimientoAlert(lote) {
    if (lote.cantidad_actual <= 0) return false;
    const ahora = new Date();
    const vencimiento = new Date(lote.fecha_vencimiento);
    const diasHastaVencimiento = (vencimiento - ahora) / (1000 * 60 * 60 * 24);
    return diasHastaVencimiento <= 30;
  },
};

module.exports = lotesService;
