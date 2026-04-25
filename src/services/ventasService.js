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

    const itemsConLote = [];
    for (const item of data.items) {
      const producto = productosStorage.getById(item.producto_id);
      if (!producto) throw makeError(`Producto no encontrado: ${item.producto_id}`, 404);

      // --- LOGICA FEFO: Asegurar orden por fecha de vencimiento ---
      const lotesActivos = lotesService.getActivosByProducto(item.producto_id)
        .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento));

      const stockTotal = lotesActivos.reduce((sum, l) => sum + l.cantidad_actual, 0);

      if (stockTotal < item.cantidad) {
        throw makeError(`Stock insuficiente para ${producto.nombre}. Disponible: ${stockTotal}`, 400);
      }

      let remaining = item.cantidad;
      const loteAssignments = [];
      
      for (const lote of lotesActivos) {
        if (remaining <= 0) break;
        const consume = Math.min(remaining, lote.cantidad_actual);
        loteAssignments.push({ 
          lote_id: lote.id, 
          cantidad: consume,
          vencimiento: lote.fecha_vencimiento // Opcional: para auditoría
        });
        remaining -= consume;
      }

      itemsConLote.push({
        producto_id: item.producto_id,
        nombre: producto.nombre, // Facilita la vista sin hacer otro find
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario,
        lote_assignments: loteAssignments,
      });
    }

    const total = itemsConLote.reduce((sum, item) => sum + item.subtotal, 0);

    // --- VALIDACIÓN CUENTA CORRIENTE ---
    if (cliente.saldo_cuenta_corriente + total > cliente.limite_credito) {
      throw makeError(`Límite de crédito superado. Saldo actual: $${cliente.saldo_cuenta_corriente}, Total venta: $${total}, Límite: $${cliente.limite_credito}`, 400);
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
      throw makeError(`Estado inválido: ${venta.estado}`, 400);
    }

    // --- PROCESAR DESPACHO ---
    venta.items.forEach(item => {
      item.lote_assignments.forEach(assignment => {
        // 1. Descontar del lote
        const lote = lotesStorage.getById(assignment.lote_id);
        lotesStorage.update(assignment.lote_id, {
          cantidad_actual: lote.cantidad_actual - assignment.cantidad,
          updated_at: new Date().toISOString(),
        });

        // 2. Descontar stock general del producto
        const producto = productosStorage.getById(item.producto_id);
        productosStorage.update(item.producto_id, {
          stock_actual: producto.stock_actual - assignment.cantidad,
          updated_at: new Date().toISOString(),
        });

        // 3. Log de movimiento
        movimientosStockService.logEgreso(
          item.producto_id,
          assignment.lote_id,
          assignment.cantidad,
          venta.id,
          `Despacho Venta #${venta.id.substring(0,8)}`
        );
      });
    });

    // --- ACTUALIZAR CUENTA CORRIENTE ---
    const cliente = clientesStorage.getById(venta.cliente_id);
    const nuevoSaldo = cliente.saldo_cuenta_corriente + venta.total;

    cuentasCorrientesService.createMovimiento({
      cliente_id: venta.cliente_id,
      tipo: 'debito',
      monto: venta.total,
      referencia: venta.id,
      descripcion: `Venta #${venta.id.substring(0,8)} despachada`,
      saldo_resultante: nuevoSaldo,
    });

    clientesStorage.update(venta.cliente_id, {
      saldo_cuenta_corriente: nuevoSaldo,
      updated_at: new Date().toISOString(),
    });

    return ventasStorage.update(id, { 
      estado: 'despachada', 
      fecha_despacho: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    });
  },

  cancelar(id) {
    const venta = ventasStorage.getById(id);
    if (!venta) throw makeError('Venta no encontrada', 404);

    if (venta.estado !== 'pendiente') {
      throw makeError('Solo se pueden cancelar ventas pendientes', 400);
    }

    return ventasStorage.update(id, { 
      estado: 'cancelada', 
      updated_at: new Date().toISOString() 
    });
  },
};

module.exports = ventasService;
