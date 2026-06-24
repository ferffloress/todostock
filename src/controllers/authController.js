const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'todostock_jwt_secret';


exports.mostrarLogin = (req, res) => {
  const success = req.query.registro === 'ok'
    ? 'Cuenta creada correctamente. Ya podés iniciar sesión.'
    : null;
  res.render('login', { titulo: 'Iniciar Sesión', success });
};


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

    // Generar JWT
    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    req.session.usuarioLogueado = true;
    req.session.usuarioId = usuario._id;
    req.session.usuarioRol = usuario.rol;
    res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 });

    res.redirect('/');

  } catch (error) {
    next(error);
  }
};


exports.mostrarRegistro = (req, res) => {
  res.render('registro', { titulo: 'Crear cuenta' });
};


exports.procesarRegistro = async (req, res, next) => {
  try {
    const { nombre, email, password, confirmarPassword } = req.body;

    if (!nombre || !email || !password || !confirmarPassword) {
      return res.render('registro', {
        titulo: 'Crear cuenta',
        error: 'Todos los campos son obligatorios.'
      });
    }

    if (password !== confirmarPassword) {
      return res.render('registro', {
        titulo: 'Crear cuenta',
        error: 'Las contraseñas no coinciden.'
      });
    }

    const existe = await Usuario.findOne({ email: email.toLowerCase().trim() });
    if (existe) {
      return res.render('registro', {
        titulo: 'Crear cuenta',
        error: 'Ya existe una cuenta con ese email.'
      });
    }


    const nuevoUsuario = new Usuario({ nombre, email, password });
    await nuevoUsuario.save();

    res.redirect('/login?registro=ok');

  } catch (error) {
    next(error);
  }
};


exports.protegerRuta = (req, res, next) => {
  if (req.session && req.session.usuarioLogueado === true) {
    return next();
  }

  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.session.usuarioLogueado = true;
    req.session.usuarioId = decoded.id;
    req.session.usuarioRol = decoded.rol;
    return next();
  } catch (err) {

    res.clearCookie('token');
    return res.redirect('/login');
  }
};


exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Error destruyendo sesión:', err);
    res.clearCookie('connect.sid');
    res.clearCookie('token');
    res.redirect('/login');
  });
};


exports.soloAdmin = (req, res, next) => {
  if (req.session && req.session.usuarioRol === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'No tenés permiso para realizar esta acción.' });
};