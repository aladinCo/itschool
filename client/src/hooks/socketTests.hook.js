import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/auth.context";
import { createLogger } from '../services/logger.services';

// Ініціалізація логера для відладки
const log = createLogger("useSocketTests");
log.setLevel('debug'); // Встановлюємо рівень логування на "debug"

/**
 * Кастомний хук для роботи з WebSocket.
 * @param {function} setResult - Функція для оновлення результатів тестування.
 * @param {string} socketUrl - URL WebSocket сервера (за замовчуванням береться з змінних оточення).
 * @returns {object} Об'єкт, що містить стан з'єднання, помилки, результати тестів та функції для запуску тестів.
 */
const useSocketTests = (setResult, socketUrl = `${process.env.REACT_APP_SOCKET_URL}:${process.env.REACT_APP_SOCKET_PORT}`) => {
    
    // Отримуємо дані авторизації (токен, стан завантаження, функцію виходу)
    const { token } = useAuth();

    const socketRef = useRef(null); // Реф для зберігання WebSocket з'єднання

    // Стани для управління станом з'єднання, завантаження, помилок, результатів тестів та оновлень
    const [isConnected, setIsConnected] = useState(false); // Стан підключення до WebSocket
    const [isLoading, setIsLoading] = useState(false); // Стан завантаження (наприклад, під час очікування відповіді)
    const [status, setStatus] = useState(null); // Статус поточного стану (наприклад, "start", "transfer", "stop")
    const [error, setError] = useState(null); // Помилка, якщо вона виникла
    const [tests, setTests] = useState([]); // Результати тестів
    const [update, setUpdate] = useState(null); // Оновлення даних під час тестування

    /**
     * Зупиняє завантаження, встановлюючи isLoading в false.
     */
    const stopLoading = () => setIsLoading(false);

    /**
     * Обробник повідомлень для одиночного тесту (`singletest`).
     * @param {object} data - Дані, отримані від сервера.
     */
    const handleSingleTestMessage = useCallback((data) => {
        stopLoading(); // Зупиняємо завантаження після отримання повідомлення
        switch (data.event) {
            case "start": // Подія початку тестування
                setResult(data.result); // Оновлюємо результати тесту
                log.debug("Start", {result : data.result}); // Логуємо подію
                break;            
            case "transfer": // Подія передачі даних
                log.debug("Transfer", data); // Логуємо передачу даних
                setResult(data.result); // Оновлюємо результати
                break;
            case "stop": // Подія зупинки тестування
                log.debug("Stop", {result : data.result}); // Логуємо зупинку
                socketRef.current?.close(); // Закриваємо з'єднання
                break;
            case "error": // Подія помилки
                log.debug("Error", {result : data.result}); // Логуємо помилку
                setResult(data.result); // Оновлюємо результати
                setError(data.message); // Встановлюємо повідомлення про помилку
                socketRef.current?.close(); // Закриваємо з'єднання
                break;
            default:
                // Якщо отримано невідому подію
                socketRef.current?.close(); // Закриваємо з'єднання
                setError("Невідома відповідь WebSocket");
                break;
        }
    }, [setResult]);

    /**
     * Обробник повідомлень для множинних тестів (`multipletest`).
     * @param {object} data - Дані, отримані від сервера.
     */
    const handleMultipleTestMessage = useCallback((data) => {
        
        switch (data.event) {
            case "start": // Подія початку тестування
                log.debug("Start", {result : data.result}); // Логуємо подію
                break;            
            case "runtest": // Подія запуску тесту
                stopLoading(); // Знімаємо флаг завантаження після отримання повідомлення
                log.debug("Runtest", {result : data}); // Логуємо запуск тесту
                setTests(data.result); // Оновлюємо результати тестів
                break; 
            case "transfer": // Подія передачі даних
                stopLoading(); // Знімаємо флаг завантаження після отримання повідомлення
                log.debug("Transfer", data); // Логуємо передачу даних
                setUpdate(data.result); // Оновлюємо дані
                break;
            case "groupstart": // Подія завершення тестування групи
                stopLoading(); // Знімаємо флаг завантаження після отримання повідомлення
                log.debug("Groupstart", data); // Логуємо передачу даних
                setUpdate(data.result); // Оновлюємо дані
                break;   
            case "groupend": // Подія завершення тестування групи
                stopLoading(); // Знімаємо флаг завантаження після отримання повідомлення
                log.debug("Groupend", data); // Логуємо передачу даних
                setUpdate(data.result); // Оновлюємо дані
                break;        
            case "stop": // Подія зупинки тестування
                stopLoading(); // Знімаємо флаг завантаження після отримання повідомлення
                log.debug("Stop", data); // Логуємо зупинку
                setUpdate(data.result)
                socketRef.current?.close(); // Закриваємо з'єднання
                break;
            case "error": // Подія помилки
                stopLoading(); // Знімаємо флаг завантаження після отримання повідомлення
                log.debug("Error", {result : data.result}); // Логуємо помилку
                setError(data.result); // Встановлюємо повідомлення про помилку
                socketRef.current?.close(); // Закриваємо з'єднання
                break;
            default:
                // Якщо отримано невідому подію
                log.debug("Error", data); // Логуємо помилку
                socketRef.current?.close(); // Закриваємо з'єднання
                setError("Невідома відповідь WebSocket");
                break;
        }
    }, []);

    /**
     * Загальний обробник повідомлень від WebSocket.
     * @param {MessageEvent} event - Подія повідомлення від WebSocket.
     */
    const handleSocketMessage = useCallback((event) => {
        try {
            const parsedData = JSON.parse(event.data); // Парсимо отримані дані
            setStatus(parsedData.event); // Оновлюємо статус
            
            if (!parsedData.status) throw new Error(parsedData.message);

            // Викликаємо відповідний обробник в залежності від типу тесту
            switch (socketRef.current?.testType) {
                case "singletest":
                    handleSingleTestMessage(parsedData);
                    break;

                case "multipletest":
                    handleMultipleTestMessage(parsedData);
                    break;
                default:
                    setError("Невідомий виклик WebSocket");
                    break;
            }
        } catch (error) {
            stopLoading();
            log.error(error.message); // Логуємо помилку
            setError("Ошибка обработки данных WebSocket"); // Встановлюємо повідомлення про помилку
        }
    }, [handleSingleTestMessage, handleMultipleTestMessage]);

    /**
     * Обробник закриття з'єднання WebSocket.
     */
    const handleSocketClose = useCallback(() => {
        log.debug("Socket closed"); // Логуємо закриття з'єднання
        socketRef.current = null; // Очищаємо реф
        setIsConnected(false); // Встановлюємо стан "не підключено"
        stopLoading(); // Зупиняємо завантаження
    }, []);

    /**
     * Обробник помилок WebSocket.
     */
    const handleSocketError = useCallback(() => {
        stopLoading(); // Зупиняємо завантаження
        setError("Ошибка соединения WebSocket"); // Встановлюємо повідомлення про помилку
    }, []);

    /**
     * Ініціалізує WebSocket з'єднання.
     * @param {string} testType - Тип тесту ("singletest" або "multipletest").
     * @param {object} data - Дані для відправки на сервер.
     */
    const initializeSocket = useCallback((testType, data) => {
        if (socketRef.current) return; // Якщо з'єднання вже існує, виходимо

        // Скидаємо помилки, результати та оновлення
        setError(null);
        setTests([]);
        setUpdate(null);
        setIsLoading(true); // Включаємо стан завантаження

        log.debug("SocketURL:", { socketUrl }); // Логуємо URL WebSocket
        log.debug(`Socket ${testType}: start`); // Логуємо тип тесту

        const socket = new WebSocket(socketUrl, [token]); // Створюємо нове WebSocket з'єднання
        socketRef.current = socket; // Зберігаємо з'єднання в реф
        socketRef.current.testType = testType; // Зберігаємо тип тесту в реф

        // Обробник відкриття з'єднання
        socket.onopen = () => {
            setIsConnected(true); // Встановлюємо стан "підключено"
            socket.send(JSON.stringify({ event: testType, data })); // Відправляємо дані на сервер
            log.debug(`Event: ${testType}:`, data); // Логуємо подію
        };

        // Підключаємо обробники подій
        socket.onmessage = handleSocketMessage;
        socket.onclose = handleSocketClose;
        socket.onerror = handleSocketError;
    }, [socketUrl, handleSocketMessage, handleSocketClose, handleSocketError, token]);

    /**
     * Запускає одиночний тест.
     * @param {number} num - Номер програми.
     * @param {string} input - Вхідні дані.
     * @param {string} code - Код програми.
     */
    const runTests = useCallback((num, input, code) => {
        initializeSocket("singletest", { num, input, code }); // Ініціалізуємо з'єднання з типом "singletest"
    }, [initializeSocket]);

    /**
     * Запускає множинні тести.
     * @param {number} num - Номер програми.
     * @param {string} code - Код програми.
     */
    const sendTests = useCallback((num, code) => {
        initializeSocket("multipletest", { num, code }); // Ініціалізуємо з'єднання з типом "multipletest"
    }, [initializeSocket]);

    // Ефект для закриття з'єднання при розмонтуванні компонента
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.close(); // Закриваємо з'єднання
            }
        };
    }, []);

    // Повертаємо стан та функції для використання в компоненті
    return { isConnected, isLoading, error, status, tests, update, sendTests, runTests };
};

export default useSocketTests;