// Константи для текстових повідомлень
const QUEUE_ERRORS = {
    PROGRAM_NOT_EMPTY: `Текст програми не повинен бути пустим!`,
    MISSING_PROGRAM: (num) => `Програма #${num} відсутня!`,
    MISSING_TESTS: (num) => `Тести для задачі з номером ${num} не знайдені!`,
    COMPILATION_ERROR: "Помилка компіляції",
    FILE_NOT_FOUND: (path) => `Помилка: файл не знайдено! (${path})`,
    USER_NOT_FOUND: "Користувача з publicId не знайдено",
};

export default QUEUE_ERRORS;