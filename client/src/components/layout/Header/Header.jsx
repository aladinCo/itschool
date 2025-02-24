
import { TaskNumber } from "../../../components/ui";
import { FaHome, FaCog, FaBars, FaUser } from "react-icons/fa";

import styles from "./header.module.scss"

const Header = ({toCollapsed, title, numProblem}) => {
    
    const num = 0;
    return(
        <div className={styles._header}>
            <div className={styles._lefttoolbar}>
                <button className="toggle-btn" onClick={toCollapsed}>
                    <FaBars />
                </button>
                <div className={styles._lefttoolbar_title}>
                    <div className={styles._lefttoolbar_title_number}>
                        <TaskNumber number={numProblem} status={num}/>
                    </div>
                    <div className={styles._lefttoolbar_title_text}>{title}</div>
                </div>
            </div>
            <div className={styles._righttoolbar}>
                <FaUser className="user-icon" /> 
            </div>
        </div>
    )
}

export default Header;