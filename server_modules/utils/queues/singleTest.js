import { singleTestQueue } from "./queues.js";
import { compileCpp, runExe, cleanup } from "../sandbox/sandbox.js";
import { Problems } from "../../models/index.js";
import { sendTestResultToClient } from "../websocket/utils.js";
import { QUEUE_ERRORS } from "../messages/index.js";

import logger  from "../logger.js"

/**
 * Обробка одиночного тесту з черги
 */
singleTestQueue.process(async (job) => {
    const { num, publicId, code, input } = job.data;
    let exePath, tempDir;
    let taskId;

    try {
        // якщо текст програми пустий вихід
        if (!code) throw new Error(QUEUE_ERRORS.PROGRAM_NOT_EMPTY);

        // Перевірка на наявність необхідних даних
        //validateTestData(num, code, input);

        // Відправка стартового повідомлення через WebSocket
        sendTestResultToClient(publicId, { event: "start", status: true, message: "START", result: "Компиляція" });
        
        // Компіляція коду
        const resultCompileCpp = await compileCpp(code.trim());
        exePath = resultCompileCpp.exePath;
        tempDir = resultCompileCpp.tempDir;
        

        // Отримання обмежень задачі
        const problem = await Problems.findOne({ num: num }).select("timelimit memorylimit");
        if (!problem) throw new Error(QUEUE_ERRORS.MISSING_PROGRAM(num));
        
        taskId = problem._id;

        // Виконання коду з тестовими даними
        const output = await runExe(exePath, input.toString(), problem.timelimit);
        const result = output.output.trim();

        // Відправка результату виконання в WebSocket
        sendTestResultToClient(publicId, { event: "transfer", status: true, message: "TRANSFER", result: result });

        // Відправка стоп повідомлення в WebSocket
        sendTestResultToClient(publicId, { event: "stop", status: true, message: "STOP", result: null });
    } catch (err) {
        // Відправка повідомлення про помилку в WebSocket
        sendErrorMessage(publicId, taskId, err.message)
    } finally {
        // Очистка тимчасових файлів
        if (exePath && tempDir) cleanup(tempDir); 
    }

    return { publicId, taskId };
});

/**
 * Додавання одиночного тесту в чергу для обробки
 * @param {number} num - Номер програми
 * @param {string} publicId - ID користувача
 * @param {string} code - Код програми
 * @param {string} input - Вхідні дані
 */
export function addSingleTest(num, publicId, code, input) {    
    return singleTestQueue.add({ num, publicId, code, input });
}

/**
 * Відправка повідомлення про помилку через WebSocket
 * @param {string} publicId - ID користувача
 * @param {string} errorMessage - Повідомлення про помилку
 */
async function sendErrorMessage(publicId, taskId, errorMessage) {
    sendTestResultToClient(publicId, { event: "error", status: true, message: logger.sessionId, result: errorMessage });
    logger.error("QueueProcessor", { errorMsg: errorMessage, publicId, taskId });
} 