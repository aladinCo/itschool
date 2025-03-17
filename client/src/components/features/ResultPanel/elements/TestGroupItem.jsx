import React, { useEffect, useState } from "react";
import styles from "../result-panel.module.scss";

const TestGroupItem = ({status, testsGroupData }) => {

    const [_testsGroupData, setTestsGroupData] = useState(testsGroupData)
    const [statusText, setStatusText] = useState("");
    const [scored, setScored] = useState(0);
    const [updatedColors, setUpdatedColors] = useState({});
    
    useEffect(() => {
        setTestsGroupData(testsGroupData)
    },[testsGroupData]);
    
    useEffect(() => {
        switch(status){
            case "start":
                setStatusText("Розпочинаємо!");
                break;
            case "runtest":
                setStatusText("Компіляція!");
                break;
        }

    }, [status]);

    useEffect(() => {
        if(status && status === "groupend" && _testsGroupData){
            console.log("ok", _testsGroupData)
            //updateGroup({ scored: 10 });
            //updateGroup({ scored: data.groupsTests[testGroup.group - 1]?.scored });
            setScored(_testsGroupData.scored)
            if(_testsGroupData.scored === _testsGroupData.testBal) setStatusText("Зараховано");
            else if(_testsGroupData.scored !== _testsGroupData.testBal) setStatusText("Неправильна відповідь"); 
        }
    }, [_testsGroupData]);
/**/ 

    useEffect(() => {  
        if (_testsGroupData?.tests) {
            _testsGroupData.tests.forEach((test) => {
                // Перевіряємо результат кожного тесту і оновлюємо відповідний колір
                setUpdatedColors((prevStatus) => ({
                    ...prevStatus,
                    [test.id]: test.result == null ? styles["_color-default"] : test.result ? styles["_color-true"] : styles["_color-false"]
                }));
            });
        }
    }, [_testsGroupData?.tests]);  // Залежність від змін в масиві tests
 
   

    if(!Array.isArray(testsGroupData?.tests)) return ("Дані відсутні або не є масивом");

    return(
        <li className={styles._tests_item_li}>
            <div className="result-panel__tests_title">
                <span className="result-panel__tests_item_text">Набір тестів №</span>
                <span className="result-panel__tests_item_num">{testsGroupData.group}</span>
            </div>
            <div className="result-panel__tests_item_conclusion">
                <span className="result-panel__tests_item_scored">{statusText}</span>
            </div>
            <div className="result-panel__tests_item_scoring">
                <span className="result-panel__tests_item_scored">{scored}</span>/
                <span className="result-panel__tests_item_bal">{testsGroupData.testBal}</span>
            </div>
            <ul className="result-panel__marker-list result-marker-list">
                {testsGroupData.tests.map((test) => (
                    <li
                        className={`${styles["_result-marker"]} ${updatedColors[test.id] || styles["_color-default"]}`}
                        key={test.id}
                    ></li>
                ))}
            </ul>
        </li>
    )
};

export default TestGroupItem;