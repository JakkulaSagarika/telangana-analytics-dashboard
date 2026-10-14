import {
  FaChartPie,
  FaChartBar,
  FaTable,
  FaCog,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

import "../styles/sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">

      <nav className="menu">

        <NavLink
          to="/health-dashboard"
          className="menu-item"
        >
          <FaChartPie className="menu-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className="menu-item"
        >
          <FaChartBar className="menu-icon" />
          <span>Analytics</span>
        </NavLink>

        <NavLink
          to="/district-analysis"
          className="menu-item"
        >
          <FaTable className="menu-icon" />
          <span>District Report</span>
        </NavLink>

        <NavLink
          to="/settings"
          className="menu-item"
        >
          <FaCog className="menu-icon" />
          <span>Settings</span>
        </NavLink>

      </nav>

    </aside>
  );
}

export default Sidebar;