class Compra {
    constructor(id, proveedor_id, fecha, estado, items, total, observaciones) {
        this.id = id;
        this.proveedor_id = proveedor_id;
        this.fecha = fecha;
        this.estado = estado;
        this.items = items;
        this.total = total;
        this.observaciones = observaciones;
    }
}

module.exports = Compra;
