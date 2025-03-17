  const CONTROLLERS = "Solving"

import { ObjectId } from 'mongodb';

import config  from "config"
const cfg = config[CONTROLLERS]
import logger  from "../utils/logger.js"

import { Solving, User, Problems } from "../models/index.js";

const formatCode = (code) => {
    // Наприклад, замінюємо '\n' на реальні символи нового рядка
    return code.replace(/\\n/g, '\n'); // заміняє '\n' на реальні нові рядки
  };
  


const get = async (req, res) => {
    const idUser = req?.iduser?.publicId;
    const num = req.params.id;

    try {
      const user = await User.findOne({ publicId:idUser }).select("_id");

      if (!user) throw new Error("Користувач не знайдений");

      const problem = await Problems.findOne({ num }).select("_id");

      if (!problem) throw new Error("Задача не знайдена");

      const solving = await Solving.findOne({ user: user._id, problems: problem._id });

      if(!solving) {
          const solving = new Solving({
            user:user._id,
            problems:problem._id,
            solution: "Подумати, про вибір мов!!!!!!!!!!!!!!!!!!", 
            timestamp: new Date()
          });
      
        const savedSolving = await solving.save();
        console.log(savedSolving._id); // Виведе ID нового запису
        return res.status(200).json({ status: true, message: "Ok" , result:{solvingId:savedSolving._id, timestamp:savedSolving.timestamp, solution : savedSolving.solution}});
      }
      return res.status(200).json({ status: true, message: "Ok" , result:{solvingId:solving._id, timestamp:solving.timestamp, solution : formatCode(solving.solution)}})

    }catch (error) {
      logger.error(error.message, {num,  idUser}, res);
    }
}

const put = async (req, res) => {

    const { solution,  solvingId } = req.body; // Отримуємо нове рішення
    
    try {
        console.log(solvingId)
        if (!ObjectId.isValid(solvingId)) {
          throw new Error("Невірний формат ID рішення");
        }
        
        const solvingIdObj = new ObjectId(solvingId);

        // Знайти існуюче рішення за ID
        const solving = await Solving.findById(solvingIdObj).lean();

        if (!solving) throw new Error("Рішення не знайдено")
          
        // Перевіряємо, чи змінився текст рішення
        if (solving.solution !== solution) {
          solving.solution = solution; // Оновлюємо рішення
          solving.timestamp = new Date(); // Оновлюємо дату останнього оновлення

          await Solving.findByIdAndUpdate(solvingIdObj, solving);
        }

        delete solving._id;
        delete solving.user;
        return res.status(200).json({status:true, message: "Збережено" , result:solving});

      } catch (error) {
        logger.error(error.message, {solution,  solvingId}, res);
      }
};
export default  { get, put }