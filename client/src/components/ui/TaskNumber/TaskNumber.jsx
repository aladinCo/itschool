import { useEffect, useState } from "react";
import styles from "./task-number.module.scss"

const TaskNumber = ({ number, status }) => {
    const statusStr = ["notresolved", "resolved", "inprogress"];
    const [statusTask, setStatusTask] = useState(0);

    useEffect(()=>{
        if (status === null || status === undefined) {
            setStatusTask(0);
        } else if (status === false){
            setStatusTask(2);
        } else if (status === true){
            setStatusTask(1);
        }
    }, [status])
    return (
        <div className={styles._container + " " + styles[`_container--${statusStr[statusTask]}`]}>
            <span className={styles._container_title}> {number} </span>
        </div>
    );
};

export default TaskNumber;