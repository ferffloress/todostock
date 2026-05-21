const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/todoStock');
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error al conectar MongoDB:', error);
    process.exit(1);
  }
};

module.exports = conectarDB;