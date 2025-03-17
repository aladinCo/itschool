import WebSocket, {WebSocketServer} from 'ws';
import jwt  from 'jsonwebtoken';

import { removeWebSocketClient, storeWebSocketClient} from "../websocket/utils.js";
//import { addBatchTest }  from '../queue.utils.js';
import { addSingleTest, addBatchTest } from "../queues/index.js";

import logger  from "../logger.js"


function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });

    console.log("WebSocket сервер запущено...");

    wss.on('connection', (ws, req) => {
        
        // Получаем токен из query или заголовка
        const token = req.headers['sec-websocket-protocol'];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) {
            logger.error("Токен відсутній!")
            // Відправка помилки через WebSocket
            ws.send(JSON.stringify({ event: "error", status: false, message: logger.sessionId, result: null }));
            return null;
        }

        ws.on('message', (message) => {
            try {
                const { event, data } = JSON.parse(message);

                if (decoded.publicId) {
                    storeWebSocketClient(decoded.publicId, ws)
                }
                switch (event) {
                    case "multipletest":
                        addBatchTest(data.num, decoded.publicId, data.code);
                        break;
                    case "singletest":
                        addSingleTest(data.num, decoded.publicId, data.code, data.input );                        
                        break;                    
                    default:
                        console.warn(`Невідомий тип події: ${event}`);
                }
            } catch (error) {
                 // Запис помилки через WebSocket
                logger.error("Помилка обробки повідомлення WebSocket:", {message : error.message})
                // Відправка помилки через WebSocket
                ws.send(JSON.stringify({ event: "error", status: false, message: logger.sessionId, result: null }));
            }
        });

        ws.on('close', () => {
            console.log('Клієнт відключився від WebSocket');
            removeWebSocketClient(ws);
        })
    });

    return wss;
}

export { setupWebSocket };
