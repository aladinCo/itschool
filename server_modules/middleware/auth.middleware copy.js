// middleware/iduser.js
import jwt  from 'jsonwebtoken'; // Используем JWT для извлечения iduser из токена

// Middleware для добавления iduser в req
const auth = (req, res, next) => {
  // Здесь мы предполагаем, что токен передается в заголовке Authorization
  console.log("addIdUserToRequest", req.headers)
  const token = req.headers['authorization']?.split(' ')[1];

  console.log("addIdUserToRequest", token)

  if (token) {
    try {
        
      // Проверка и декодирование токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.iduser = decoded.iduser; // Добавляем iduser в объект req
    } catch (error) {
      return res.status(400).send('Invalid token.');
    }
  }
  next(); // Пропускаем обработку для всех маршрутов  
}

export  {auth};
