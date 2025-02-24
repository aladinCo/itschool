import bcrypt from 'bcryptjs';
import jwt  from 'jsonwebtoken';
import { v4 as uuidv4 } from "uuid";

import { User }  from '../models/index.js';

// /api/auth/register
const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Пользователь уже существует" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
            publicId: uuidv4() // Генерируем безопасный ID
        });
        
        await newUser.save();

        res.status(201).json({ message: "Пользователь создан" });
    } catch (e) {
        res.status(500).json({ message: "Ошибка сервера" });
    }
};



// /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Неверные учетные данные" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Неверные учетные данные" });
        }

        // Создание access-токена (с `publicId` и `tokenVersion`)
        const accessToken = jwt.sign(
            { publicId: user.publicId, tokenVersion: user.tokenVersion },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Создание refresh-токена (в нем тоже `publicId` и `tokenVersion`)
        const refreshToken = jwt.sign(
            { publicId: user.publicId, tokenVersion: user.tokenVersion },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Устанавливаем refresh-токен в `httpOnly` cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true, // Доступен только серверу (защита от XSS)
            secure: process.env.NODE_ENV === "production", // Только HTTPS в продакшене
            sameSite: "Strict", // Запрещает передачу между сайтами (защита от CSRF)
        });

        res.status(200).json({
            status: true,
            message: "Ok",
            result: { accessToken, publicId: user.publicId }
        });

        //res.status(200).json({ status: true, message: "Ok", result: { token, publicId: user.publicId } });
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// /api/test/add
const add = async (req, res) => {
    /*try {
        const { email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, config.auth.salt);
        const user = new User({ email, password: hashedPassword });
console.log(email, hashedPassword)
        await user.save();

        res.status(201).json({ message: 'Пользователь создан' });
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
    }*/
};

export default  { login, register, add }