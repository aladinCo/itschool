import cookieParser from 'cookie-parser';
import csrf from 'csurf';

// Ініціалізація CSRF middleware (працює через куки)
const csrfProtection = csrf({ 
    cookie: {
        httpOnly: true, // Захищає від доступу JavaScript
        secure: process.env.NODE_ENV === 'production', // У продакшені працює тільки через HTTPS
        sameSite: 'strict' // Запобігає атакам через інші сайти
    }
});

// Middleware для отримання CSRF-токена
const getCsrfToken = (req, res) => {
    console.log("getCsrfToken", req.csrfToken())
    res.json({ csrfToken: req.csrfToken() });
};

// Middleware для обробки помилок CSRF
const handleCsrfError = (err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: "Невірний CSRF токен!" });
    }
    next(err);
};
export  { handleCsrfError, getCsrfToken, csrfProtection};