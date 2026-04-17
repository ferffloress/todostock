class Producto {
    constructor(id, nombre, categoria, precio_costo, precio_venta, stock_actual, stock_minimo, unidad_medida, activo) {
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio_costo = precio_costo;
        this.precio_venta = precio_venta;
        this.stock_actual = stock_actual;
        this.stock_minimo = stock_minimo;
        this.unidad_medida = unidad_medida;
        this.activo = activo;
    }
}

module.exports = Producto;
