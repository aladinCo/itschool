// 🚨 Цей файл фінальний. Не змінювати без дозволу!
import jwt  from 'jsonwebtoken'; 
import logger from "../utils/logger.utils.js";

const ERROR_MESSAGES = {
  UNAUTHORIZED: "Немає авторизації!",
  INVALID_TOKEN: "Некоректний токен!"
};

// Middleware для перевірки авторизації
const auth = (req, res, next) => {
    
    // Якщо метод OPTION, то пропускаємо далі обробку
    if(req.method === 'OPTION') {
      return next();
    }

    try {

      // Отримуємо токен з заголовка
      const token = req.headers['authorization']?.split(' ')[1];
      
      // Перевірка на наявність токена
      if(!token){
        logger.error(ERROR_MESSAGES.UNAUTHORIZED, {headers : req.headers}, res);
        return;// res.status(401).json({status:false, message: "Немає авторизації!!!"})
      }

      // Перевірка на валідність токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Додаємо iduser в req
      req.iduser = decoded; 

       
    } catch (error) {
      logger.error(ERROR_MESSAGES.INVALID_TOKEN, {headers : req.headers}, res);
      return; //res.status(401).send({status:false, message:'Invalid token'});
    } 
    // Пропускаємо далі обробку 
    next(); 
}

export  {auth};
