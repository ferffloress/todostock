class Lote {
    constructor(id, producto_id, proveedor_id, numero_lote, fecha_vencimiento, fecha_ingreso, cantidad_inicial, cantidad_actual, costo_unitario) {
        this.id = id;
        this.producto_id = producto_id;
        this.proveedor_id = proveedor_id;
        this.numero_lote = numero_lote;
        this.fecha_vencimiento = fecha_vencimiento;
        this.fecha_ingreso = fecha_ingreso;
        this.cantidad_inicial = cantidad_inicial;
        this.cantidad_actual = cantidad_actual;
        this.costo_unitario = costo_unitario;
    }
}

module.exports = Lote;
