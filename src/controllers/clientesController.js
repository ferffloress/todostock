const Cliente = require('../models/Cliente');
const CuentaCorriente = require('../models/CuentaCorriente');
const createStore = require('../data/store');
const { validate } = require('../validators/clientesValidator');

const clientesStore = createStore('clientes.json');
const cuentasStore = createStore('cuentasCorrientes.json');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const clientesController = {
  listar(req, res, next) {
    try {
      const clientes = clientesStore.getAll();
      res.render('clientes', { titulo: 'Listado de Clientes', clientes });
    } catch (err) {
      next(err);
    }
  },

  formularioNuevo(req, res) {
    res.render('nuevoCliente', { titulo: 'Alta Nuevo Cliente' });
  },

  cuentaCorriente(req, res, next) {
    try {
      const cliente = clientesStore.getById(req.params.id);
      if (!cliente) throw makeError('Cliente no encontrado', 404);
      const movimientos = cuentasStore
        .findWhere(m => m.cliente_id === req.params.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      res.render('cuentaCorriente', {
        titulo: 'Cuenta Corriente',
        cliente: { ...cliente, movimientos, saldo_actual: cliente.saldo_cuenta_corriente },
      });
    } catch (err) {
      next(err);
    }
  },

  obtener(req, res, next) {
    try {
      const cliente = clientesStore.getById(req.params.id);
      if (!cliente) throw makeError('Cliente no encontrado', 404);
      res.json(cliente);
    } catch (err) {
      next(err);
    }
  },

  crear(req, res, next) {
    try {
      const { errors } = validate(req.body);
      if (errors.length > 0) {
        const err = makeError('Datos inválidos', 422);
        err.details = errors;
        throw err;
      }
      const cliente = new Cliente(req.body);
      clientesStore.create(cliente);
      res.status(201).json(cliente);
    } catch (err) {
      next(err);
    }
  },

  actualizar(req, res, next) {
    try {
      const existing = clientesStore.getById(req.params.id);
      if (!existing) throw makeError('Cliente no encontrado', 404);
      const merged = { ...existing, ...req.body };
      const { errors } = validate(merged);
      if (errors.length > 0) {
        const err = makeError('Datos inválidos', 422);
        err.details = errors;
        throw err;
      }
      const updated = clientesStore.update(req.params.id, { ...req.body, updated_at: new Date().toISOString() });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  eliminar(req, res, next) {
    try {
      const existing = clientesStore.getById(req.params.id);
      if (!existing) throw makeError('Cliente no encontrado', 404);
      clientesStore.delete(req.params.id);
      res.json({ message: 'Cliente eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = clientesController;
