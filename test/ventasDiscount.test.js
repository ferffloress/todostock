const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calcularPrecioFacturado,
  calcularSubtotalItem,
} = require("../src/utils/precios");

test("aplica descuento del 20% en ventas mayoristas por bulto", () => {
  assert.equal(calcularPrecioFacturado("bulto", 100), 80);
  assert.equal(
    calcularSubtotalItem({
      tipoVenta: "bulto",
      cantidad: 3,
      precioUnitario: 100,
    }),
    240,
  );
});

test("no aplica descuento en ventas minoristas", () => {
  assert.equal(calcularPrecioFacturado("unidad", 100), 100);
  assert.equal(
    calcularSubtotalItem({
      tipoVenta: "unidad",
      cantidad: 3,
      precioUnitario: 100,
    }),
    300,
  );
});
