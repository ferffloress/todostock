class MovimientoStock {
    constructor(id, tipo, producto_id, lote_id, cantidad, referencia, observaciones, fecha) {
        this.id = id;
        this.tipo = tipo;
        this.producto_id = producto_id;
        this.lote_id = lote_id;
        this.cantidad = cantidad;
        this.referencia = referencia;
        this.observaciones = observaciones;
        this.fecha = fecha;
    }
}

module.exports = MovimientoStock;
