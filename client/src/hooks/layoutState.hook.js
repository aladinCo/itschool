import { useState, useEffect } from "react";

// Начальные размеры
const initialSizes = {
    leftWidth: "50%",
    rightWidth: "50%",
    topWidth: "65%",
    bottomWidth: "35%",
};

// Функция для получения размеров из localStorage или использования начальных размеров
const getInitialSizes = () => {
    const savedSizes = localStorage.getItem("layoutSizes");
    return savedSizes ? JSON.parse(savedSizes) : initialSizes;
};

const useLayoutState = () => {
    const [sizes, setSizes] = useState(getInitialSizes());

    // Обработчик вертикального изменения размера
    const handleResizeV = (newSize) => {
        setSizes((prev) => ({
            ...prev,
            topWidth: newSize.x,
            bottomWidth: newSize.w - newSize.x,
        }));
    };

    // Обработчик горизонтального изменения размера
    const handleResizeH = (newSize) => {
        setSizes((prev) => ({
            ...prev,
            leftWidth: newSize.x,
            rightWidth: newSize.w - newSize.x,
        }));
    };
    

    // Сохранение размеров в localStorage при их изменении
    useEffect(() => {
        localStorage.setItem("layoutSizes", JSON.stringify(sizes));
    }, [sizes]);

    return { sizes, handleResizeV, handleResizeH };
};

export default useLayoutState;