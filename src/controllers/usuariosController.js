const Usuario = require('../models/Usuario');

// Lista todos los usuarios
exports.listar = async (req, res, next) => {
  try {
    const usuarios = await Usuario.find({}).select('-password');
    res.render('usuarios', { titulo: 'Administrar usuarios', usuarios });
  } catch (error) {
    next(error);
  }
};

// Cambia el rol de un usuario
exports.cambiarRol = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.redirect('/usuarios');
    usuario.rol = usuario.rol === 'admin' ? 'user' : 'admin';
    await usuario.save();
    res.redirect('/usuarios');
  } catch (error) {
    next(error);
  }
};

// Edita el nombre de un usuario
exports.editar = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) return res.redirect('/usuarios');
    await Usuario.findByIdAndUpdate(req.params.id, { nombre: nombre.trim() });
    res.redirect('/usuarios');
  } catch (error) {
    next(error);
  }
};

// Elimina un usuario
exports.eliminar = async (req, res, next) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.redirect('/usuarios');
  } catch (error) {
    next(error);
  }
};

// Muestra el formulario de edición
exports.mostrarEditar = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');
    if (!usuario) return res.redirect('/usuarios');
    res.render('editarUsuario', { titulo: 'Editar usuario', usuario });
  } catch (error) {
    next(error);
  }
};

// Guarda los cambios
exports.editar = async (req, res, next) => {
  try {
    const { nombre, email, rol } = req.body;
    await Usuario.findByIdAndUpdate(req.params.id, { nombre, email, rol });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};