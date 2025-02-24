import { useState, useEffect, useRef, useCallback } from "react";
import { createLogger } from '../services/logger.services';

// Ініціалізація логера для відладки
const log = createLogger("useSocketTests");
log.setLevel('debug'); // Встановлюємо рівень логування на "debug"

// Кастомний хук для роботи з WebSocket
const useSocketTests = (setResult, socketUrl = `${process.env.REACT_APP_SOCKET_URL}:${process.env.REACT_APP_SOCKET_PORT}`) => {
    const socketRef = useRef(null); // Реф для зберігання WebSocket з'єднання

    // Стани для управління станом з'єднання, завантаження, помилок, результатів тестів та оновлень
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [tests, setTests] = useState([]);
    const [update, setUpdate] = useState(null);

    // Функція для зупинки завантаження
    const stopLoading = () => setIsLoading(false);

    // Обробник повідомлень для `singletest`
    const handleSingleTestMessage = useCallback((data) => {
        switch (data.event) {
            case "start": // Подія початку тестування
                stopLoading();
                setResult(data.result)
                log.debug("Start", {result : data.result})
                //setTests(data.result); // Оновлюємо результати тестів
                break;            
            case "transfer": // Подія передачі даних
                stopLoading();
                log.debug("Transfer", data)
                setResult(data.result)
                //setUpdate(data.result.result); // Оновлюємо дані
                break;
            case "stop": // Подія зупинки тестування
                stopLoading();
                log.debug("Stop", {result : data.result})
                socketRef.current?.close(); // Закриваємо з'єднання
                break;
            case "error": // Подія помилки
                stopLoading();
                setError(data.message); // Встановлюємо повідомлення про помилку
                socketRef.current?.close(); // Закриваємо з'єднання
                break;
            default:
                stopLoading();
                // Встановлюємо повідомлення про помилку
                socketRef.current?.close(); // Закриваємо з'єднання
                setError("Невідома відповідь WebSocket ");
                break;
        }
    }, []);

    // Обробник повідомлень для `multipletest`
    const handleMultipleTestMessage = useCallback((data) => {
        log.debug("handleMultipleTestMessage", data)
        stopLoading();
        switch (data.event) {
            case "start": // Подія початку тестування
                
                log.debug("Start", {result : data.result})
                break;
            case "transfer": // Подія передачі даних

                log.debug("Transfer", data)
                setUpdate(data.result.result); // Оновлюємо дані
                break;
            case "runtest": // Подія початку тестування

                log.debug("Runtest", {result : data})
                setTests(data.result); // Оновлюємо результати тестів
                break;            
            case "stop": // Подія зупинки тестування

                socketRef.current?.close(); // Закриваємо з'єднання
                break;
            case "error": // Подія помилки

                setError(data.message); // Встановлюємо повідомлення про помилку
                socketRef.current?.close(); // Закриваємо з'єднання
                break;
            default:                
  
                // Встановлюємо повідомлення про помилку
                socketRef.current?.close(); // Закриваємо з'єднання
                setError("Невідома відповідь WebSocket ");
                break;
        }
    }, []);

    // Загальний обробник повідомлень від WebSocket
    const handleSocketMessage = useCallback((event) => {
        try {
            const parsedData = JSON.parse(event.data); // Парсимо отримані дані
            log.debug(`handleSocketMessage: ${parsedData.event}`, parsedData); // Логуємо подію
            setStatus(parsedData.event); // Оновлюємо статус
            
            if(!parsedData.status) throw new Error(parsedData.message);

            // Викликаємо відповідний обробник в залежності від типу тесту
            switch (socketRef.current?.testType) {
                case "singletest":
                    handleSingleTestMessage(parsedData);
                    break;

                case "multipletest":
                    handleMultipleTestMessage(parsedData);
                    break;
            }
        } catch (error) {
            stopLoading();
            log.error(error.message); // Логуємо помилку
            setError("Ошибка обработки данных WebSocket "); // Встановлюємо повідомлення про помилку
        }
    }, [handleSingleTestMessage, handleMultipleTestMessage]);

    // Обробник закриття з'єднання WebSocket
    const handleSocketClose = useCallback(() => {
        log.debug("Socket closed"); // Логуємо закриття з'єднання
        socketRef.current = null; // Очищаємо реф
        setIsConnected(false); // Встановлюємо стан "не підключено"
        stopLoading(); // Зупиняємо завантаження
    }, []);

    // Обробник помилок WebSocket
    const handleSocketError = useCallback(() => {
        stopLoading(); // Зупиняємо завантаження
        setError("Ошибка соединения WebSocket"); // Встановлюємо повідомлення про помилку
    }, []);

    // Функція для ініціалізації WebSocket з'єднання
    const initializeSocket = useCallback((testType, data) => {
        if (socketRef.current) return; // Якщо з'єднання вже існує, виходимо

        // Скидаємо помилки, результати та оновлення
        setError(null);
        setTests([]);
        setUpdate(null);
        setIsLoading(true); // Включаємо стан завантаження

        log.debug("SocketURL:", { socketUrl }); // Логуємо URL WebSocket
        log.debug(`Socket ${testType}: start`); // Логуємо тип тесту

        const socket = new WebSocket(socketUrl); // Створюємо нове WebSocket з'єднання
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
    }, [socketUrl, handleSocketMessage, handleSocketClose, handleSocketError]);

    // Функція для запуску одиночного тесту
    const runTests = useCallback((num, input, code) => {
        initializeSocket("singletest", { num, input,  code }); // Ініціалізуємо з'єднання з типом "singletest"
    }, [initializeSocket]);

    // Функція для запуску множинних тестів
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