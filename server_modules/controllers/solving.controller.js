  const CONTROLLERS = "Solving"

import { Types} from 'mongoose'

import config  from "config"
const cfg = config[CONTROLLERS]
import logger  from "../utils/logger.utils.js"

import { Solving, User, Problems } from "../models/index.js";

const formatCode = (code) => {
    // Наприклад, замінюємо '\n' на реальні символи нового рядка
    return code.replace(/\\n/g, '\n'); // заміняє '\n' на реальні нові рядки
  };
  


const get = async (req, res) => {
    const idUser = req?.iduser?.publicId;
    const num = req.params.id;

    //console.log(idUser)

    try {
        const user = await User.findOne({ publicId:idUser }).select("_id");
        if (!user) {
            throw new Error("Користувач не знайдений");
        }

        const problem = await Problems.findOne({ num }).select("_id");
        if (!problem) {
            throw new Error("Задача не знайдена");
        }

        const solving = await Solving.findOne({ user: user._id, problems: problem._id });
        
        res.status(200).json({ status: true, message: "Ok" , result:{solvingId:solving._id, timestamp:solving.timestamp, solution : formatCode(solving.solution)}})
        //console.log("sendData user:", user, " problem: ", problem, " solving: ", solving)

    }catch (error) {
        console.log(error)
    }
    //const user = await Solving.findOne({ email });
    //const code = "#include <iostream>\nusing namespace std;\nint main() {\n    int xx;\n    cin >> x;\n    cout << x * 2 << \" \" << x * 100; \n    return 0;\n}";
    
}

const put = async (req, res) => {
    //const solvingId = req.params.id; // Отримуємо id рішення
    const { solution,  solvingId } = req.body; // Отримуємо нове рішення
    const solvingIdObj = new Types.ObjectId(solvingId);
    try {
        // Знайти існуюче рішення за ID
        const solving = await Solving.findById(solvingIdObj).lean();;
        if (solving) {
          // Перевіряємо, чи змінився текст рішення
          if (solving.solution !== solution) {
            solving.solution = solution; // Оновлюємо рішення
            solving.timestamp = new Date(); // Оновлюємо дату останнього оновлення

            await Solving.findByIdAndUpdate(solvingIdObj, solving);
            //await solving.save(); // Зберігаємо зміни
            //console.log(`Рішення для задачі ${solvingId} оновлено!`);
          }
          delete solving._id;
          delete solving.user;
          return res.status(200).json({status:true, message: "Збережено" , result:solving});
        } else {
          return res.status(404).json({ message: "Рішення не знайдено" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Помилка при оновленні рішення" });
      }
};
export default  { get, put }