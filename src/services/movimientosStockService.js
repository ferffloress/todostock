const { randomUUID } = require('crypto');
const movimientosStockStorage = require('../storage/movimientosStockStorage');

const movimientosStockService = {
  getAll() {
    return movimientosStockStorage.getAll();
  },

  getByProducto(producto_id) {
    // Retorna el historial de movimientos de un producto específico
    return movimientosStockStorage.findWhere((m) => m.producto_id === producto_id);
  },

  logIngreso(producto_id, lote_id, cantidad, stock_resultante, referencia, observaciones) {
    const movimiento = {
      id: randomUUID(),
      tipo: 'ingreso',
      producto_id,
      lote_id: lote_id || null,
      cantidad: Math.abs(cantidad), // Aseguramos que sea positivo
      stock_resultante, // Guardamos la "foto" del stock post-movimiento
      referencia: referencia || null,
      observaciones: observaciones || null,
      fecha: new Date().toISOString(),
    };
    return movimientosStockStorage.create(movimiento);
  },

  logEgreso(producto_id, lote_id, cantidad, stock_resultante, referencia, observaciones) {
    const movimiento = {
      id: randomUUID(),
      tipo: 'egreso',
      producto_id,
      lote_id: lote_id || null,
      cantidad: Math.abs(cantidad), // Lo guardamos como magnitud positiva
      stock_resultante,
      referencia: referencia || null,
      observaciones: observaciones || null,
      fecha: new Date().toISOString(),
    };
    return movimientosStockStorage.create(movimiento);
  },

  // Útil para inventarios manuales, roturas o mermas
  logAjuste(producto_id, lote_id, cantidad, stock_resultante, motivo) {
    const movimiento = {
      id: randomUUID(),
      tipo: 'ajuste',
      producto_id,
      lote_id: lote_id || null,
      cantidad, // Puede ser negativo (pérdida) o positivo (hallazgo)
      stock_resultante,
      referencia: 'AJUSTE-MANUAL',
      observaciones: motivo || 'Ajuste manual de inventario',
      fecha: new Date().toISOString(),
    };
    return movimientosStockStorage.create(movimiento);
  }
};

module.exports = movimientosStockService;
