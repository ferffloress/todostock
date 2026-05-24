const Producto = require("../models/Producto");
const Venta = require("../models/Venta");
const Lote = require("../models/Lote");
const { validate } = require("../validators/productosValidator");

function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const productosController = {
  async listar(req, res, next) {
    try {
      const productos = await Producto.find();
      res.render("productos", { titulo: "Listado de Productos", productos });
    } catch (err) {
      next(err);
    }
  },

  async listarJSON(req, res, next) {
    try {
      res.json(await Producto.find());
    } catch (err) {
      next(err);
    }
  },

  formularioNuevo(req, res) {
    res.render("nuevoProducto", { titulo: "Nuevo Producto" });
  },

  async obtener(req, res, next) {
    try {
      const producto = await Producto.findById(req.params.id);
      if (!producto) throw makeError("Producto no encontrado", 404);
      res.json(producto);
    } catch (err) {
      next(err);
    }
  },

  async crear(req, res, next) {
    try {
      const body = {
        ...req.body,
        precio_costo: Number(req.body.precio_costo),
        precio_venta: Number(req.body.precio_venta),
        stock_actual: Number(req.body.stock_actual),
        stock_minimo: Number(req.body.stock_minimo),
      };
      const { errors } = validate(body);
      if (errors.length > 0) {
        return res.render("nuevoProducto", { titulo: "Nuevo Producto", errores: errors, datos: body });
      }
      const producto = new Producto(body);
      await producto.save();
      res.redirect("/productos");
    } catch (err) {
      next(err);
    }
  },

  async actualizar(req, res, next) {
    try {
      const existing = await Producto.findById(req.params.id);
      if (!existing) throw makeError("Producto no encontrado", 404);
      const merged = { ...existing.toObject(), ...req.body };
      const { errors } = validate(merged);
      if (errors.length > 0) {
        const err = makeError("Datos inválidos", 422);
        err.details = errors;
        throw err;
      }
      const updated = await Producto.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updated_at: new Date().toISOString() },
        { new: true },
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async formularioEditar(req, res, next) {
    try {
      const producto = await Producto.findById(req.params.id);
      if (!producto) throw makeError("Producto no encontrado", 404);
      res.render("editarProducto", { titulo: "Editar Producto", producto });
    } catch (err) {
      next(err);
    }
  },

  async eliminar(req, res, next) {
    try {
      const existing = await Producto.findById(req.params.id);
      if (!existing) throw makeError("Producto no encontrado", 404);
      const ventas = await Venta.find({ "items.producto_id": req.params.id });
      const lotes = await Lote.find({ producto_id: req.params.id });
      if (ventas.length > 0)
        throw makeError(
          "No se puede eliminar: el producto tiene ventas activas",
          400,
        );
      if (lotes.length > 0)
        throw makeError(
          "No se puede eliminar: el producto tiene lotes registrados",
          400,
        );
      await Producto.findByIdAndDelete(req.params.id);
      res.json({ message: "Producto eliminado correctamente" });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = productosController;
