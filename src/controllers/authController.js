const Usuario = require('../models/Usuario');

// Muestra el formulario de login
exports.mostrarLogin = (req, res) => {
  res.render('login', { titulo: 'Iniciar Sesión' });
};

// Valida lo que el usuario escribe en el formulario
exports.procesarLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //DATOS POR DEFECTO
    const EMAIL_DEFECTO = "usuario@todostock.com";
    const CLAVE_DEFECTO = "123456";

    //Si coinciden los datos por defecto
    if (email === EMAIL_DEFECTO && password === CLAVE_DEFECTO) {
      global.usuarioLogueado = true; 
      return res.redirect('/');
    }

    //LÓGICA DE RESPALDO CON BASE DE DATOS
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.render('login', { 
        titulo: 'Iniciar Sesión', 
        error: 'El email o la contraseña son incorrectos.' 
      });
    }

    if (usuario.password !== password) {
      return res.render('login', { 
        titulo: 'Iniciar Sesión', 
        error: 'El email o la contraseña son incorrectos.' 
      });
    }

    global.usuarioLogueado = true;
    res.redirect('/');

  } catch (error) {
    next(error);
  }
};

//Middleware para proteger rutas
exports.protegerRuta = (req, res, next) => {
  if (global.usuarioLogueado === true) {
    return next();
  }
  res.redirect('/login');
};

//Función para cerrar sesión
exports.logout = (req, res) => {
  global.usuarioLogueado = false;

  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.error("Error destruyendo sesión:", err);
      res.clearCookie('connect.sid');
      return res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
};