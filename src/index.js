const mongoose = require('mongoose');
const app = require('../app');

mongoose.connect('mongodb://127.0.0.1:27017/todostock')
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
  })
  .catch(err => console.error('Error MongoDB:', err));