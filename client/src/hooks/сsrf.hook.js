import { useState, useEffect, useCallback, useRef } from 'react';
import {createLogger } from '../services/logger.services';

// Встановлюємо рівень логування
const log = createLogger("CSRF.hook"); 
log.setLevel('error');

// Хук для отримання та зберігання CSRF токена
export const useCsrfToken = () => {
    const [csrfToken, setCsrfToken] = useState(() => sessionStorage.getItem('csrfToken') || null);
    const [url, setUrl] = useState(null);
    const [error, setError] = useState(null);

    const isFetching = useRef(false); // Запобігає повторним запитам
    const waitingRequests = useRef(0); // Лічильник запитів, що чекають на токен

    // Функція для отримання CSRF токена з сервера
    const fetchCsrfToken = useCallback(async (_url, signal) => {
        setUrl(_url);
        log.debug("CSRF_URL:", _url);

        // Якщо вже є активний запит — виходимо
        if (isFetching.current) return; 
        isFetching.current = true;

        // Якщо токен вже є в sessionStorage, не робимо запит
        const csrfTokenLocal = sessionStorage.getItem('csrfToken')
        log.debug("Stored CSRF Token:", csrfTokenLocal);
        
        if (csrfTokenLocal) {
            log.debug("csrfTokenLocal: ", csrfTokenLocal);
            // Обновляем стейт
            setCsrfToken(csrfTokenLocal);  
            isFetching.current = false;
            return;
        }
        log.debug("waitingRequests:", waitingRequests.current);
        if(waitingRequests.current > 0 ) return;

        try {
            waitingRequests.current++;
            const response = await fetch('/api/auth/csrf-token', { signal });
            
            if (!response.ok) {
                waitingRequests.current--;
                throw new Error('Не вдалося отримати CSRF токен');
                
            }

            const csrfTokenServer = await response.json();
            log.debug("csrfTokenServer_URL: ", url,  csrfTokenServer.csrfToken);

            // Зберігаємо токен у стані та sessionStorage
            setCsrfToken(csrfTokenServer.csrfToken);
            sessionStorage.setItem('csrfToken', csrfTokenServer.csrfToken);
        } catch (error) {
            if (error.name !== 'AbortError') {
                waitingRequests.current--;
                log.error('Помилка отримання CSRF токена:', error.message);
                setError(error.message);
            }
        }finally {
            isFetching.current = false;
        }
    }, []);

    // Отримуємо токен при монтуванні компонента (якщо він відсутній)
    useEffect(() => {
        if (!csrfToken) {
            const abortController = new AbortController();
            fetchCsrfToken(url, abortController.signal);

            return () => abortController.abort();
        }
    }, [csrfToken, fetchCsrfToken]);

    useEffect(() => {
        log.debug("csrfToken Updated:", csrfToken);
    }, [csrfToken]);

    // Функція для того, щоб компоненти чекали на токен
    const waitForCsrfToken = async () => {
        log.debug("waitingRequests:", waitingRequests.current);
        if (!csrfToken) {            
            while (!csrfToken) {
                await new Promise(resolve => setTimeout(resolve, 100)); // чекаємо 100мс
            }
            //waitingRequests.current--;
        }
    };

    return { csrfToken, error, fetchCsrfToken, waitForCsrfToken };
};