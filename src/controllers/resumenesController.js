const createStore = require('../data/store');

const productosStore = createStore('productos.json');
const lotesStore = createStore('lotes.json');
const ventasStore = createStore('ventas.json');
const cobranzasStore = createStore('cobranzas.json');
const comprasStore = createStore('compras.json');
const clientesStore = createStore('clientes.json');

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const week = Math.round(((d - yearStart) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7) + 1;
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const resumenesController = {
  inventario(req, res, next) {
    try {
      const productos = productosStore.getAll();
      const lotes = lotesStore.getAll();
      const ahora = new Date();
      const en30Dias = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

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

      const productosActivos = productos.filter(p => p.activo);
      let valor_costo = 0;
      let valor_venta = 0;

      for (const p of productosActivos) {
        const costoData = costoPorProducto[p.id];
        const costoProm = costoData && costoData.totalCantidad > 0
          ? costoData.totalCosto / costoData.totalCantidad
          : p.precio_costo;
        valor_costo += p.stock_actual * costoProm;
        valor_venta += p.stock_actual * p.precio_venta;
      }

      res.json({
        total_productos_activos: productosActivos.length,
        valor_costo: Math.round(valor_costo * 100) / 100,
        valor_venta: Math.round(valor_venta * 100) / 100,
        sin_stock: productosActivos.filter(p => p.stock_actual === 0),
        sobrestock: productosActivos.filter(p => p.stock_actual > 3 * p.stock_minimo),
        lotes_por_vencer_30: lotes.filter(l => {
          if (l.cantidad_actual <= 0) return false;
          const venc = new Date(l.fecha_vencimiento);
          return venc >= ahora && venc <= en30Dias;
        }),
      });
    } catch (err) {
      next(err);
    }
  },

  caja(req, res, next) {
    try {
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);

      const ventas = ventasStore.getAll();
      const cobranzas = cobranzasStore.getAll();
      const compras = comprasStore.getAll();
      const clientes = clientesStore.getAll();

      const ventas_mes = ventas
        .filter(v => v.estado === 'despachada' && new Date(v.fecha) >= inicioMes && new Date(v.fecha) <= finMes)
        .reduce((sum, v) => sum + v.total, 0);

      const cobrado_mes = cobranzas
        .filter(c => new Date(c.fecha) >= inicioMes && new Date(c.fecha) <= finMes)
        .reduce((sum, c) => sum + c.monto, 0);

      const compras_mes = compras
        .filter(c => c.estado === 'recibida' && new Date(c.fecha) >= inicioMes && new Date(c.fecha) <= finMes)
        .reduce((sum, c) => sum + c.total, 0);

      res.json({
        ventas_mes: Math.round(ventas_mes * 100) / 100,
        cobrado_mes: Math.round(cobrado_mes * 100) / 100,
        compras_mes: Math.round(compras_mes * 100) / 100,
        clientes_deudores: clientes.filter(c => c.saldo_cuenta_corriente > 0),
      });
    } catch (err) {
      next(err);
    }
  },

  ventas(req, res, next) {
    try {
      const ahora = new Date();
      const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ventasDespachadas = ventasStore.getAll().filter(v => v.estado === 'despachada');

      const cantidadPorProducto = {};
      for (const venta of ventasDespachadas) {
        for (const item of venta.items) {
          if (!cantidadPorProducto[item.producto_id]) {
            cantidadPorProducto[item.producto_id] = { producto_id: item.producto_id, cantidad_total: 0 };
          }
          cantidadPorProducto[item.producto_id].cantidad_total += item.cantidad;
        }
      }

      const montoPorCliente = {};
      for (const venta of ventasDespachadas) {
        if (!montoPorCliente[venta.cliente_id]) {
          montoPorCliente[venta.cliente_id] = { cliente_id: venta.cliente_id, monto_total: 0 };
        }
        montoPorCliente[venta.cliente_id].monto_total += venta.total;
      }

      const ventasUltimoMes = ventasDespachadas.filter(v => new Date(v.fecha) >= hace30Dias);
      const ventasPorSemana = {};
      for (const venta of ventasUltimoMes) {
        const semana = getISOWeek(venta.fecha);
        if (!ventasPorSemana[semana]) {
          ventasPorSemana[semana] = { semana, cantidad_ventas: 0, monto_total: 0 };
        }
        ventasPorSemana[semana].cantidad_ventas += 1;
        ventasPorSemana[semana].monto_total += venta.total;
      }

      res.json({
        top5_productos: Object.values(cantidadPorProducto).sort((a, b) => b.cantidad_total - a.cantidad_total).slice(0, 5),
        top5_clientes: Object.values(montoPorCliente).sort((a, b) => b.monto_total - a.monto_total).slice(0, 5),
        ventas_por_semana: Object.values(ventasPorSemana).sort((a, b) => a.semana.localeCompare(b.semana)),
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = resumenesController;
