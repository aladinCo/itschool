import React, { useState, useEffect } from "react";
import { TestGroupItem } from "../elements";
import styles from "../result-panel.module.scss";
// Компонент списка групп тестов
const TestGroupsList = ({ status, groupsData, groupsUpdate}) => {

    const [_groupsData, setGroupsData] = useState(groupsData);
    const [_groupUpdate, setGroupUpdate] =  useState(groupsUpdate);


    // Функція для оновлення конкретного `testGroup`
    useEffect(() => {
        if(groupsData) 
            setGroupsData(groupsData)
    }, [groupsData]);

    // Функція для оновлення конкретного `testGroup`
    useEffect(() => {
        if (!status) return;


        if (status === "transfer") {
            setGroupsData(prevState =>
                prevState.map((group) => {
                    if (group.group === groupsUpdate.group) {
                        // Створюємо нову копію групи
                        return {
                            ...group,
                            tests: group.tests.map((test) => {
                                // Оновлюємо конкретний тест
                                return test.id === groupsUpdate.id 
                                    ? { ...test, result: groupsUpdate.result, time: groupsUpdate.time }
                                    : test;
                            })
                        };
                    }
                    return group;
                })
            );
        }else if(status === "groupend"){
            setGroupsData(prevState => {
                if (!groupsUpdate?.groupsTests?.length) return prevState;
            
                const updatedGroup = groupsUpdate.groupsTests[0];
                
                const index = prevState.findIndex(group => {
                    console.log("group.group === updatedGroup.group", group.group, "===",  updatedGroup.group)
                    return Number(group.group) === Number(updatedGroup.group)
                });
            
                if (index === -1) return prevState; // Якщо групи немає, не змінюємо стан
            
                const newState = [...prevState];

                console.log("...newState[index], ...updatedGroup", newState[index], updatedGroup)
                newState[index] = { ...newState[index], ...updatedGroup };
                return newState;
            });
            console.log("_groupsData", _groupsData)
        }
    }, [groupsUpdate]);

    if(!Array.isArray(groupsData)  || groupsData.length === 0) 
        return("Дані відсутні або не є масивом")


    return(
        <ul className={styles._tests_list}>
            {_groupsData.map((testsGroupData, index) => (
                <TestGroupItem key={index} status={status} testsGroupData={testsGroupData}/>
            ))}
        </ul>
    )
};

export default TestGroupsList;