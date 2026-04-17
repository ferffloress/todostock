class Proveedor {
    constructor(id, nombre, cuit, contacto, telefono, email, condicion_pago) {
        this.id = id;
        this.nombre = nombre;
        this.cuit = cuit;
        this.contacto = contacto;
        this.telefono = telefono;
        this.email = email;
        this.condicion_pago = condicion_pago;
    }
}

module.exports = Proveedor;
