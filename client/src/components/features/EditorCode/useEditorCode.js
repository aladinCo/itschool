import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHttp } from 'hooks/http.hook';
import {createLogger } from '../../../services/logger.services';

// Встановлюємо рівень логування
const log = createLogger("useEditorCode"); 
log.setLevel('debug');


// Функція для збереження даних в localStorage
const setLocaleStorage = (id, solvingId, codeText, timestamp) => {
    localStorage.setItem(
        `solving_${id}`, 
        JSON.stringify({ timestamp, solvingId, codeText })
    );
};

// Функція для отримання даних з localStorage
const getLocaleStorage = (id) => {
    const savedDraft = localStorage.getItem(`solving_${id}`);
    return savedDraft ? JSON.parse(savedDraft) : null; // Повертаємо дані або null, якщо вони відсутні
};

export const useEditorCode = (run, send) => {
    // Хук для роботи з HTTP запитами
    const { request, isLoading } = useHttp();
    // Отримуємо параметр id з URL 
    const { id } = useParams(); 
    // Стан для зберігання тексту коду
    const [codeText, setCodeText] = useState(''); 
    // Стан для зберігання останнього збереженого коду
    const [lastSavedText, setLastSavedText] = useState(''); 
    // Стан для зберігання solvingId
    const [solvingId, setSolvingId] = useState(null); 
    // Стан для зберігання timestamp
    //const [timestamp, setTimestamp] = useState(null); 
    // для відслідковування змін
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); 

    // Зберігання даних при виході з вкладки чи переході
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
               saveText(codeText);
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    // useEffect для завантаження даних з сервера або localStorage
    useEffect(() => {
        const fetchData = async () => {
            
            // Перевіряємо, чи є збережені дані в localStorage
            const localData = getLocaleStorage(id); 
            try {
                
                // Запитуємо дані з сервера
                const serverResponse = await request(`/api/solving/${id}`, "GET"); 
                log.debug("ServerResponse:", serverResponse);
                
                if (serverResponse?.result) {
                    
                    // Перетворюємо timestamp з сервера в мілісекунди
                    const dbTimestamp = new Date(serverResponse.result.timestamp).getTime(); 
                    // Перетворюємо timestamp з localStorage
                    const localTimestamp = localData?.timestamp ? Number(localData.timestamp) : 0; 

                    // Логіка для вибору, які дані використовувати: з сервера чи з localStorage
                    if (!(localData?.timestamp && localData?.solvingId && localData?.codeText)) {
                        
                        // Якщо немає даних в localStorage, використовуємо серверні
                        setData(serverResponse.result.solvingId, serverResponse.result.solution); 
                        log.debug("LocaleStorage saved from server data");
                    } else if (dbTimestamp > localTimestamp) { 
                        
                        // Якщо серверні дані новіші                       
                        setData(serverResponse.result.solvingId, serverResponse.result.solution); 
                        log.debug("LocaleStorage saved from server data");
                    } else if (dbTimestamp < localTimestamp) {
                        
                        // Якщо localStorage дані новіші                        
                        setData(localData.solvingId, localData.codeText); 
                        log.debug("LocaleStorage saved from local data");
                    }
                }
            } catch (error) { 
                
                // Обробка помилок при запиті
                log.error("Error fetching data:", error);
            }
        };

        if (!isLoading) {
            
            // Викликаємо fetchData після того, як запит завершиться
            fetchData(); 
        }
    }, [id, isLoading]); // Перезавантаження ефекту при зміні id або isLoading

    // useEffect для збереження тексту в localStorage, якщо він змінився
    useEffect(() => {
        if (codeText !== lastSavedText) {
            // Якщо код змінився, зберігаємо в localStorage
            setLocaleStorage(id, solvingId, codeText, Date.now()); 
        }
    // Залежить від зміни codeText
    }, [codeText]); 

    // Debounce: Затримка перед збереженням на сервер (5 секунд після останньої зміни)
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (codeText !== lastSavedText) {

                // Викликаємо збереження тексту на сервер
                saveText(codeText); 
            }
        }, 5000);

        // Очищаємо таймер при наступному вводі
        return () => clearTimeout(timeout);

    // Залежить від зміни codeText    
    }, [codeText]); 

    // Очищення введення для захисту від XSS атак
    const sanitizeInput = (input) => {
        
        // Видаляємо HTML теги
        return input;//.replace(/<[^>]*>/g, ''); 
    }

    // Функція для обробки змін коду
    const handleChange = (value) => {
        
        // Чистимо текст
        const sanitizedValue = sanitizeInput(value); 
        
        // Оновлюємо текст коду
        setCodeText(sanitizedValue);
    };

    // Функція для збереження тексту на сервері
    const saveText = async (newText) => {
        try {
            // Запит для збереження на сервер
            await request(`/api/solving/${id}`, "PUT", { solvingId, solution: newText }); 
            log.debug("Saved PUT from server data");
            // Оновлюємо останній збережений текст
            setLastSavedText(newText); 
        } catch (error) {
            // Обробка помилок при збереженні
            log.error("Error saving text:", error); 
        }
    };

    // Функція для встановлення даних
    const setData = (solvingId, codeText) => {
        setSolvingId(solvingId); // Оновлюємо solvingId
        setCodeText(codeText); // Оновлюємо текст коду
        setLastSavedText(codeText); // Оновлюємо останній збережений текст
        setHasUnsavedChanges(false); // якщо зміни збережені, скидаємо прапор
    };


    // Функція для налаштування редактора Monaco
    const handleDidMount = (editor, monaco) => {
        monaco.editor.defineTheme('myCustomTheme', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
                // Встановлюємо фоновий колір для редактора
                'editor.background': '#f2f6ff', 
            }
        });
        
        // Застосовуємо кастомну тему
        monaco.editor.setTheme('myCustomTheme'); 
        editor.updateOptions({
            
            // Відключаємо мінімальну карту
            minimap: { enabled: false }, 
            
            // Відключаємо вертикальну прокрутку
            scrollbar: { vertical: 'hidden' }, 
        });
    };

    // Функція для запуску коду
    const handleClickRun = () => run?.(id, codeText);

    // Функція для відправки коду
    const handleClickSend = () => send?.(id, codeText);

    return {
        codeText,
        handleDidMount,
        handleClickRun,
        handleClickSend,
        handleChange
    };
};
