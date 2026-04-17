class Cliente {
    constructor(id, nombre, cuit, contacto, telefono, email, limite_credito, saldo_cuenta_corriente) {
        this.id = id;
        this.nombre = nombre;
        this.cuit = cuit;
        this.contacto = contacto;
        this.telefono = telefono;
        this.email = email;
        this.limite_credito = limite_credito;
        this.saldo_cuenta_corriente = saldo_cuenta_corriente;
    }
}

module.exports = Cliente;
