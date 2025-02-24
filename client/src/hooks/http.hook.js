import { useState, useCallback } from "react";
import { useAuth } from "../context/auth.context";
import { useCsrfToken } from "../hooks/сsrf.hook";
import {createLogger } from '../services/logger.services';

// Встановлюємо рівень логування
const log = createLogger("HTTP.hook"); 
log.setLevel('error');

// Константи для повідомлень про помилки
const ERROR_MESSAGES = {
    INVALID_URL: "Невірний URL! URL повинен починатися з 'http://' або '/'",
    INVALID_BODY: "Дані запиту повинні бути об'єктом!",
    INVALID_RESPONSE: "Некоректний формат відповіді сервера!",
    INVALID_STATUS: "Поле 'status' повинно бути булевим значенням!",
    INVALID_MESSAGE: "Поле 'message' повинно бути рядком!",
    MISSING_RESULT: "Відсутні дані у полі 'result' при успішній відповіді!",
    UNAUTHORIZED: "Сесія завершена. Будь ласка, увійдіть знову.",
};

// Основний домен API
const API_DOMAIN = process.env.REACT_APP_API_URL;

/**
 * Валідує тіло запиту.
 * @param {object} body - Тіло запиту.
 * @throws {Error} Якщо тіло запиту не є об'єктом.
 */
const validateBody = (body) => {
    if (body && typeof body !== "object") {
        throw new Error(ERROR_MESSAGES.INVALID_BODY);
    }
};

/**
 * Валідує відповідь сервера.
 * @param {object} data:{ result,message, result } - Дані відповіді сервера.
 * @throws {Error} Якщо відповідь не відповідає очікуваному формату.
 * @returns {object} Валідовані дані.
 */
const validateResponseData = (data) => {
    if (!data || typeof data !== "object") {
        throw new Error(ERROR_MESSAGES.INVALID_RESPONSE);
    }

    const { status, message, result } = data;

    if (typeof status !== "boolean") {
        throw new Error(ERROR_MESSAGES.INVALID_STATUS);
    }

    if (typeof message !== "string") {
        throw new Error(ERROR_MESSAGES.INVALID_MESSAGE);
    }

    if (status && result === undefined) {
        throw new Error(ERROR_MESSAGES.MISSING_RESULT);
    }

    return data;
};

/**
 * Виконує HTTP-запит та обробляє відповідь.
 * @param {string} url - URL для запиту.
 * @param {object} options - Опції запиту (метод, заголовки, тіло).
 * @param {function} logout - Функція для виходу з системи.
 * @throws {Error} Якщо відповідь не успішна або виникає помилка.
 * @returns {Promise<object>} Дані відповіді сервера.
 */
const fetchData = async (url, options, logout) => {

    log.debug("Url:", url, options);   // Перевірка вмісту url
    log.debug("Options:", options);   // Перевірка вмісту url

    const response = await fetch(url, options);

    log.debug("Response:", response);   // Перевірка вмісту response

    // Якщо отримано статус 401 (Unauthorized), викликаємо logout
    if (response.status === 401) {
        logout();
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    // Якщо відповідь не успішна, кидаємо помилку з повідомленням від сервера
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || ERROR_MESSAGES.INVALID_RESPONSE);
    }

    // Повертаємо дані відповіді у форматі JSON
    return response.json();
};

/**
 * Кастомний хук для виконання HTTP-запитів.
 * @returns {object} Об'єкт з функцією запиту, станом завантаження, помилкою та помилкою CSRF.
 */
export const useHttp = () => {
    // Стан для відстеження завантаження даних
    const [dataLoading, setDataLoading] = useState(false);
    // Стан для зберігання помилок
    const [error, setError] = useState(null);
    // Отримуємо дані авторизації (токен, стан завантаження, функцію виходу)
    const { token, isLoading, logout } = useAuth();
    // Отримуємо CSRF-токен та помилку, якщо вона є
    const { csrfToken, error: csrfError, fetchCsrfToken, waitForCsrfToken } = useCsrfToken();

    /**
     * Функція для виконання HTTP-запиту.
     * @param {string} url - URL для запиту.
     * @param {string} method - Метод запиту (GET, POST, PUT, DELETE тощо).
     * @param {object} body - Тіло запиту (якщо є).
     * @param {object} headers - Додаткові заголовки запиту.
     * @throws {Error} Якщо виникає помилка під час запиту.
     * @returns {Promise<object>} Валідовані дані відповіді сервера.
     */
    const request = useCallback(
        async (url, method = "GET", body = null, headers = {}) => {

            // чекаємо на токен
            waitForCsrfToken();

            // Якщо завантаження ще триває, не виконуємо запит
            if (isLoading) return;

            // Встановлюємо стан завантаження та очищуємо попередні помилки
            setDataLoading(true);
            setError(null);

            try {
                // Якщо CSRF-токен відсутній, отримуємо його
                if (!csrfToken) {
                    await fetchCsrfToken(url);
                }

                // Перевіряємо, чи URL починається з "/" або з основного домену API
                if (!url.startsWith("/") && !url.startsWith(API_DOMAIN)) {
                    throw new Error(ERROR_MESSAGES.INVALID_URL);
                }

                // Валідуємо тіло запиту, якщо воно є і метод не GET
                if (body && method !== "GET") {
                    validateBody(body);
                }

                // Визначаємо, чи запит відбувається до внутрішнього API
                const isInternalApi = url.startsWith("/api") || url.startsWith(`${API_DOMAIN}/api`);

                // Формуємо заголовки запиту
                const requestHeaders = {
                    "Content-Type": "application/json",
                    ...headers,
                    "CSRF-Token": csrfToken,
                    ...(token && isInternalApi && { Authorization: `Bearer ${token}` }),
                };

                // Формуємо опції запиту
                const options = {
                    method,
                    headers: requestHeaders,
                    ...(body && method !== "GET" && { body: JSON.stringify(body) }),
                };

                // Виконуємо запит та валідуємо відповідь
                const data = await fetchData(url, options, logout);

                return validateResponseData(data);
            } catch (error) {
                // Логуємо помилку та встановлюємо її в стан
                log.error(error.message);
                setError(error.message);
                throw error;
            } finally {
                // Завершуємо завантаження
                setDataLoading(false);
            }
        },
        [token, isLoading, logout, csrfToken, fetchCsrfToken]
    );

    // Повертаємо функцію запиту, стан завантаження, помилку та помилку CSRF
    return { request, dataLoading, error, csrfError };
};