const Lote = require('../models/Lote');
const MovimientoStock = require('../models/MovimientoStock');
const Producto = require('../models/Producto');
const Venta = require('../models/Venta');



function makeError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const lotesController = {
 async listar(req, res, next) {
    try {
      const lotes = await Lote.find();
      res.json(lotes);
    } catch (err) {
      next(err);
    }
  },

    async listarVista(req, res, next) {
    try {
      const lotes = await Lote.find().lean ();
      const productos = await Producto.find().lean();
      const productoMap = {};
      productos.forEach(p => { productoMap[p._id] = p.nombre; });
      const lotesConNombre = lotes.map(l => ({
        ...l,
        nombreProducto: productoMap[l.producto_id] || `#${l.producto_id}`
      }));

      res.render('lotes', { titulo: 'Gestión de Lotes (Stock)', lotes: lotesConNombre });
    } catch (err) {
      next(err);
    }
  },

  async listarPorProducto(req, res, next) {
    try {
      const lotes = await Lote.find({ producto_id: Number(req.params.producto_id) });
      if (!lotes.length) throw makeError('No se encontraron lotes para este producto', 404);
      res.json(lotes);
    } catch (err) {
      next(err);
    }
  },

  async obtener(req, res, next) {
    try {
      const lote = await Lote.findById(Number(req.params.id));
      if (!lote) throw makeError('Lote no encontrado', 404);
      res.json(lote);
    } catch (err) {
      next(err);
    }
  },

  async detalleVista(req, res, next) {
    try {
      const lote = await Lote.findById(Number(req.params.id));
      if (!lote) throw makeError('Lote no encontrado', 404);
      const producto = await Producto.findById(lote.producto_id);
      const movimientos = await MovimientoStock.find({ lote_id: Number(req.params.id) }).sort({ fecha: -1 });
      res.render('detalleLote', { titulo: `Lote #${lote._id} - ${lote.numero_lote}`, lote, producto, movimientos });
    } catch (err) { next(err); }
  },

  async formularioNuevo(req, res, next) {
    try {
      const Proveedor = require('../models/Proveedor');
      const [productos, proveedores] = await Promise.all([
        Producto.find(),
        Proveedor.find()
      ]);
      res.render('nuevoLote', { titulo: 'Nuevo Lote', productos, proveedores });
    } catch (err) {
      next(err);
    }
  },

  async crear(req, res, next) {
    try {
      const body = {
        ...req.body,
        producto_id: Number(req.body.producto_id),
        proveedor_id: req.body.proveedor_id ? Number(req.body.proveedor_id) : null,
        cantidad_inicial: 0,
        cantidad_actual:  0,
        costo_unitario: Number(req.body.costo_unitario),
      };

      const duplicado = await Lote.findOne({ numero_lote: body.numero_lote });
      if (duplicado) {
        return res.render('nuevoLote', {
          titulo: 'Nuevo Lote',
          productos,
          proveedores,
          error: `El número de lote "${body.numero_lote}" ya existe.`
        });
      }

      const formatoValido = /^[A-Z]{2,4}-\d{4}-\d{3}$/.test(body.numero_lote);
      if (!formatoValido) {
        return res.status(400).json({ error: `Formato de número de lote inválido: "${body.numero_lote}". Debe ser como LAV-2024-A` });
      }

      await new Lote(body).save();
      res.redirect('/lotes');
    } catch (err) {
      next(err);
    }
  },


async formularioEditar(req, res, next) {
    try {
      const Proveedor = require('../models/Proveedor');
      const [lote, productos, proveedores] = await Promise.all([
        Lote.findById(Number(req.params.id)).lean(),
        Producto.find().lean(),
        Proveedor.find().lean()
      ]);
      if (!lote) throw makeError('Lote no encontrado', 404);
      res.render('editarLote', { titulo: `Editar Lote #${lote._id}`, lote, productos, proveedores });
    } catch (err) { next(err); }
  },

  async actualizar(req, res, next) {
    try {
      const body = {
        producto_id:      Number(req.body.producto_id),
        proveedor_id:     req.body.proveedor_id ? Number(req.body.proveedor_id) : null,
        numero_lote:      req.body.numero_lote,
        cantidad_inicial: Number(req.body.cantidad_inicial),
        cantidad_actual:  Number(req.body.cantidad_actual),
        costo_unitario:   Number(req.body.costo_unitario),
        fecha_vencimiento: req.body.fecha_vencimiento,
      };

      const duplicado = await Lote.findOne({ numero_lote: body.numero_lote, _id: { $ne: Number(req.params.id) } });
      if (duplicado) {
        const Proveedor = require('../models/Proveedor');
        const [lote, productos, proveedores] = await Promise.all([
          Lote.findById(Number(req.params.id)).lean(),
          Producto.find().lean(),
          Proveedor.find().lean()
        ]);
        return res.render('editarLote', {
          titulo: `Editar Lote #${lote._id}`,
          lote: { ...lote, ...body },
          productos, proveedores,
          error: `El número de lote "${body.numero_lote}" ya existe.`
        });
      }

      await Lote.findByIdAndUpdate(Number(req.params.id), body);
      res.redirect('/lotes');
    } catch (err) { next(err); }
  },

  async eliminar(req, res, next) {
    try {
      const lote = await Lote.findById(Number(req.params.id));
      if (!lote) throw makeError('Lote no encontrado', 404);

      // Verificar ventas pendientes que usen este lote
      const ventasPendientes = await Venta.find({
        estado: 'pendiente',
        'items.lote_id': Number(req.params.id)
      });
      if (ventasPendientes.length > 0)
        throw makeError('No se puede eliminar: el lote está en uso en ventas pendientes.', 400);

      // Verificar movimientos de stock asociados
      const movimientos = await MovimientoStock.find({ lote_id: Number(req.params.id) });
      if (movimientos.length > 0)
        throw makeError('No se puede eliminar: el lote tiene movimientos de stock registrados.', 400);

      await Lote.findByIdAndDelete(Number(req.params.id));
      res.redirect('/lotes');
    } catch (err) { next(err); }
  },

  async siguienteNumero(req, res, next) {
    try {
      const { prefijo, anio } = req.query;
      if (!prefijo || !anio) return res.json({ numero: '001' });

      const regex = new RegExp(`^${prefijo}-${anio}-`);
      const count = await Lote.countDocuments({ numero_lote: regex });
      const siguiente = String(count + 1).padStart(3, '0');
      res.json({ numero: siguiente });
    } catch (err) { next(err); }
  },

};
module.exports = lotesController;
