const clients = new Map(); // userId -> WebSocket

// Функція для збереження WebSocket-клієнтів
function storeWebSocketClient(userId, ws) {
    clients.set(userId, ws);
}

// Функція для видалення WebSocket-клієнта при відключенні
function removeWebSocketClient(ws) {
    clients.forEach((value, key) => {
        if (value === ws) {
            clients.delete(key);
        }
    });
}

// Функція для відправки результату тесту у WebSocket
function sendTestResultToClient(userId, result) {
    if (clients.has(userId)) {
        const ws = clients.get(userId);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(result));
        }
    }
}

export { storeWebSocketClient, removeWebSocketClient, sendTestResultToClient };
