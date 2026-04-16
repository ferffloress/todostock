const { randomUUID } = require('crypto');
const ventasStorage = require('../storage/ventasStorage');
const clientesStorage = require('../storage/clientesStorage');
const productosStorage = require('../storage/productosStorage');
const lotesStorage = require('../storage/lotesStorage');
const lotesService = require('./lotesService');
const movimientosStockService = require('./movimientosStockService');
const cuentasCorrientesService = require('./cuentasCorrientesService');
const { validate } = require('../validators/ventasValidator');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const ventasService = {
  getAll() {
    return ventasStorage.getAll();
  },

  getById(id) {
    const venta = ventasStorage.getById(id);
    if (!venta) throw makeError('Venta no encontrada', 404);
    return venta;
  },

  create(data) {
    const { errors } = validate(data);
    if (errors.length > 0) {
      const err = makeError('Datos inválidos', 422);
      err.details = errors;
      throw err;
    }

    const cliente = clientesStorage.getById(data.cliente_id);
    if (!cliente) throw makeError('Cliente no encontrado', 404);

    // Check stock availability and assign FEFO lotes per item
    const itemsConLote = [];
    for (const item of data.items) {
      const producto = productosStorage.getById(item.producto_id);
      if (!producto) throw makeError(`Producto no encontrado: ${item.producto_id}`, 404);

      const lotesActivos = lotesService.getActivosByProducto(item.producto_id);
      const stockTotal = lotesActivos.reduce((sum, l) => sum + l.cantidad_actual, 0);

      if (stockTotal < item.cantidad) {
        throw makeError(`Stock insuficiente para producto ${producto.nombre}`, 400);
      }

      // FEFO: assign from earliest expiring lote
      // Determine which lote will be consumed (first FEFO lote with enough or partial)
      let remaining = item.cantidad;
      const loteAssignments = [];
      for (const lote of lotesActivos) {
        if (remaining <= 0) break;
        const consume = Math.min(remaining, lote.cantidad_actual);
        loteAssignments.push({ lote_id: lote.id, cantidad: consume });
        remaining -= consume;
      }

      itemsConLote.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario,
        lote_id: loteAssignments[0].lote_id, // primary lote (FEFO)
        lote_assignments: loteAssignments,    // all lotes to consume on despacho
      });
    }

    const total = itemsConLote.reduce((sum, item) => sum + item.subtotal, 0);

    // Check credit limit
    if (cliente.saldo_cuenta_corriente + total > cliente.limite_credito) {
      throw makeError('Límite de crédito insuficiente', 400);
    }

    const venta = {
      id: randomUUID(),
      cliente_id: data.cliente_id,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      items: itemsConLote,
      total,
      observaciones: data.observaciones || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return ventasStorage.create(venta);
  },

  despachar(id) {
    const venta = ventasStorage.getById(id);
    if (!venta) throw makeError('Venta no encontrada', 404);

    if (venta.estado !== 'pendiente') {
      throw makeError(`No se puede despachar una venta en estado '${venta.estado}'`, 400);
    }

    // Consume stock from lotes (FEFO assignments)
    for (const item of venta.items) {
      const assignments = item.lote_assignments || [{ lote_id: item.lote_id, cantidad: item.cantidad }];

      for (const assignment of assignments) {
        const lote = lotesStorage.getById(assignment.lote_id);
        if (lote) {
          lotesStorage.update(assignment.lote_id, {
            cantidad_actual: lote.cantidad_actual - assignment.cantidad,
            updated_at: new Date().toISOString(),
          });
        }

        // Update producto stock
        const producto = productosStorage.getById(item.producto_id);
        if (producto) {
          productosStorage.update(item.producto_id, {
            stock_actual: producto.stock_actual - assignment.cantidad,
            updated_at: new Date().toISOString(),
          });
        }

        // Log egreso
        movimientosStockService.logEgreso(
          item.producto_id,
          assignment.lote_id,
          assignment.cantidad,
          venta.id,
          `Despacho de venta ${venta.id}`
        );
      }
    }

    // Update cuenta corriente
    const cliente = clientesStorage.getById(venta.cliente_id);
    const nuevoSaldo = cliente.saldo_cuenta_corriente + venta.total;

    cuentasCorrientesService.createMovimiento({
      cliente_id: venta.cliente_id,
      tipo: 'debito',
      monto: venta.total,
      referencia: venta.id,
      descripcion: 'Venta despachada',
      saldo_resultante: nuevoSaldo,
    });

    clientesStorage.update(venta.cliente_id, {
      saldo_cuenta_corriente: nuevoSaldo,
      updated_at: new Date().toISOString(),
    });

    return ventasStorage.update(id, { estado: 'despachada', updated_at: new Date().toISOString() });
  },

  cancelar(id) {
    const venta = ventasStorage.getById(id);
    if (!venta) throw makeError('Venta no encontrada', 404);

    if (venta.estado !== 'pendiente') {
      throw makeError(`No se puede cancelar una venta en estado '${venta.estado}'`, 400);
    }

    return ventasStorage.update(id, { estado: 'cancelada', updated_at: new Date().toISOString() });
  },
};

module.exports = ventasService;
