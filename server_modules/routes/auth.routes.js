import { Router } from 'express';
import { Auth } from "../controllers/index.js";
import { csrfProtection, getCsrfToken } from '../middleware/csrf.middleware.js';

const router = Router()

// Маршрут для отримання CSRF токена
router.get('/csrf-token', csrfProtection, getCsrfToken);

// /api/auth/register
router.post('/register', Auth.register)

// /api/auth/login
router.post('/login', Auth.login)

// /api/auth/login
//router.post('/add', Auth.add)

export default  router