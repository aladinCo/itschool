import { useState } from 'react';
import { Spinner, Sidebar, Header } from "../../../components";
import { useText } from "../../../hooks/useText"
import { FaHome, FaCog, FaBars, FaUser } from "react-icons/fa";

import styles from "./pagetemplate.module.scss"

const PageTemplate = ({title, toolbar, children, isLoading}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    // Зготрання слайдер меню
    const toCollapsed = () => {
        setIsCollapsed(!isCollapsed);
    };

    return(
         <div className={styles._container}>
            {/* Ліва частина (слайдер меню)*/}
            <div className={styles._container_main_sidebar}>       
                <Sidebar isCollapsed={isCollapsed}/>
            </div>
            {/* Права частина (верхня панель + контент)*/}
            <div className={styles._container_main_content}>
                {/* Верхня панель */}
                <div className={styles._container_header}>
                    <Header toCollapsed ={toCollapsed}  title={title} toolbar={toolbar} />
                </div>                
                {/* Контент */}
                <div className={styles._container_content}>
                    {isLoading ? <Spinner/>: children}
                </div>
            </div>
        </div>     
    )
}

export default PageTemplate;