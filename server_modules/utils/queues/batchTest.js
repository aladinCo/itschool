// @ts-nocheck
import fs from "fs";

import { batchTestQueue, compileQueue } from "./queues.js";
import { redisClient } from "../redisClient.js";
import './compileTest.js';

import { sendTestResultToClient } from "../websocket/utils.js";
import { Problems, Examples, User, ProblemSubmission } from "../../models/index.js";
import { QUEUE_ERRORS } from "../messages/index.js";

import { runExe, cleanup } from "../sandbox/sandbox.js";
import logger  from "../logger.js"
/**
 * Обробка кожного тесту в черзі
 * @param {object} job - Дані завдання з черги
 */
batchTestQueue.process(async (job) => {
    const { publicId, taskId, event, data } = job.data;

    /*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
    await new Promise(resolve => setTimeout(resolve, 500));
    /*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/    
     
    // Обробка процесу "runtest" (запуск тестування)
    if (event === "runtest") {
        await redisClient.hSet(`batch:${publicId}:${taskId}`, 0, JSON.stringify({ code: data.code, tests: data.tests }));
        sendTestResultToClient(publicId, { event, status: true, message: "RUNTEST", result: data.tests });
        return { publicId, taskId };
    }
    
    // Обробка процесу "groupend" (завершення тестування групи)
    if (event === "groupstart") {
        sendTestResultToClient(publicId, { event, status: true, message: "GROUPSTART", result: {group : data.group} });
        return { publicId, taskId };
    }

    // Обробка процесу "groupend" (завершення тестування групи)
    if (event === "groupend") {
        //sendTestResultToClient(publicId, { event, status: true, message: "GROUPEND", result: {group : data.group} });
        return await processFinalResultsGroup(publicId, taskId, data.group);
    }

    // Обробка процесу "stop" (завершення тестування)
    if (event === "stop") {              
        if (data.exePath && data.tempDir) cleanup(data.tempDir);        
        return await processFinalResults(publicId, taskId);
    }


    try {
        // Виконання тесту
        if (!fs.existsSync(data.exePath)) {
            throw new Error(QUEUE_ERRORS.FILE_NOT_FOUND(data.exePath))
        }

        const result = await runExe(data.exePath, data.input.toString(), data.time);
        const isCorrect = result.output.trim() === data.output.trim();

        // Відправка результату тесту
        sendTestResultToClient(publicId, {
            event: "transfer",
            status: true,
            message: "TRANSFER", 
            result: {group:Number(data.group), id: data.id, time: result.time, result:isCorrect }
        });

        // Збереження результату тесту в Redis
        const testResult = { [data.id]: {group:data.group, time: result.time, isCorrect } };
        await redisClient.hSet(`batch:${publicId}:${taskId}`, data.id, JSON.stringify(testResult));

    } catch (err) {
        console.log(err)
        sendErrorMessage(publicId, taskId, err.message)
    } 

    return { publicId, taskId };
});

/**
 * Додавання пакетних тестів в чергу для обробки
 * @param {number} num - Номер програми
 * @param {string} publicId - ID користувача
 * @param {string} code - Код програми
 */
export async function addBatchTest(num, publicId, code) {
    sendTestResultToClient(publicId, { event: "start", status: true, message: "START", result: "Компіляція" });
    let taskId;
    try {        
        // якщо текст програми пустий вихід
        if (!code) throw new Error(QUEUE_ERRORS.PROGRAM_NOT_EMPTY);

        // Отримуємо дані задачі з номером num
        const problem = await Problems.findOne({ num }).lean().select("timelimit memorylimit");
        if (!problem) throw new Error(QUEUE_ERRORS.MISSING_PROGRAM(num));
        taskId = problem._id;

        // Отримуємо тестові дані для задачі
        const tests = await Examples.find({ "problems": problem._id }).lean().exec();
        if (!tests || tests.length === 0) throw new Error(QUEUE_ERRORS.MISSING_TESTS(num));
    
        // Додаємо завдання компіляції в чергу
        compileQueue.add({ publicId, taskId, code, tests });
    } catch (err) {
        // Відправка повідомлення про помилку клієнту через WebSocket
        sendErrorMessage(publicId, taskId, err.message);
        return;
    }
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

/**
 * Обробка фінальних результатів
 * @param {string} publicId - ID користувача
 * @param {string} taskId - ID завдання
 * @param {number} group - № групи питання
 */
async function processFinalResultsGroup(publicId, taskId, groupEnd) {
    
    // Отримуємо всі дані з Redis для конкретного batch
    const temp = await redisClient.hGetAll(`batch:${publicId}:${taskId}`);
    
    // Якщо дані не знайдено (temp пустий або undefined), повертаємо просто publicId та taskId
    if (!temp || Object.keys(temp).length === 0) return { publicId, taskId };

    // Парсимо всі отримані записи з Redis
    const results = Object.values(temp).map(item => {
        try {
            return JSON.parse(item); // Пробуємо перетворити кожен запис на об'єкт
        } catch (error) {
            console.error("JSON parsing error:", error); // Логуючи помилки при парсингу
            return null; // Якщо парсинг не вдався, повертаємо null
        }
    }).filter(Boolean); // Фільтруємо всі непарсовані (null) елементи
    
    // Якщо результати відсутні або перший елемент не містить тестів, повертаємо
    if (results.length === 0 || !results[0]?.tests) return { publicId, taskId };

    // Створюємо об'єкт для фінальних результатів
    const finalResults = {
        idUser: null, // Ідентифікатор користувача, може бути null
        idProblem: taskId, // Ідентифікатор задачі
        code: results[0].code, // Код, який надійшов у першому результаті
        groupsTests: [] // Масив для результатів груп тестів
    };
    
    // Створюємо об'єкт, що містить час та коректність результату для кожного тесту
    const testsData = results.slice(1).reduce((acc, item) => {
        if (!item) return acc; // Якщо елемент не існує, пропускаємо його
        const [id, data] = Object.entries(item)[0] || []; // Отримуємо пару [id, data]
        if (id && data) {
            acc[id] = { time: data.time, isCorrect: data.isCorrect }; // Додаємо в об'єкт
        }
        return acc;
    }, {});

    // Обробляємо тести кожної групи
    for (let group of results[0].tests.groupsTests) {        
        let sumBal = 0; // Змінна для підрахунку балів за групу
        
        // Для кожного тесту в групі
        group.tests.forEach(paramTests => {
            if (!testsData[paramTests.id]) {
                console.warn(`Missing test data for id: ${paramTests.id}`); // Логування, якщо не знайшли дані для тесту
                return; // Пропускаємо тест, якщо відсутні дані
            }

            // Оновлюємо час та результат тесту на основі отриманих даних
            paramTests.time = testsData[paramTests.id].time;
            paramTests.result = testsData[paramTests.id].isCorrect;

            // Видаляємо зайві поля з тесту
            delete paramTests.type;
            delete paramTests.cascade;
            delete paramTests.group;

            // Додаємо бали до суми, якщо тест пройдено успішно
            sumBal += paramTests.result ? paramTests.bal : 0;
        });
        
        // Оновлюємо результат для групи
        group.scored = sumBal;
        finalResults.groupsTests.push(group); // Додаємо оброблену групу до результатів
    }

    
    finalResults.groupsTests = finalResults.groupsTests.filter(group => group.group === Number(groupEnd));
    //console.log("group", groupEnd,"finalResults", finalResults);

    // Відправляємо результат клієнту
    sendTestResultToClient(publicId, { event: "groupend", status: true, message: "GROUPEND", result: finalResults });

    // Очищаємо дані з Redis після обробки
    //await redisClient.del(`batch:${publicId}:${taskId}`);

    // Повертаємо publicId та taskId як результат
    return { publicId, taskId };
}

/**
 * Обробка фінальних результатів
 * @param {string} publicId - ID користувача
 * @param {string} taskId - ID завдання
 */
async function processFinalResults(publicId, taskId) {
    
    // Отримуємо всі дані з Redis для конкретного batch
    const temp = await redisClient.hGetAll(`batch:${publicId}:${taskId}`);
    
    // Якщо дані не знайдено (temp пустий або undefined), повертаємо просто publicId та taskId
    if (!temp || Object.keys(temp).length === 0) return { publicId, taskId };

    // Парсимо всі отримані записи з Redis
    const results = Object.values(temp).map(item => {
        try {
            return JSON.parse(item); // Пробуємо перетворити кожен запис на об'єкт
        } catch (error) {
            console.error("JSON parsing error:", error); // Логуючи помилки при парсингу
            return null; // Якщо парсинг не вдався, повертаємо null
        }
    }).filter(Boolean); // Фільтруємо всі непарсовані (null) елементи
    
    // Якщо результати відсутні або перший елемент не містить тестів, повертаємо
    if (results.length === 0 || !results[0]?.tests) return { publicId, taskId };

    // Створюємо об'єкт для фінальних результатів
    const finalResults = {
        idUser: null, // Ідентифікатор користувача, може бути null
        idProblem: taskId, // Ідентифікатор задачі
        code: results[0].code, // Код, який надійшов у першому результаті
        scoredAll: 0,
        balAll: 0,
        status: false,
        groupsTests: [] // Масив для результатів груп тестів
    };
    
    // Створюємо об'єкт, що містить час та коректність результату для кожного тесту
    const testsData = results.slice(1).reduce((acc, item) => {
        if (!item) return acc; // Якщо елемент не існує, пропускаємо його
        const [id, data] = Object.entries(item)[0] || []; // Отримуємо пару [id, data]
        if (id && data) {
            acc[id] = { time: data.time, isCorrect: data.isCorrect }; // Додаємо в об'єкт
        }
        return acc;
    }, {});
    // Обробляємо тести кожної групи
    let sumScoredAll = 0;
    let sumBalAll = 0;
    for (let group of results[0].tests.groupsTests) {        
        let sumScored = 0; // Змінна для підрахунку балів за групу
        let sumBal = 0
        // Для кожного тесту в групі
        group.tests.forEach(paramTests => {
            if (!testsData[paramTests.id]) {
                console.warn(`Missing test data for id: ${paramTests.id}`); // Логування, якщо не знайшли дані для тесту
                return; // Пропускаємо тест, якщо відсутні дані
            }

            // Оновлюємо час та результат тесту на основі отриманих даних
            paramTests.time = testsData[paramTests.id].time;
            paramTests.result = testsData[paramTests.id].isCorrect;

            // Видаляємо зайві поля з тесту
            delete paramTests.type;
            delete paramTests.cascade;
            delete paramTests.group;

            // Додаємо бали до суми, якщо тест пройдено успішно
            sumScored += paramTests.result ? paramTests.bal : 0;
            sumBal += paramTests.bal;
        });
        sumScoredAll += sumScored;
        sumBalAll += sumBal;
        // Оновлюємо результат для групи
        group.scored = sumScored;

        finalResults.groupsTests.push(group); // Додаємо оброблену групу до результатів
    }

    finalResults.scoredAll = sumScoredAll;
    finalResults.balAll = sumBalAll;
    finalResults.status = sumScoredAll == sumBalAll;
    
    // Зберігаємо фінальні результати в базі
    await saveTestResult(publicId, finalResults);

    // Відправляємо результат клієнту
    sendTestResultToClient(publicId, { event: "stop", status: true, message: "STOP", result: finalResults });

    // Очищаємо дані з Redis після обробки
    await redisClient.del(`batch:${publicId}:${taskId}`);

    // Повертаємо publicId та taskId як результат
    return { publicId, taskId };
}

/**
 * Збереження результату тесту в базі даних
 * @param {string} publicId - ID користувача
 * @param {object} resultTest - Результат тесту
 */
async function saveTestResult(publicId, resultTest) {
    
    const user = await User.findOne({ publicId: publicId }).select("_id");
    if (!user) {
        console.error(QUEUE_ERRORS.USER_NOT_FOUND);
        return;
    }
    resultTest["idUser"] = user._id;

    const result = new ProblemSubmission(resultTest);
    await result.save();
}

