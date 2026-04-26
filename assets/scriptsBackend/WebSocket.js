'use strict';

const WebSocket = require('ws');

let wss;

function iniciarWebSocket(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Cliente conectado por WebSocket.');

        ws.on('close', () => {
            console.log('Cliente desconectado.');
        });
    });
}

function notificarTodos(mensaje) {
    if (!wss) return;

    wss.clients.forEach((cliente) => {
        if (cliente.readyState === WebSocket.OPEN) {
            cliente.send(JSON.stringify(mensaje));
        }
    });
}

module.exports = { iniciarWebSocket, notificarTodos };