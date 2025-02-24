const CONTROLLERS = "Problems"

import config  from "config"
const cfg = config[CONTROLLERS]

//const logger = require('../utils/logger.utils')
import logger  from "../utils/logger.utils.js"

import { compileCpp, runExe, syntaxCpp, cleanup } from '../utils/sandbox.utils.js';

import { Examples, Problems } from "../models/index.js";


const get = async (req, res) => {
    console.log("GET")
    const id = req.params.id;
    //res.status(200).json({ status: true, message: "Ok" , result:{id}})
}





const syntax = async (req, res) => {

    const problemId = req.params.id || null
    const { code } = req.body || null
    const errInfo = { 
        module: CONTROLLERS,
        user:"poka net ???????????????????????????",
        code: code || null,
        id:problemId || null
    }

    try{       
        if (!code) throw new Error('Текст програми відсутній!')

        const result = await syntaxCpp(code)
        if(!result.status) throw new Error(result.message) //Syntax ERROR ${problemId}: - 


        logger.info(`${CONTROLLERS} - Syntax OK ${problemId}: `,  null, res)
        //return res.json({ status: true, message: `Syntax OK ${problemId}`, result: null })

    } catch (error) {  
             
        logger.error(`${CONTROLLERS} - Syntax ERROR ${problemId}: `, ("options" in error ? error.options : {
            error: error.message, 
            errInfo
        }));
        res.status(500).json({ status: false, message: logger.sessionId , result:error.message})
    }
}

const run = async (req, res) => {

    const problemId = req.params.id || null
    const { code, input, output } = req.body || null
    const errInfo = { 
        module: CONTROLLERS,
        user:"poka net ???????????????????????????",
        code: code || null,
        input: input || null,
        output: output || null,
        id:problemId || null
    }

    try {
        if (!code) throw new Error('Текст програми відсутній!', errInfo)        
        if (!problemId) throw new Error('ID програми відсутній!', errInfo)

        const problem = await Problems.findById(problemId)        
        if (!problem) throw new Error(`Задача з таким ID ${problemId} відсутня!`, errInfo)


        const {timelimit, memorylimit} = problem

        
        const result = await syntaxCpp(code)
        if(!result.status) throw new Error(result.message)

        var { exePath, tempDir } = await compileCpp(code); // Компиляция 1 раз
        
        

        const {output, time} = await runExe(exePath, input, timelimit, memorylimit)            
           
        logger.info(`Compile OK ${problemId}:`, {output, time}, res)
        //res.status(200).json({ status: true, message: `Compile OK ${problemId}`,  result: {output, time}})

    } catch (error) {
        logger.error(`${CONTROLLERS} Errors`, ("options" in error ? error.options : {errInfo, message:error.message }));
        res.status(500).json({ status: false, message: logger.sessionId , result:error.message });
    }finally{
        if(tempDir) cleanup(tempDir);
    }
}


let storedData = null;

const submit = async (req, res) => { 
    
    const problemId = req.params.id || null
    const { code } = req.body || null
    const errInfo = { 
        module: CONTROLLERS,
        user:"poka net ???????????????????????????",
        code: code || null,
        id:problemId || null
    }
    
 
    try {       
                
        if (!code) throw new Error('Текст програми відсутній!');      
        if (!problemId) throw new Error('ID програми відсутній!');

        

        const tests = await Examples
            .find({ "problems": problemId })
            .populate({
                path: 'problems',                                    
                select: ["timelimit", "memorylimit", "solution", "-_id"]
            })
            .exec();
    
        if (!tests || tests.length === 0) throw new Error(`Задача з таким ID ${problemId} відсутня!`);
        

        

        storedData ={problemId, code, tests};

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

        /*const groupedTests = tests.reduce((acc, item) => {
            const { input, output, problems, ...rest } = item.toObject();
            // Если в аккумуляторе нет группы, создаем ее
            if (!acc[item.group]) {
              acc[item.group] = [];
            }
            // Добавляем элемент в соответствующую группу
            acc[item.group].push(rest);
            return acc;
        }, {});*/


        logger.info("SSC данні отримані сеанс розпочато", groupedTests, res);
        //res.json({ status: true, message: logger.sessionId });
    } catch (error) {
        logger.error(`${CONTROLLERS} Errors`, {message: "SSC сеанс неможливий данні не отримані", error: error.message,  errInfo }, res);
        //res.status(500).json({ status: false, message: logger.sessionId });
    }
}

const progress = async (req, res) => {
    /*const express = require('express');
    const http = require('http');
    const websocketServer = require('./websocketServer'); // Підключаємо WebSocket сервер
    
    const app = express();
    const server = http.createServer(app);
    
    // Підключаємо WebSocket сервер до HTTP сервера
    websocketServer(server);
    
    // Ваші маршрути і контролери
    app.post('/startTest', (req, res) => {
        // Логіка вашого контролера для запуску тестування
        const storedData = { /* дані для тестування *//* };*/
    
        // Відправляємо дані клієнту через WebSocket
        // Приклад використання вашого контролера для відправки даних:
        /*const ws = req.app.locals.ws;  // Тут ми можемо отримати доступ до WebSocket з `locals`
        if (ws) {
            ws.emit('startTests', storedData);  // Запускаємо тестування через WebSocket
        }
    
        res.json({ status: true, message: 'Тестування розпочато' });
    })   */

};

export default  { run, syntax, submit, progress, get }