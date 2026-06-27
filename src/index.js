require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = require('./app');
const conectarDB = require('./config/db');
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server);
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const rutaContexto = path.join(__dirname, 'contexto-distribuidora.txt');
let contextoDistribuidora = '';
try {
  contextoDistribuidora = fs.readFileSync(rutaContexto, 'utf-8');
} catch (error) {
  console.error('Error al cargar el archivo de contexto de la distribuidora:', error);
}

// Historial temporal de mensajes en memoria (se puede migrar a la Base de Datos)
let historialMensajes = [];

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);
  socket.emit('messages', historialMensajes);

  socket.on('new-message', async (data) => {
    historialMensajes.push(data);
    io.sockets.emit('messages', historialMensajes);

    try {
      const model = ai.getGenerativeModel({model: "gemini-2.5-flash-lite"});
      const promptFinal = `${contextoDistribuidora}\n\nCliente pregunta: ${data.text.trim()}\nRespuesta:`;
      const result = await model.generateContent(promptFinal);
      const respuestaIA = result.response.text();

      const mensajeAsistente = {
        author: 'Asistente Virtual',
        text: respuestaIA
      };

      historialMensajes.push(mensajeAsistente);
      io.sockets.emit('messages', historialMensajes);

    } catch (error) {
      console.error('Error al consultar la API de Gemini:', error);
      
      const mensajeError = {
        author: 'Asistente Virtual',
        text: 'Lo siento, en este momento no puedo procesar tu solicitud. Por favor intenta de nuevo más tarde.'
      };
      historialMensajes.push(mensajeError);
      io.sockets.emit('messages', historialMensajes);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

//Conectar a la Base de Datos y levantar el servidor HTTP (en lugar de app.listen)
conectarDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Servidor de TodoStock corriendo en: http://localhost:${PORT}`);
  });
});
