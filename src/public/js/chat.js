const socket = io(); // Conecta al servidor de WebSockets

const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');

socket.on('messages', function(data) {
    if (chatBox) {
        renderizarMensajes(data);
    }
});

function renderizarMensajes(mensajes) {
    if (!chatBox) return;

    chatBox.innerHTML = mensajes.map(function(msg) {
        const esAsistente = msg.author === 'Asistente Virtual';
        const badgeBg = esAsistente ? 'bg-primary text-white' : 'bg-secondary text-white';
        const alignClass = esAsistente ? 'text-start' : 'text-end';
        const cardBg = esAsistente ? 'msg-gemini' : 'msg-usuario';
        
        return `
            <div class="${alignClass} mb-3">
                <div class="d-inline-block p-2 px-3 shadow-sm ${cardBg}" style="max-width: 80%;">
                    <span class="badge ${badgeBg} mb-1"><strong>${msg.author}</strong></span>
                    <div class="text-dark small">${msg.text}</div>
                </div>
            </div>
        `;
    }).join('');
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

function enviarMensaje(event) {
    event.preventDefault();

    const authorInput = document.getElementById('user-name');
    const textInput = document.getElementById('chat-input');

    const mensajeTexto = textInput.value.trim();
    if (!mensajeTexto) return false;

    const nuevoMensaje = {
        author: authorInput.value || 'Cliente Anónimo',
        text: mensajeTexto 
    };

    socket.emit('new-message', nuevoMensaje);

    textInput.value = ''; 
    return false;
}