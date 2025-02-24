import React, { useEffect, useState, useCallback } from "react";



// Компонент для отображения ошибки
const ErrorMessage = ({ message }) => (
    <div className="result-panel">
        <code style={{ whiteSpace: "pre-wrap" }}>{message}</code>
    </div>
);

// Компонент одной группы тестов
const TestGroupItem = ({ testGroup, colors }) => (
    <li className="result-panel__tests_item_li">
        <div className="result-panel__tests_title">
            <span className="result-panel__tests_item_text">Набір тестів №</span>
            <span className="result-panel__tests_item_num">{testGroup.group}</span>
        </div>
        <div className="result-panel__tests_item_scoring">
            <span className="result-panel__tests_item_bal">0</span>/
            <span className="result-panel__tests_item_balall">{testGroup.testBal}</span>
        </div>
        <ul className="result-panel__marker-list result-marker-list">
            {!Array.isArray(testGroup.tests) 
            ?  <li key={0}>Дані відсутні або не є масивом</li>
            : testGroup.tests.map((test) => (
                <li
                    className={`result-panel__result-marker result-marker ${colors[test.id] || "result-marker-color-default"}`}
                    key={test.id}
                ></li>
            ))}
        </ul>
    </li>
);

// Компонент списка групп тестов
const TestGroupsList = ({ groups, colors }) => (
    <ul className="result-panel__tests_list">
        {!Array.isArray(groups)  || groups.length === 0
            ?  <li key={0}>Дані відсутні або не є масивом</li>
            : groups.map((testGroup, index) => (
            <TestGroupItem key={index} testGroup={testGroup} colors={colors} />
        ))}
    </ul>
);


const ResultPanel = React.memo(({ error, status, tests, update }) => {
    const [colors, setColors] = useState({});
    const [groups, setGroups] = useState([]);

    // Оптимизированное обновление теста
    const updateTest = useCallback((testId, newTestData) => {
        setGroups((prevGroups) => {
            const newGroups = [...prevGroups]; // Копируем массив
            for (let group of newGroups) {
                const testIndex = group.tests?.findIndex((test) => String(test.id) === String(testId));
                if (testIndex !== undefined && testIndex !== -1) {
                    group.tests[testIndex] = {
                        ...group.tests[testIndex],
                        time: newTestData.time,
                        isCorrect: newTestData.isCorrect,
                    };
                    break; // Остановить поиск, если нашли нужный тест
                }
            }
            return newGroups;
        });

        // Оптимизированное обновление цветов
        setColors((prevColors) => {
            const newColor = newTestData.isCorrect ? "result-marker-color-true" : "result-marker-color-false";
            return prevColors[testId] !== newColor ? { ...prevColors, [testId]: newColor } : prevColors;
        });
    }, []);

    // Обновление тестов при изменении `tests`
    useEffect(() => {
        setGroups(tests?.length ? [...tests] : []);
        setColors({});
    }, [tests]);

    // Обновление конкретного теста при изменении `update`
    useEffect(() => {
        if (update?.id) {
            updateTest(update.id, update);
        }
    }, [update, updateTest]);

    // Оптимизированное преобразование `\n` в `<br />`
    const convertNewLinesToBr = (text) => {
        if (!text || typeof text !== "string") return "";
        return text.split("\n").map((line, index) => (
            <div key={index}>
                {line}
                <br />
            </div>
        ));
    };
    
    if (!Array.isArray(groups)) {
            return <div>Дані відсутні або не є масивом</div>;
    }else {
    return (        
            <div className="result-panel">
                <div className={`result-panel__status--${status}`}>
                    {status === "error" && <ErrorMessage message={error} />}

                    {groups.length === 0 && status !== "error" ? (
                        <div className="result-panel__null_message">
                            Надішліть вашу програму, щоб побачити результати.
                        </div>
                    ) : (
                        <TestGroupsList groups={groups} colors={colors} />
                    )}
                </div>
            </div>
        );
    }
});

export default ResultPanel;
