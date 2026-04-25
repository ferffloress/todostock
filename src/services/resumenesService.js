const productosStorage = require('../storage/productosStorage');
const lotesStorage = require('../storage/lotesStorage');
const ventasStorage = require('../storage/ventasStorage');
const cobranzasStorage = require('../storage/cobranzasStorage');
const comprasStorage = require('../storage/comprasStorage');
const clientesStorage = require('../storage/clientesStorage');

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const week = Math.round(((d - yearStart) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7) + 1;
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

const resumenesService = {
  getInventario() {
    const productos = productosStorage.getAll();
    const lotes = lotesStorage.getAll();
    const ahora = new Date();
    const en30Dias = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Calculate average cost per product from lotes
    const costoPorProducto = {};
    for (const lote of lotes) {
      if (!costoPorProducto[lote.producto_id]) {
        costoPorProducto[lote.producto_id] = { totalCosto: 0, totalCantidad: 0 };
      }
      if (lote.cantidad_actual > 0) {
        costoPorProducto[lote.producto_id].totalCosto += lote.costo_unitario * lote.cantidad_actual;
        costoPorProducto[lote.producto_id].totalCantidad += lote.cantidad_actual;
      }
    }

    const productosActivos = productos.filter((p) => p.activo);

    let valor_costo = 0;
    let valor_venta = 0;

    for (const p of productosActivos) {
      const costoData = costoPorProducto[p.id];
      let costoProm;
      if (costoData && costoData.totalCantidad > 0) {
        costoProm = costoData.totalCosto / costoData.totalCantidad;
      } else {
        costoProm = p.precio_costo;
      }
      valor_costo += p.stock_actual * costoProm;
      valor_venta += p.stock_actual * p.precio_venta;
    }

    const sin_stock = productosActivos.filter((p) => p.stock_actual === 0);
    const sobrestock = productosActivos.filter((p) => p.stock_actual > 3 * p.stock_minimo);

    const lotes_por_vencer_30 = lotes.filter((l) => {
      if (l.cantidad_actual <= 0) return false;
      const venc = new Date(l.fecha_vencimiento);
      return venc >= ahora && venc <= en30Dias;
    });

    return {
      total_productos_activos: productosActivos.length,
      valor_costo: Math.round(valor_costo * 100) / 100,
      valor_venta: Math.round(valor_venta * 100) / 100,
      sin_stock,
      sobrestock,
      lotes_por_vencer_30,
    };
  },

  getCaja() {
    const ahora = new Date();
    const inicioMes = startOfMonth(ahora);
    const finMes = endOfMonth(ahora);

    const ventas = ventasStorage.getAll();
    const cobranzas = cobranzasStorage.getAll();
    const compras = comprasStorage.getAll();
    const clientes = clientesStorage.getAll();

    const ventas_mes = ventas
      .filter((v) => {
        const fecha = new Date(v.fecha);
        return v.estado === 'despachada' && fecha >= inicioMes && fecha <= finMes;
      })
      .reduce((sum, v) => sum + v.total, 0);

    const cobrado_mes = cobranzas
      .filter((c) => {
        const fecha = new Date(c.fecha);
        return fecha >= inicioMes && fecha <= finMes;
      })
      .reduce((sum, c) => sum + c.monto, 0);

    const compras_mes = compras
      .filter((c) => {
        const fecha = new Date(c.fecha);
        return c.estado === 'recibida' && fecha >= inicioMes && fecha <= finMes;
      })
      .reduce((sum, c) => sum + c.total, 0);

    const clientes_deudores = clientes.filter((c) => c.saldo_cuenta_corriente > 0);

    return {
      ventas_mes: Math.round(ventas_mes * 100) / 100,
      cobrado_mes: Math.round(cobrado_mes * 100) / 100,
      compras_mes: Math.round(compras_mes * 100) / 100,
      clientes_deudores,
    };
  },

  getVentas() {
    const ahora = new Date();
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

    const ventas = ventasStorage.getAll();
    const ventasDespachadas = ventas.filter((v) => v.estado === 'despachada');

    // Top 5 productos by quantity sold
    const cantidadPorProducto = {};
    for (const venta of ventasDespachadas) {
      for (const item of venta.items) {
        if (!cantidadPorProducto[item.producto_id]) {
          cantidadPorProducto[item.producto_id] = { producto_id: item.producto_id, cantidad_total: 0 };
        }
        cantidadPorProducto[item.producto_id].cantidad_total += item.cantidad;
      }
    }
    const top5_productos = Object.values(cantidadPorProducto)
      .sort((a, b) => b.cantidad_total - a.cantidad_total)
      .slice(0, 5);

    // Top 5 clientes by total monto
    const montoPorCliente = {};
    for (const venta of ventasDespachadas) {
      if (!montoPorCliente[venta.cliente_id]) {
        montoPorCliente[venta.cliente_id] = { cliente_id: venta.cliente_id, monto_total: 0 };
      }
      montoPorCliente[venta.cliente_id].monto_total += venta.total;
    }
    const top5_clientes = Object.values(montoPorCliente)
      .sort((a, b) => b.monto_total - a.monto_total)
      .slice(0, 5);

    // Ventas por semana (last 30 days)
    const ventasUltimoMes = ventasDespachadas.filter(
      (v) => new Date(v.fecha) >= hace30Dias
    );
    const ventasPorSemana = {};
    for (const venta of ventasUltimoMes) {
      const semana = getISOWeek(venta.fecha);
      if (!ventasPorSemana[semana]) {
        ventasPorSemana[semana] = { semana, cantidad_ventas: 0, monto_total: 0 };
      }
      ventasPorSemana[semana].cantidad_ventas += 1;
      ventasPorSemana[semana].monto_total += venta.total;
    }
    const ventas_por_semana = Object.values(ventasPorSemana).sort((a, b) =>
      a.semana.localeCompare(b.semana)
    );

    return {
      top5_productos,
      top5_clientes,
      ventas_por_semana,
    };
  },
};

module.exports = resumenesService;
