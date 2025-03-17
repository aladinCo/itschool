

import { FaHome, FaCog, FaBars, FaUser } from "react-icons/fa";

import styles from "./header.module.scss"

const Header = ({toCollapsed, title, toolbar = null}) => {
    const num = 0;
    return(
        <div className={styles._header}>
            <div className={styles._lefttoolbar}>
                <button className="toggle-btn" onClick={toCollapsed}>
                    <FaBars />
                </button>
                {toolbar?.left?.map((item, i) => (
                    <div key={i} className={styles._lefttoolbar_element}>
                        {item}                            
                    </div>
                ))
                
                /**/}
                <div className={styles._lefttoolbar_title_text}>{title}</div>
            </div>
            <div className={styles._righttoolbar}>
                {toolbar?.right?.map((item, i) => (
                    <div key={i} className={styles.__righttoolbar_element}>
                        {item}                            
                    </div>
                ))}

                <FaUser className="user-icon" /> 
            </div>
        </div>
    )
}

export default Header;
/*<div className={styles._lefttoolbar_title_number}>
                            
                        </div>*/