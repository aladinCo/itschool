import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../../components/ui";

const Pagination = ({ totalPages, onChange }) => {
    // Отримуємо поточні параметри пошуку та функцію для їх оновлення
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Визначаємо початкову сторінку з параметрів пошуку або встановлюємо 1 за замовчуванням
    const initialPage = Number(searchParams.get("page")) || 1;
    
    // Стан для зберігання поточної сторінки
    const [page, setPage] = useState(initialPage);
    
    // Стан для зберігання списку сторінок, які будуть відображені
    const [pages, setPages] = useState([]);

    // Оновлення параметрів пошуку при зміні сторінки
    useEffect(() => {
        const currentParams = Object.fromEntries(searchParams);

        if (page > 1) {
            setSearchParams({ ...currentParams, page });
        } else {
            // Якщо сторінка 1, видаляємо параметр "page" з URL
            delete currentParams.page;
            setSearchParams(currentParams);
        }
    }, [page, setSearchParams]);

    // Оновлення списку сторінок при зміні загальної кількості сторінок або поточної сторінки
    useEffect(() => {
        if (totalPages < 8) {
            // Якщо сторінок менше 8, показуємо всі сторінки
            setPages([...Array(totalPages)].map((_, i) => i + 1));
        } else if (page < 5) {
            // Якщо поточна сторінка в перших 4, показуємо перші 5 сторінок, "..." та останню сторінку
            setPages([1, 2, 3, 4, 5, "...", totalPages]);
        } else if (page > 4 && page < totalPages - 3) {
            // Якщо поточна сторінка в середині, показуємо першу сторінку, "...", поточну сторінку та сусідні, "..." та останню сторінку
            setPages([1, "...", page - 1, page, page + 1, "...", totalPages]);
        } else {
            // Якщо поточна сторінка в останніх 4, показуємо першу сторінку, "..." та останні 5 сторінок
            setPages([1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]);
        }
    }, [totalPages, page]);

    // Обробник кліку на кнопку сторінки
    const onClickHandler = (num) => {
        if (typeof num === "number") {
            setPage(num);
            onChange(num);
        }
    };

    return (
        <div className="pagination">
            {/* Кнопка "Назад" */}
            <Button 
                disabled={page === 1} 
                onClick={() => setPage((prevPage) => prevPage - 1)} 
                label="&lt;" 
            />
            
            {/* Відображення списку сторінок */}
            {pages.map((num, index) => (
                num === "..." ? (
                    <span style={{ width: "40px", display: "inline-block", textAlign: "center" }} key={index}>{num}</span>
                ) : (
                    <Button
                        label={String(num)}                         
                        key={index} 
                        onClick={() => onClickHandler(num)}
                        active={num === page}
                        color="DEFAULT"
                        size="MEDIUM"
                    />
                )
            ))}

            {/* Кнопка "Вперед" */}
            <Button 
                disabled={page === totalPages} 
                onClick={() => setPage((prevPage) => prevPage + 1)} 
                label="&gt;" 
            />
        </div>
    );
};

// Значення за замовчуванням для пропсів
Pagination.defaultProps = {
    totalPages: 1,
    onChange: () => {}
};

export default Pagination;