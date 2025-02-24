import { useState, useEffect } from 'react';
import {createLogger } from '../../../services/logger.services';

// Встановлюємо рівень логування
const log = createLogger("useEditorInputData"); 
log.setLevel('error');



export const useEditorInputData = (input, inputDataTransfer) => {

    log.debug("Input:", input)

    // Стан для зберігання тексту коду
    const [inputData, setInputData] = useState(input); 
    
    // Оновлюємо inputData при зміні input
    useEffect(() => {
        setInputData(input);
    }, [input]); 


     // Функція для обробки змін коду
     const handleChange = (value) => {
        // Оновлюємо текст вхідних даних в батьківському елементі
        inputDataTransfer(value)        
        // Оновлюємо текст вхідних даних
        setInputData(value);
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

    return {
        inputData,
        handleDidMount,
        handleChange
    };
};
