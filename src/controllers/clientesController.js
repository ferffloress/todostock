const Cliente = require('../models/Cliente');
const CuentaCorriente = require('../models/CuentaCorriente');
const Venta = require('../models/Venta');
const { validate } = require('../validators/clientesValidator');
const Cobranza = require('../models/Cobranza');

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

  async formularioCobrar(req, res, next) {
    try {
      const cliente = await Cliente.findById(Number(req.params.id));
      if (!cliente) throw makeError('Cliente no encontrado', 404);
      if (cliente.saldo_cuenta_corriente <= 0)
        throw makeError('Este cliente no tiene saldo pendiente', 400);
      res.render('nuevaCobranza', { titulo: 'Registrar Cobro', cliente, error: null });
    } catch (err) {
      next(err);
    }
  },

  async registrarCobro(req, res, next) {
    const cliente = await Cliente.findById(Number(req.params.id));
    try {
      if (!cliente) throw makeError('Cliente no encontrado', 404);

      const monto = Number(req.body.monto);
      const forma_pago = req.body.forma_pago;

      if (!monto || monto <= 0)
        throw makeError('El monto debe ser mayor a cero', 400);
      if (!['efectivo', 'transferencia', 'cheque'].includes(forma_pago))
        throw makeError('Forma de pago inválida', 400);
      if ((forma_pago === 'transferencia' || forma_pago === 'cheque') && !req.body.nro_comprobante)
        throw makeError('El número de comprobante es requerido', 400);
      if (forma_pago === 'cheque' && !req.body.fecha_vto_cheque)
        throw makeError('La fecha de vencimiento del cheque es requerida', 400);
      if (forma_pago === 'cheque') {
        const fechaVto = new Date(req.body.fecha_vto_cheque);
        const minFecha = new Date();
        minFecha.setDate(minFecha.getDate() - 15);
        minFecha.setHours(0, 0, 0, 0);
        if (fechaVto < minFecha) {
          throw makeError('El cheque está vencido hace más de 15 días y no puede ser aceptado', 400);
        }
      }

      await new Cobranza({
        cliente_id: cliente._id,
        monto,
        forma_pago,
        observaciones: req.body.observaciones || null,
        nro_comprobante: req.body.nro_comprobante || null,
        fecha_vto_cheque: req.body.fecha_vto_cheque || null,
      }).save();

      const nuevoSaldo = cliente.saldo_cuenta_corriente - monto;

      await new CuentaCorriente({
        cliente_id: cliente._id,
        tipo: 'credito',
        monto,
        descripcion: `Cobro registrado (${forma_pago})`,
        saldo_resultante: nuevoSaldo,
      }).save();

      await Cliente.findByIdAndUpdate(cliente._id, { saldo_cuenta_corriente: nuevoSaldo });

      res.redirect(`/clientes/${cliente._id}/cuenta-corriente`);
    } catch (err) {
      res.render('nuevaCobranza', { titulo: 'Registrar Cobro', cliente, error: err.message });
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
