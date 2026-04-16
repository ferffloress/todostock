const { randomUUID } = require('crypto');
const movimientosStockStorage = require('../storage/movimientosStockStorage');

const movimientosStockService = {
  getAll() {
    return movimientosStockStorage.getAll();
  },

  getByProducto(producto_id) {
    return movimientosStockStorage.findWhere((m) => m.producto_id === producto_id);
  },

  logIngreso(producto_id, lote_id, cantidad, referencia, observaciones) {
    const movimiento = {
      id: randomUUID(),
      tipo: 'ingreso',
      producto_id,
      lote_id: lote_id || null,
      cantidad,
      referencia: referencia || null,
      observaciones: observaciones || null,
      fecha: new Date().toISOString(),
    };
    return movimientosStockStorage.create(movimiento);
  },

  logEgreso(producto_id, lote_id, cantidad, referencia, observaciones) {
    const movimiento = {
      id: randomUUID(),
      tipo: 'egreso',
      producto_id,
      lote_id: lote_id || null,
      cantidad,
      referencia: referencia || null,
      observaciones: observaciones || null,
      fecha: new Date().toISOString(),
    };
    return movimientosStockStorage.create(movimiento);
  },
};

module.exports = movimientosStockService;
