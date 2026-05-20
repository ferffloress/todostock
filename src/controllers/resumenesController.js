const Producto = require('../models/Producto');
const Lote = require('../models/Lote');
const Venta = require('../models/Venta');
const Cobranza = require('../models/Cobranza');
const Compra = require('../models/Compra');
const Cliente = require('../models/Cliente');

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const week = Math.round(((d - yearStart) / 86400000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7) + 1;
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const resumenesController = {

  async inventario(req, res, next) {
    try {
      const ahora = new Date();
      const en30Dias = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

      const productos = await Producto.find({ activo: true });
      const lotes = await Lote.find({ cantidad_actual: { $gt: 0 } });

      const costoPorProducto = {};
      for (const lote of lotes) {
        const pid = lote.producto_id;
        if (!costoPorProducto[pid]) costoPorProducto[pid] = { totalCosto: 0, totalCantidad: 0 };
        costoPorProducto[pid].totalCosto    += lote.costo_unitario * lote.cantidad_actual;
        costoPorProducto[pid].totalCantidad += lote.cantidad_actual;
      }

      let valor_costo = 0, valor_venta = 0;
      for (const p of productos) {
        const c = costoPorProducto[p._id];
        const costoProm = c?.totalCantidad > 0 ? c.totalCosto / c.totalCantidad : p.precio_costo;
        valor_costo += p.stock_actual * costoProm;
        valor_venta += p.stock_actual * p.precio_venta;
      }

      const lotesPorVencer = await Lote.find({
        cantidad_actual: { $gt: 0 },
        fecha_vencimiento: { $gte: ahora, $lte: en30Dias }
      });

      res.json({
        total_productos_activos: productos.length,
        valor_costo: Math.round(valor_costo * 100) / 100,
        valor_venta: Math.round(valor_venta * 100) / 100,
        sin_stock: productos.filter(p => p.stock_actual === 0),
        sobrestock: productos.filter(p => p.stock_actual > 3 * p.stock_minimo),
        lotes_por_vencer_30: lotesPorVencer,
      });
    } catch (err) { next(err); }
  },

  async caja(req, res, next) {
    try {
      const ahora = new Date();
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);

      const [ventas, cobranzas, compras, clientes] = await Promise.all([
        Venta.find({ estado: 'despachada', fecha: { $gte: inicioMes, $lte: finMes } }),
        Cobranza.find({ fecha: { $gte: inicioMes, $lte: finMes } }),
        Compra.find({ estado: 'recibida', fecha: { $gte: inicioMes, $lte: finMes } }),
        Cliente.find({ $expr: { $gt: ['$saldo_cuenta_corriente', 0] } }),
      ]);

      res.json({
        ventas_mes: Math.round(ventas.reduce((s, v) => s + v.total, 0) * 100) / 100,
        cobrado_mes: Math.round(cobranzas.reduce((s, c) => s + c.monto, 0) * 100) / 100,
        compras_mes: Math.round(compras.reduce((s, c) => s + c.total, 0) * 100) / 100,
        clientes_deudores: clientes,
      });
    } catch (err) { next(err); }
  },

  async ventas(req, res, next) {
    try {
      const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const ventasDespachadas = await Venta.find({ estado: 'despachada' });

      const cantidadPorProducto = {};
      const montoPorCliente = {};
      for (const venta of ventasDespachadas) {
        for (const item of venta.items) {
          const pid = item.producto_id;
          if (!cantidadPorProducto[pid]) cantidadPorProducto[pid] = { producto_id: pid, cantidad_total: 0 };
          cantidadPorProducto[pid].cantidad_total += item.cantidad || item.cantidad_unidades || 0;
        }
        const cid = venta.cliente_id;
        if (!montoPorCliente[cid]) montoPorCliente[cid] = { cliente_id: cid, monto_total: 0 };
        montoPorCliente[cid].monto_total += venta.total;
      }

      const ventasUltimoMes = ventasDespachadas.filter(v => new Date(v.fecha) >= hace30Dias);
      const ventasPorSemana = {};
      for (const venta of ventasUltimoMes) {
        const semana = getISOWeek(venta.fecha);
        if (!ventasPorSemana[semana]) ventasPorSemana[semana] = { semana, cantidad_ventas: 0, monto_total: 0 };
        ventasPorSemana[semana].cantidad_ventas += 1;
        ventasPorSemana[semana].monto_total     += venta.total;
      }

      res.json({
        top5_productos: Object.values(cantidadPorProducto).sort((a, b) => b.cantidad_total - a.cantidad_total).slice(0, 5),
        top5_clientes: Object.values(montoPorCliente).sort((a, b) => b.monto_total - a.monto_total).slice(0, 5),
        ventas_por_semana: Object.values(ventasPorSemana).sort((a, b) => a.semana.localeCompare(b.semana)),
      });
    } catch (err) { next(err); }
  },
};

module.exports = resumenesController;