const productosStorage = require('../storage/productosStorage');
const lotesStorage = require('../storage/lotesStorage');
const clientesStorage = require('../storage/clientesStorage');
const productosService = require('./productosService');
const lotesService = require('./lotesService');

const alertasService = {
  getAlertas() {
    const productos = productosStorage.getAll();
    const lotes = lotesStorage.getAll();
    const clientes = clientesStorage.getAll();

    const stock_bajo = productos.filter((p) => productosService.checkStockAlert(p));

    const lotes_por_vencer = lotes.filter((l) => lotesService.checkVencimientoAlert(l));

    const clientes_excedidos = clientes.filter(
      (c) => c.saldo_cuenta_corriente > c.limite_credito
    );

    return {
      stock_bajo,
      lotes_por_vencer,
      clientes_excedidos,
    };
  },
};

module.exports = alertasService;
