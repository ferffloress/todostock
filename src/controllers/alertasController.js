const createStore = require('../data/store');

const productosStore = createStore('productos.json');
const lotesStore = createStore('lotes.json');
const clientesStore = createStore('clientes.json');

const alertasController = {
  obtener(req, res, next) {
    try {
      const productos = productosStore.getAll();
      const lotes = lotesStore.getAll();
      const clientes = clientesStore.getAll();
      const ahora = new Date();

      const stock_bajo = productos.filter(p => p.stock_actual <= p.stock_minimo);

      const lotes_por_vencer = lotes.filter(l => {
        if (l.cantidad_actual <= 0) return false;
        const dias = (new Date(l.fecha_vencimiento) - ahora) / (1000 * 60 * 60 * 24);
        return dias <= 30;
      });

      const clientes_excedidos = clientes.filter(c => c.saldo_cuenta_corriente > c.limite_credito);

      res.json({ stock_bajo, lotes_por_vencer, clientes_excedidos });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = alertasController;
