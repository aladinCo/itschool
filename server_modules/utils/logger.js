import { v4 as uuidv4 } from 'uuid'
import  crypto from "crypto";
import   { Log } from "../models/index.js"

class CustomError extends Error {
    constructor(message, options) {
        // Передає текст помилки у стандартне поле `message`
        super(message); 
        // Зберігає додаткові данні
        this.options = options; 
    }
}

const detectCycles = (obj, seen = new WeakSet()) => {
    if (obj && typeof obj === 'object') {
        if (seen.has(obj)) return true; // Найден цикл
        seen.add(obj);
        for (const key in obj) {
            if (detectCycles(obj[key], seen)) return true;
        }
    }
    return false;
};

class Logger {
    #_processIdSet = false
    #_processId = null
    #_sessionId = null
    #_objectId = null

    // використання сесійного або об'єктного ІД або 'unknown'
    constructor(sessionId = null, objectId = null) {
        this.#_sessionId = sessionId
        this.#_objectId = objectId; // Об'єкнтий ІД (приклад, ІД заказа або задачі)

        this.#_processId = this.generateProcessId()
    }

    getRandomHex() {
        return crypto.randomBytes(3).toString("hex")//.toUpperCase();
    }

    error(message, options) {
        const error = new CustomError(message, options);
        error.options = options;
        return error;
    }

    set sessionId(sessionId){
        this.#_sessionId = (sessionId ? sessionId : null)
        this.#_processId = this.generateProcessId()
    }

    get sessionId(){
        return this.#_processId
    }

    // генерація комбінованого процес ІД
    generateProcessId() {
        // генерація унікального UUID
        const uuid = uuidv4();         
        this.#_processIdSet = true;
        // комбінований процес ІД
        return `${uuid}-${this.getRandomHex()}-${this.#_sessionId || 'unknown'}`; 
    }

    //визначаємо файл процесу
    getFileFromStack() {
        const stack = new Error().stack
        const stackLines = stack.split('\n')    
        for (const line of stackLines) {
            if (!line.includes('Logger') && line.includes('(')) {
                const match = line.match(/\((.*):\d+:\d+\)/); 
                if (match) {
                    return match[1]
                }
            }          
        }    
        return 'unknown'
    }
    async warning(message, meta = {}, res = null, flag = true){
        if (flag) this.log("warning", message, meta)
        if(res != null) 
            res.status(500).json({ status: false, message: this.sessionId });    
    }

    async info(message, meta = {}, res = null, flag = true){
        if (flag) this.log("info", message, meta)
        if(res != null) 
            res.status(200).json({ status: true, message: this.sessionId, result:meta});
    }

    async error(message, meta = {}, res = null, flag = true){
        if (flag) this.log("error", message, meta)
        if(res != null) 
            res.status(500).json({ status: false, message: this.sessionId });
    }

    removeCircularReferences() {
        const seen = new WeakSet();
        return (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              return;  // исключаем циклическую ссылку
            }
            seen.add(value);
          }
          return value;
        };
      }
      
    // логування з комбінованим процес ІД
    async log(level, message, meta = {}) {
        const errObj = {
            level,
            session: this.#_sessionId,
            message,
            meta: meta, //JSON.stringify(this.removeCircularReferences()),
            process: this.#_processId, 
            file: this.getFileFromStack() 
                        
        }        
        try {
            
            const logEntry = new Log(errObj)        
            await logEntry.save();
            console.log(`Запис журналу для ІД "${this.#_processId}" додано`)
        } catch (error) {
            console.error('Помилка запису журналу', error)
        }
    }
}

export default  new Logger()