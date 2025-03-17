import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaCog, FaBars, FaUser } from "react-icons/fa"; // Иконки

const Sidebar = ({isCollapsed}) => {
  //const [isCollapsed, setIsCollapsed] = useState(true);

  return (      
      <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <ul>
          <MenuItem to="/problems" icon={<FaHome />} text="Главная" isCollapsed={isCollapsed} />
          <MenuItem icon={<FaCog />} text="Настройки" isCollapsed={isCollapsed} />
        </ul>
      </div> 
  );
};



// Компонент пункта меню
const MenuItem = ({ icon, text, to="", isCollapsed }) => {
  return (
    <li className="menu-item">
      <Link to={to}>
        {icon}
        {!isCollapsed && <span className="menu-text">{text}</span>}
      </Link>
    </li>
  );
};

export default Sidebar;