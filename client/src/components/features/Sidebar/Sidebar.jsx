import React, { useEffect, useState } from 'react';
import { FaHome, FaCog, FaBars, FaUser } from "react-icons/fa"; // Иконки

const Sidebar = ({isCollapsed}) => {
  //const [isCollapsed, setIsCollapsed] = useState(true);

  return (      
      <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <ul>
          <MenuItem icon={<FaHome />} text="Главная" isCollapsed={isCollapsed} />
          <MenuItem icon={<FaCog />} text="Настройки" isCollapsed={isCollapsed} />
        </ul>
      </div> 
  );
};



// Компонент пункта меню
const MenuItem = ({ icon, text, isCollapsed }) => {
  return (
    <li className="menu-item">
      {icon}
      {!isCollapsed && <span className="menu-text">{text}</span>}
    </li>
  );
};

export default Sidebar;