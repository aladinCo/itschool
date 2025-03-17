import React, { useEffect, useState } from "react";
import { Spinner } from "../../../components"
import {TestGroupsList} from "./elements"

//import * as sass from 'sass';
//const styles = sass.compileSync("./result-panel.module.scss");
//const styles = sass.renderSync({ file: "./result-panel.module.scss" });
import styles from "./result-panel.module.scss";

// Компонент для отображения ошибки
const ErrorMessage = ({ message }) => (
    <div className={styles["_status--error"]}>
        <code style={{ whiteSpace: "pre-wrap" }}>{message}</code>
    </div> 
);
  
const ResultPanel = React.memo(({isLoading,  error, status, tests, data }) => {
    const [content, setContent] = useState("");
    const [updateData, setUpdateData] = useState(data);
    const [groups, setGroups] = useState([]);

    // Обновление тестов при изменении `tests`
    useEffect(() => {
        setGroups(tests?.groupsTests?.length ? [...tests.groupsTests] : []);
    }, [tests?.groupsTests]);
   

    useEffect(() => {
        setUpdateData(data)
    }, [data]);

    useEffect(() => {
        if(!status) 
            setContent("Надішліть вашу програму, щоб побачити результати.");
        else if(isLoading) 
            setContent(<Spinner />);
        else if(status === "error")
            setContent(<ErrorMessage message={error} />)
        else if(status !== "error") {        
            setContent(<TestGroupsList status={status} groupsData={groups} groupsUpdate={updateData}/>)
        }
    }, [status, error, isLoading, groups, updateData]);

    return(
        <div className={styles._}>
            <div className={styles[`_status--${!status ? 'default' :  status}`]}>
                {content}
            </div>
        </div>
    )
});

export default ResultPanel;
/*<div>Error:{JSON.stringify(error)}</div>
<div>Status:{JSON.stringify(status)}</div>
<div>Tests:{JSON.stringify(tests)}</div>
<div>Update:{JSON.stringify(date)}</div>*/