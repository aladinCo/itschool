import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

// Застосовуємо плагін для префіксів
prefix.apply(log, {
    format: (level, name, timestamp) => `[${name}] ${level}:`,
});

// Функція для створення логера для конкретного модуля
export function createLogger(moduleName) {
    const logger = log.getLogger(moduleName);
    logger.setLevel('debug'); // За замовчуванням встановлюємо рівень логування
    return logger;
}

// Експортуємо глобальний логер для зручності
export const globalLogger = log;