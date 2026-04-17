class Venta {
    constructor(id, cliente_id, fecha, estado, items, total, observaciones) {
        this.id = id;
        this.cliente_id = cliente_id;
        this.fecha = fecha;
        this.estado = estado;
        this.items = items;
        this.total = total;
        this.observaciones = observaciones;
    }
}

module.exports = Venta;
