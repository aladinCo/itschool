const CONTROLLERS = "Problem"

import config  from "config"
const cfg = config[CONTROLLERS]

//const logger = require('../utils/logger.utils')
import logger  from "../utils/logger.utils.js"

import { compileCpp, runExe, syntaxCpp, cleanup } from '../utils/sandbox.utils.js';

import { Examples, Problems } from "../models/index.js";

const error = (type, param = null) => {
    const messages = {
        INVALID_NUMBER:             "Номер відсутній!",
        INVALID_IDUSER:             "Відсутній ідентифікатор користувача!",
        PROBLEM_NAMBER_NOT_EXIST:   `Задача з номером ${param} відсутня!`,
        INVALID_STATUS:             `useHttp -> Невідомий статус відповіді сервера: ${param}`,
        INVALID_MESSAGE:            "useHttp -> Поле 'message' повинно бути текстом!",
        MISSING_RESULT:             "useHttp -> Відсутні дані в полі 'result'!",
        UNAUTHORIZED:               "useHttp -> Unauthorized",
    };
    return messages[type] || "Невідома помилка!";
};
// /api/problem/:id
const get = async (req, res) => {

    const numProblem = req.params.id;
    if (!numProblem ?? numProblem === "") throw new Error(error("INVALID_NUMBER"));

    const iduser = req?.iduser?.publicId;
    if (!iduser ?? iduser === "") throw new Error(error("INVALID_NUMBER"));

    logger.sessionId = iduser;

    //res.status(200).json({ status: true, message: "Ok" , result:{id}})

    try{      
        
        const problem = await Problems.findOne({ num: numProblem })
                .populate({path: 'themes',select: ['name']});
                
        if (!problem) throw new Error(error("PROBLEM_NAMBER_NOT_EXIST", numProblem));


        return res.status(200).json({ status: true, message: `Ok`, result: problem })
    } catch (error) { 

        logger.error(`${CONTROLLERS} ${error.message}`, {regparam: req.params, iduser:req?.iduser}, res)
        //res.status(500).json({ status: false, message: logger.sessionId , result:error.message})
    }
}

const put = async (req, res) => {
    return res.status(200).json({ status: true, message: `Ok`, result: "ok" })
}

//ProblemSolving
export default  { get, put }