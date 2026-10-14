import {
    FaChartBar,
    FaCloudRain,
    FaExchangeAlt,
    FaMapMarkedAlt,
    FaTachometerAlt,
    FaTint,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import { useRainfall } from "../context/RainfallContext";

import "../styles/sidebar.css";

function Sidebar() {
    const { selectedYear } = useRainfall();

    return (
        <aside className="sidebar">

            {/* BRAND */}

            <div className="sidebar-brand">

                <div className="brand-mark">
                    R
                </div>

                <div className="brand-text">

                    <h2>
                        Telangana
                    </h2>

                    <span>
                        Rainfall Analytics
                    </span>

                </div>

            </div>


            {/* NAVIGATION */}

            <nav className="sidebar-nav">

                {/* DASHBOARD */}

                <NavLink
                    to="/rainfall-dashboard"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <FaTachometerAlt size={19} />

                    <span>
                        Dashboard
                    </span>
                </NavLink>


                {/* DISTRICT ANALYSIS */}

                <NavLink
                    to="/rainfall-dashboard/district-analysis"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <FaMapMarkedAlt size={19} />

                    <span>
                        District Analysis
                    </span>
                </NavLink>


                {/* MANDAL ANALYSIS */}

                <NavLink
                    to="/rainfall-dashboard/mandal-analysis"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <FaChartBar size={19} />

                    <span>
                        Mandal Analysis
                    </span>
                </NavLink>


                {/* RAINFALL TRENDS */}

                <NavLink
                    to="/rainfall-dashboard/rainfall-trends"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <FaCloudRain size={19} />

                    <span>
                        Rainfall Trends
                    </span>
                </NavLink>


                {/* HUMIDITY ANALYSIS */}

                <NavLink
                    to="/rainfall-dashboard/humidity-analysis"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <FaTint size={19} />

                    <span>
                        Humidity Analysis
                    </span>
                </NavLink>

                {/* YEAR COMPARISON */}

                <NavLink
                    to="/rainfall-dashboard/year-comparison"
                    className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}`
                    }
                >
                    <FaExchangeAlt size={19} />

                    <span>
                        Year Comparison
                    </span>
                </NavLink>

            </nav>


            {/* SIDEBAR FOOTER */}

            <div className="sidebar-footer">

                <div>

                    <span>
                        DATA YEAR
                    </span>

                    <strong>
                        {selectedYear || "—"}
                    </strong>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;
