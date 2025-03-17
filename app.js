//import { createRequire } from "module";
//import require = createRequire(import.meta.url);
import dotenv  from 'dotenv'
dotenv.config();
/*********************************************** */
//import pkg from "logrocket";
//const LogRocket = pkg;
/*********************************************** */
import express  from 'express';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import { csrfProtection, handleCsrfError } from './server_modules/middleware/csrf.middleware.js';

import config  from "config"

import mongoose  from "mongoose"
import http  from 'http'

import logger  from "./server_modules/utils/logger.js"
//import {setupWebSocket}  from './server_modules/utils/websocket.utils.js';
import {setupWebSocket}  from './server_modules/utils/websocket/server.js';

//LogRocket.init('xkfy4f/itschool');

const FLAG_LOGER = true

const app = express();

// Налаштування CORS
app.use(cors({
    origin: `${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}`, // Дозволяємо запити тільки з цього домену
    credentials: true // Дозволяємо передавати куки
}));

app.use(express.json({ extended: true }))
app.use(cookieParser());




import authRoutes from './server_modules/routes/auth.routes.js';
app.use('/api/auth',  authRoutes);

// Захист усіх POST, PUT, DELETE запитів через CSRF middleware
app.use(csrfProtection);

import solvingRoutes from './server_modules/routes/solving.routes.js';
app.use('/api/solving', solvingRoutes);

import problemsRoutes from './server_modules/routes/problems.routes.js';
app.use('/api/problems', problemsRoutes);

//import problemRoutes from './server_modules/routes/problem.routes.js';
//app.use('/api/problem', problemRoutes);



// Middleware для обробки CSRF помилок
app.use(handleCsrfError);


const server = http.createServer(app);

// **Ініціалізуємо WebSocket**
setupWebSocket(server);

const start = async () => {
    try {
        mongoose.connect(config["global"].mongoUri, {
        })
    } catch (e) {
        console.log(`Mongoose Server error:`, e.message)
        process.exit(1)
    }
}
start()



const PORT = config.global.port || 5000
server.listen(PORT, async () => {
    await logger.info(`Вуаля! - школу відкрито на ${PORT} порту...`, undefined, undefined, FLAG_LOGER);
});