const Proveedor = require('../models/Proveedor');
const Compra = require('../models/Compra');
const { validate } = require('../validators/proveedoresValidator');

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const proveedoresController = {

  async listar(req, res, next) {
    try {
      res.json(await Proveedor.find());
    } catch (err) {
      next(err);
    }
  },

  async listarVista(req, res, next) {
    try {
      const proveedores = await Proveedor.find();
      res.render('proveedores', { titulo: 'Listado de Proveedores', proveedores });
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const proveedor = await Proveedor.findById(Number(req.params.id));
      if (!proveedor) throw makeError('Proveedor no encontrado', 404);
      res.json(proveedor);
    } catch (err) {
      next(err);
    }
  },

  async formularioNuevo(req, res) {
    res.render('nuevoProveedor', { titulo: 'Nuevo Proveedor' });
  },

  async formularioEditar(req, res, next) {
    try {
      const proveedor = await Proveedor.findById(Number(req.params.id));
      if (!proveedor) throw makeError('Proveedor no encontrado', 404);
      res.render('editarProveedor', { titulo: 'Editar Proveedor', proveedor });
    } catch (err) {
      next(err);
    }
  },

  async crear(req, res, next) {
    try {
      const { errors } = validate(req.body);
      if (errors.length > 0) {
        return res.render('nuevoProveedor', { titulo: 'Nuevo Proveedor', errores: errors, datos: req.body });
      }
      await new Proveedor(req.body).save();
      res.redirect('/proveedores');
    } catch (err) {
      next(err);
    }
  },

  async actualizar(req, res, next) {
    try {
      const existing = await Proveedor.findById(Number(req.params.id));
      if (!existing) throw makeError('Proveedor no encontrado', 404);
      const merged = { ...existing.toObject(), ...req.body };
      const { errors } = validate(merged);
      if (errors.length > 0) {
        const err = makeError('Datos inválidos', 422);
        err.details = errors;
        throw err;
      }
      const updated = await Proveedor.findByIdAndUpdate(Number(req.params.id), { ...req.body, updated_at: new Date().toISOString() }, { returnDocument: 'after' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async eliminar(req, res, next) {
    try {
      const existing = await Proveedor.findById(Number(req.params.id));
      if (!existing) throw makeError('Proveedor no encontrado', 404);
      const compras = await Compra.find({ proveedor_id: Number(req.params.id) });
      if (compras.length > 0) throw makeError('No se puede eliminar: el proveedor tiene compras registradas', 400);
      await Proveedor.findByIdAndDelete(Number(req.params.id));
      res.json({ message: 'Proveedor eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = proveedoresController;
