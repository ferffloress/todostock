function calcularPrecioFacturado(tipoVenta, precioUnitario) {
  const precioBase = Number(precioUnitario) || 0;
  if (tipoVenta === "bulto") {
    return Number((precioBase * 0.8).toFixed(2));
  }
  return Number(precioBase.toFixed(2));
}

function calcularSubtotalItem({ tipoVenta, cantidad, precioUnitario }) {
  const cantidadFinal = Number(cantidad) || 0;
  const precioFacturado = calcularPrecioFacturado(tipoVenta, precioUnitario);
  return Number((cantidadFinal * precioFacturado).toFixed(2));
}

function calcularTotalConDescuentoEfectivo(total, formaPago) {
  const base = Number(total) || 0;
  if (formaPago === "efectivo") {
    return Number((base * 0.9).toFixed(2));
  }
  return Number(base.toFixed(2));
}

function calcularDescuentoEfectivo(total) {
  const base = Number(total) || 0;
  return Number((base * 0.1).toFixed(2));
}

function calcularUnidadesPorBulto(cantidadBultos, unidadesPorBulto) {
  const cantidad = Number(cantidadBultos) || 0;
  const factor = Number(unidadesPorBulto) || 1;
  return cantidad * factor;
}

function validarStockSuficiente(stockDisponible, cantidadSolicitada) {
  const stock = Number(stockDisponible) || 0;
  const cantidad = Number(cantidadSolicitada) || 0;
  return stock >= cantidad;
}

module.exports = {
  calcularPrecioFacturado,
  calcularSubtotalItem,
  calcularTotalConDescuentoEfectivo,
  calcularDescuentoEfectivo,
  calcularUnidadesPorBulto,
  validarStockSuficiente,
};
