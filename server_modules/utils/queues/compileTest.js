import { batchTestQueue, compileQueue } from "./queues.js";
import { compileCpp, runExe, cleanup } from "../sandbox/sandbox.js";
import logger  from "../logger.js"
import { sendTestResultToClient } from "../websocket/utils.js";
import { QUEUE_ERRORS } from "../messages/index.js";


/**
 * Обробка компіляції та тестів для пакетних тестів
 * @param {string} publicId - ID користувача
 * @param {string} taskId - ID завдання
 * @param {string} code - Код програми
 * @param {Array} tests - Тести для виконання
 */
compileQueue.process(async (job) => {
    const { publicId, taskId, code, tests } = job.data;
    let exePath, tempDir;

    try {
        // Компіляція коду
        const resultCompileCpp = await compileCpp(code);
        if (!resultCompileCpp.exePath) {
            throw new Error(QUEUE_ERRORS.COMPILATION_ERROR);
        }
        ({ exePath, tempDir } = resultCompileCpp);

        // Групування тестів за групами
        const groupedTests = groupTestsByGroup(publicId, taskId, tests);
         
        // Додаємо завдання для запуску тестування
        batchTestQueue.add({
            publicId,
            taskId,
            event: "runtest",
            data: { code, tests: groupedTests }
        });

        const groups = tests.reduce((acc, test) => {
            if (!acc[test.group]) {
              acc[test.group] = [];
            }
            acc[test.group].push(test);
            return acc;
          }, {});

        // Додаємо завдання для кожного тесту        
        for (const group in groups) {
            
            batchTestQueue.add({ publicId, taskId, event: "groupstart", data: {group : group} });

            groups[group].forEach(test => {
                batchTestQueue.add({
                    publicId,
                    taskId,
                    event: "transfer",
                    data: {                        
                        id: test._id,
                        group : group,
                        input: test.input,
                        output: test.output,
                        time: test.time,
                        exePath,
                        tempDir
                    }
                });
            });
            batchTestQueue.add({publicId, taskId, event: "groupend", data: {group : group}});
        };

        // Додаємо завдання для завершення тестування
        batchTestQueue.add({ publicId, taskId, event: "stop", data: { exePath, tempDir }});        

    } catch (err) {        
        // Відправка повідомлення про помилку клієнту через WebSocket
        sendErrorMessage(publicId, taskId, err.message)
        // якщо помилка видаляемо каталог компіляції        
        cleanup(tempDir);
    } 
});


/**
 * Групує тести за їх групою
 * @param {Array} tests - Массив тестів, кожен з яких має властивість group
 * @returns {Array} - Масив групованих тестів
 */
function groupTestsByGroup(publicId, taskId, tests) {
    const sendResultTest = {
        idUser: publicId, // Ідентифікатор користувача, може бути null
        idProblem: taskId, // Ідентифікатор задачі
        code: null, // Код, який надійшов у першому результаті, може бути null
        groupsTests: [] // Масив для результатів груп тестів
    }

    
    // Групування тестів за групами
    sendResultTest["groupsTests"] = Object.values(
        tests.reduce((acc, item) => {
            const { _id, input, output, problems, type, cascade, group, ...rest } = item;
            const newTest = { id: _id, ...rest }; // Створення нового об'єкта тесту без зайвих полів
            newTest.result = null;
            const _group = item.group;

            // Ініціалізація групи, якщо вона ще не існує
            if (!acc[_group]) {
                acc[_group] = { group:_group, testBal: 0, testCount: 0, tests: [] };
            }

            // Додавання тесту до групи
            acc[_group].tests.push(newTest);
            acc[_group].testCount += 1; // Збільшення кількості тестів у групі
            acc[_group].testBal += newTest.bal; // Додавання балів за тест до загальної суми
            acc[_group].scored = 0
            return acc;
        }, {})
    )
    //sendResultTest["groupedTests"] = groupedTests;
    //console.dir(sendResultTest, {depth:null});
    return sendResultTest;
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

