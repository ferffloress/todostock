const Cliente = require('../models/Cliente');
const CuentaCorriente = require('../models/CuentaCorriente');
const Venta = require('../models/Venta');
const { validate } = require('../validators/clientesValidator');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const clientesController = {
  async listar(req, res, next) {
    try {
      const clientes = await Cliente.find({});
      res.render('clientes', { titulo: 'Listado de Clientes', clientes });
    } catch (err) {
      next(err);
    }
  },

  async listarJSON(req, res, next) {
    try {
      res.json(await Cliente.find({}));
    } catch (err) {
      next(err);
    }
  },

  async formularioNuevo(req, res) {
    res.render('nuevoCliente', { titulo: 'Alta Nuevo Cliente' });
  },

  async formularioEditar(req, res, next) {
    try {
      const cliente = await Cliente.findById(Number(req.params.id));
      if (!cliente) throw makeError('Cliente no encontrado', 404);
      res.render('editarCliente', { titulo: 'Editar Cliente', cliente });
    } catch (err) {
      next(err);
    }
  },
  async cuentaCorriente(req, res, next) {
    try {
      const cliente = await Cliente.findById(Number(req.params.id));
      if (!cliente) throw makeError('Cliente no encontrado', 404);
      const movimientos = await CuentaCorriente.find({ cliente_id: Number(req.params.id) }).sort({ fecha: -1 });
      res.render('cuentaCorriente', {
        titulo: 'Cuenta Corriente',
        cliente: { ...cliente.toObject(), movimientos, saldo_actual: cliente.saldo_cuenta_corriente },
      });
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const cliente = await Cliente.findById(Number(req.params.id));
      if (!cliente) throw makeError('Cliente no encontrado', 404);
      res.json(cliente);
    } catch (err) {
      next(err);
    }
  },

  async crear(req, res, next) {
    try {
        const body = {
        ...req.body,
        limite_credito: Number(req.body.limite_credito),
        saldo_cuenta_corriente: Number(req.body.saldo_cuenta_corriente),
      };

      const { errors } = validate(body);
      if (errors.length > 0) {
        return res.render('nuevoCliente', { titulo: 'Alta Nuevo Cliente', errores: errors, datos: body });
      }
      await new Cliente(body).save();
      res.redirect('/clientes');
    } catch (err) {
      next(err);
    }
  },

  async actualizar(req, res, next) {
    try {
      const existing = await Cliente.findById(Number(req.params.id));
      if (!existing) throw makeError('Cliente no encontrado', 404);
      
      const body = {
        ...req.body,
        limite_credito: Number(req.body.limite_credito),
        saldo_cuenta_corriente: Number(req.body.saldo_cuenta_corriente),
      };

      const merged = { ...existing.toObject(), ...body };
      const { errors } = validate(merged);

      if (errors.length > 0) {
        const err = makeError('Datos inválidos', 422);
        err.details = errors;
        throw err;
      }
      const updated = await Cliente.findByIdAndUpdate(Number(req.params.id), { ...body, updated_at: new Date().toISOString() }, { new: true });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async eliminar(req, res, next) {
    try {
      const existing = await Cliente.findById(Number(req.params.id));
      if (!existing) throw makeError('Cliente no encontrado', 404);
      const ventas = await Venta.find({ cliente_id: Number(req.params.id) });
      if (ventas.length > 0) throw makeError('No se puede eliminar: el cliente tiene ventas activas', 400);
      await Cliente.findByIdAndDelete(Number(req.params.id));
      res.json({ message: 'Cliente eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = clientesController;
