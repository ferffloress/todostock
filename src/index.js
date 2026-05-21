const app = require('./app');
const conectarDB = require('./config/db');

conectarDB().then(() => {
  app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
});