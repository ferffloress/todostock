const {
  calcularPrecioFacturado,
  calcularSubtotalItem,
  calcularTotalConDescuentoEfectivo,
  calcularDescuentoEfectivo,
  calcularUnidadesPorBulto,
  validarStockSuficiente,
} = require("../src/utils/precios");

describe("Módulo ventas - reglas de negocio", () => {
  test("aplica el descuento del 20% en ventas mayoristas por bulto", () => {
    expect(calcularPrecioFacturado("bulto", 100)).toBe(80);
    expect(
      calcularSubtotalItem({
        tipoVenta: "bulto",
        cantidad: 3,
        precioUnitario: 100,
      }),
    ).toBe(240);
  });

  test("no aplica descuento en ventas minoristas", () => {
    expect(calcularPrecioFacturado("unidad", 100)).toBe(100);
    expect(
      calcularSubtotalItem({
        tipoVenta: "unidad",
        cantidad: 3,
        precioUnitario: 100,
      }),
    ).toBe(300);
  });

  test("aplica el descuento del 10% cuando la forma de pago es efectivo", () => {
    expect(calcularTotalConDescuentoEfectivo(100, "efectivo")).toBe(90);
  });

  test("no aplica descuento en efectivo cuando la forma de pago no es efectiva", () => {
    expect(calcularTotalConDescuentoEfectivo(100, "transferencia")).toBe(100);
    expect(calcularTotalConDescuentoEfectivo(100, "cuenta_corriente")).toBe(
      100,
    );
  });

  test("mantiene el subtotal en cero si no hay cantidad o precio", () => {
    expect(
      calcularSubtotalItem({
        tipoVenta: "unidad",
        cantidad: 0,
        precioUnitario: 100,
      }),
    ).toBe(0);
    expect(
      calcularSubtotalItem({
        tipoVenta: "unidad",
        cantidad: 2,
        precioUnitario: 0,
      }),
    ).toBe(0);
  });

  test("calcula correctamente las unidades a partir de la cantidad de bultos", () => {
    expect(calcularUnidadesPorBulto(2, 6)).toBe(12);
    expect(calcularUnidadesPorBulto(1, 1)).toBe(1);
  });

  test("rechaza una venta cuando la cantidad solicitada supera el stock disponible", () => {
    expect(validarStockSuficiente(10, 8)).toBe(true);
    expect(validarStockSuficiente(10, 11)).toBe(false);
  });

  test("redondea correctamente los precios facturados", () => {
    expect(calcularPrecioFacturado("unidad", 10.005)).toBe(10.01);
    expect(calcularPrecioFacturado("bulto", 10.005)).toBe(8);
  });

  test("calcula el descuento efectivo y el total final de forma consistente", () => {
    expect(calcularDescuentoEfectivo(100)).toBe(10);
    expect(calcularTotalConDescuentoEfectivo(100, "efectivo")).toBe(90);
  });

  test("suma correctamente los subtotales para un total general", () => {
    const subtotal1 = calcularSubtotalItem({
      tipoVenta: "unidad",
      cantidad: 2,
      precioUnitario: 50,
    });
    const subtotal2 = calcularSubtotalItem({
      tipoVenta: "bulto",
      cantidad: 1,
      precioUnitario: 100,
    });

    expect(subtotal1).toBe(100);
    expect(subtotal2).toBe(80);
    expect(subtotal1 + subtotal2).toBe(180);
  });
});
