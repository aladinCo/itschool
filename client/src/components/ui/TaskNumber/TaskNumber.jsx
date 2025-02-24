import styles from "./task-number.module.scss"

const TaskNumber = ({ number, status }) => {
    const statusStr = ["notresolved", "resolved", "inprogress"];
    return (
        <div className={styles._container + " " + styles[`_container--${statusStr[status]}`]}>
            <span className={styles._container_title}> {number} </span>
        </div>
    );
};

export default TaskNumber;