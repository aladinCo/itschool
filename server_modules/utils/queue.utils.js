import Queue from "bull";
import { TestResult } from "../models/index.js";
import { compileCpp, runExe, cleanup } from "../utils/sandbox.utils.js";
import { Problems, Examples } from "../models/index.js";
import { sendTestResultToClient } from "../websocket/utils.websocket.js";
import logger from "../utils/logger.utils.js";

// Черга для одиночних тестів
const singleTestQueue = new Queue('singleTestQueue');
// Черга для пакетних тестів
const batchTestQueue = new Queue('batchTestQueue');

// Додавання одиночних тестів в чергу 
function addSingleTest(num, userId, taskId, code, input) {
    return singleTestQueue.add({ num, userId, taskId, code, input });
}
// Додавання пакетних тестів в чергу
function addBatchTest(num, userId, taskId, code, input) {
    return batchTestQueue.add({ num, userId, taskId, code });
}

// Обробка одиночних тестів в черзі
singleTestQueue.process(async (job) => {
    const { num, userId, taskId, code, input } = job.data;
    let exePath, tempDir;

    try {
        // Перевірка на наявність необхідних даних
        validateTestData(num, code, taskId, input);

        // Відправка стартового повідомлення у WebSocket
        sendTestResultToClient(userId, { event: "start", status: true, message: "START", result: "Компиляция" });

        // Компіляція коду
        const resultCompileCpp = await compileCpp(code);
        exePath = resultCompileCpp.exePath;
        tempDir = resultCompileCpp.tempDir;

        // Отримання обмежень задачі
        const problem = await Problems.findOne({ num: num }).select("timelimit memorylimit");
        if (!problem) throw new Error(`Програма #${num} відсутня!`);

        // Виконання коду з тестовими даними
        const output = await runExe(exePath, input.toString(), problem.timelimit);
        const result = output.output.trim();
        // Відправка результату виконання в WebSocket
        sendTestResultToClient(userId, { event: "transfer", status: true, message: "TRANSFER", result: result });

        // Збереження результату в базі даних
        await saveTestResult(userId, taskId, code, true, result);

        // Відправка фінального статусу
        sendTestResultToClient(userId, { event: "stop", status: true, message: "STOP", result: null });
    } catch (err) {
        // Відправка повідомлення про помилку в WebSocket
        sendTestResultToClient(userId, { event: "error", status: false, message: logger.sessionId, result: null });
        logger.error(err.message , { module: "QueueProcessor", userId, taskId });
    } finally {
        if (exePath && tempDir) cleanup(tempDir); // Видалення тимчасових файлів
    }

    return { userId, taskId };
});

// Обробка пакетних тестів в черзі
batchTestQueue.process(async (job) => {
    const { num, userId, taskId, code, input=""} = job.data;
    let exePath, tempDir;

    try {
        // Перевірка на наявність необхідних даних
        validateTestData(num, code, taskId);

        // Відправка стартового повідомлення у WebSocket
        sendTestResultToClient(userId, { event: "start", status: true, message: "START", result: "Компиляция" });

        // Компіляція коду
        const resultCompileCpp = await compileCpp(code);
        exePath = resultCompileCpp.exePath;
        tempDir = resultCompileCpp.tempDir;

        // Отримання обмежень задачі
        const problem = await Problems.findOne({ num }).select("timelimit memorylimit");
        if (!problem) throw new Error(`Програма #${num} відсутня!`);

        const tests = await Examples
            .find({ "problems": problem._id })
            .populate({
                path: 'problems',                                    
                select: ["timelimit", "memorylimit", "solution", "-_id"]
            })
            .exec();
        
        if (!tests || tests.length === 0) throw new Error(`Задача з таким ID ${num} відсутня!`);

        const groupedTests = Object.values(tests.reduce((acc, item) => {
            const {_id, input, output, problems, ...rest } = item.toObject()  // Убираем ненужные свойства
            const newObj = { id: _id, ...rest }

            const group = item.group
          
            if (!acc[group]) {
              acc[group] = {
                group: group,
                testBal: 0,
                testCount: 0,
                tests: []
              }
            }          
            acc[group].tests.push(newObj)   // Добавляем очищенный объект
            acc[group].testCount += 1    // Увеличиваем счетчик тестов
            acc[group].testBal += newObj.bal

            return acc
        }, {}))

        // Відправка стартового повідомлення у WebSocket
        sendTestResultToClient(userId, { event: "runtest", status: true, message: "RUNTEST", result: groupedTests });

        for (const {id,  input, output, time } of tests) {

            // Виконання коду з тестовими даними
            const outputEx = await runExe(exePath, input.toString(), time);
            const isCorrect = outputEx.output.trim() === output?.trim();

            const dataSend = {
                status: true,
                message: isCorrect ? "OK" : "ERROR",
                result: {id:id,  time: outputEx.time, isCorrect }
            }
            // Відправка результата теста у WebSocket
            sendTestResultToClient(userId, { event: "transfer", status: true, message: "TRANSFER", result: dataSend });

            // Збереження результату в базі даних
            await saveTestResult(userId, taskId, code, true, dataSend.result); 
            await new Promise(resolve => setTimeout(resolve, 100));
            
        }
        // Відправка фінального статусу
        sendTestResultToClient(userId, { event: "stop", status: true, message: "STOP", result: null });

    } catch (err) {
        // Відправка повідомлення про помилку в WebSocket
        sendTestResultToClient(userId, { event: "error", status: false, message: logger.sessionId, result: null });
        logger.error(err.message , { module: "QueueProcessor", num, userId, taskId, code, input });
    } finally {
        if (exePath && tempDir) {
            cleanup(tempDir); // Видалення тимчасових файлів
        }
    }

    return { userId, taskId };
});

// Функція перевірки необхідних даних
function validateTestData(num, code, taskId, input = "") {
    if (!num) throw new Error("Номер програми відсутній!");
    if (!code) throw new Error("Текст програми відсутній!");
    if (!taskId) throw new Error("ID завдання відсутнє!");
    if (input === null || input === undefined) throw new Error("Вхідні дані відсутні!");
}

// Функція для збереження результату в базі даних
async function saveTestResult(userId, taskId, code, status, output) {
    const result = new TestResult({ userId, taskId, code, status, output });
    await result.save();
}

export { addSingleTest, addBatchTest };
