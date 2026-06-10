const Usuario = require('../models/Usuario');

// Muestra el formulario de login
exports.mostrarLogin = (req, res) => {
  res.render('login', { titulo: 'Iniciar Sesión' });
};

// Valida lo que el usuario escribe en el formulario
exports.procesarLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('login', {
        titulo: 'Iniciar Sesión',
        error: 'Email y contraseña son obligatorios.'
      });
    }

    const usuario = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (!usuario) {
      return res.render('login', {
        titulo: 'Iniciar Sesión',
        error: 'El email o la contraseña son incorrectos.'
      });
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.render('login', {
        titulo: 'Iniciar Sesión',
        error: 'El email o la contraseña son incorrectos.'
      });
    }

    req.session.usuarioLogueado = true;
    req.session.usuarioId = usuario._id;
    req.session.usuarioRol = usuario.rol;
    res.redirect('/');

  } catch (error) {
    next(error);
  }
};

// Middleware para proteger rutas
exports.protegerRuta = (req, res, next) => {
  if (req.session && req.session.usuarioLogueado === true) {
    return next();
  }
  res.redirect('/login');
};

// Cierra sesión
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Error destruyendo sesión:', err);
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};