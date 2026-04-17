class CuentaCorriente {
    constructor(id, cliente_id, tipo, monto, fecha, referencia, descripcion, saldo_resultante) {
        this.id = id;
        this.cliente_id = cliente_id;
        this.tipo = tipo;
        this.monto = monto;
        this.fecha = fecha;
        this.referencia = referencia;
        this.descripcion = descripcion;
        this.saldo_resultante = saldo_resultante;
    }
}

module.exports = CuentaCorriente;
