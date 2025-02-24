const CONTROLLERS = "ServerWebSocket"


import WebSocket, {WebSocketServer} from 'ws';
//import { handleSendTests, handleRunTests } from '../websocket/tests.websocket.js';
import { removeWebSocketClient, storeWebSocketClient } from "../websocket/utils.websocket.js";
import { addSingleTest, addBatchTest }  from '../utils/queue.utils.js';


import logger  from "../utils/logger.utils.js"


function setupWebSocket(server) {
    const wss = new WebSocketServer({ server });

    console.log("WebSocket сервер запущено...");

    wss.on('connection', (ws) => {
        console.log('Клієнт підключився до WebSocket');

        ws.on('message', (message) => {
            try {
                const { event, data } = JSON.parse(message);

                const mdata = {
                    num: data.num,
                    userId:"67b3947e1d0594c4fb6762ae",
                    taskId: "67a26e85107600684ae11dfb",
                    code: data.code,
                    input: data?.input || ""
                }

                if (mdata.userId) {
                    storeWebSocketClient(mdata.userId, ws)
                }

                switch (event) {
                    case "multipletest":
                        console.log("event: ", event)
                        addBatchTest(mdata.num, mdata.userId, mdata.taskId, mdata.code );
                        break;
                    case "singletest":
                        console.log("event: ", event)
                        addSingleTest(mdata.num, mdata.userId, mdata.taskId, mdata.code, mdata.input);                        
                        break;                    
                    default:
                        console.warn(`Невідомий тип події: ${event}`);
                }
            } catch (error) {
                console.error("Помилка обробки повідомлення WebSocket:", error.message);
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
