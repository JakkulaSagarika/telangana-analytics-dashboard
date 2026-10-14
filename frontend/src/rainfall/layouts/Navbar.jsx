import {
    FaArrowLeft,
    FaArrowRight,
    FaBell,
    FaCalendarAlt,
} from "react-icons/fa";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useRainfall } from "../context/RainfallContext";

import "../styles/navbar.css";


const navRoutes = [
    { path: "/rainfall-dashboard", label: "Dashboard" },
    { path: "/rainfall-dashboard/district-analysis", label: "District Analysis" },
    { path: "/rainfall-dashboard/mandal-analysis", label: "Mandal Analysis" },
    { path: "/rainfall-dashboard/rainfall-trends", label: "Rainfall Trends" },
    { path: "/rainfall-dashboard/humidity-analysis", label: "Humidity Analysis" },
];


function Navbar() {

    const location = useLocation();
    const navigate = useNavigate();

    const {
        selectedYear,
        setSelectedYear,
        availableYears,
        loadingYears,
    } = useRainfall();


    const currentIndex = navRoutes.findIndex(
        route => route.path === location.pathname
    );

    const currentRoute =
        currentIndex >= 0
            ? navRoutes[currentIndex]
            : navRoutes[0];

    const isDashboard =
        currentRoute.path === "/rainfall-dashboard";

    const previousRoute =
        currentIndex > 0
            ? navRoutes[currentIndex - 1]
            : null;

    const nextRoute =
        currentIndex >= 0 &&
        currentIndex < navRoutes.length - 1
            ? navRoutes[currentIndex + 1]
            : null;


    const goPrevious = () => {

        if (previousRoute) {
            navigate(previousRoute.path);
        }

    };

    const goHome = () => {
        navigate("/");
    };


    const goNext = () => {

        if (nextRoute) {
            navigate(nextRoute.path);
        }

    };


    const handleYearChange = (event) => {

        setSelectedYear(
            Number(event.target.value)
        );

    };


    return (

        <header className="navbar">

            {/* ==================================================
                LEFT
            ================================================== */}

            <div className="navbar-left">

                <div className="page-nav-buttons">

                    <button
                        className={`nav-arrow ${
                            isDashboard ? "static" : ""
                        }`}
                        type="button"
                        onClick={
                            isDashboard
                                ? goHome
                                : goPrevious
                        }
                        disabled={false}
                        aria-label={
                            isDashboard
                                ? "Back to landing page"
                                : "Previous page"
                        }
                    >
                        <FaArrowLeft size={18} />
                    </button>


                    {!isDashboard && (

                        <button
                            className={`nav-arrow ${
                                nextRoute
                                    ? ""
                                    : "disabled"
                            }`}
                            type="button"
                            onClick={
                                nextRoute
                                    ? goNext
                                    : undefined
                            }
                            disabled={!nextRoute}
                            aria-label="Next page"
                        >
                            <FaArrowRight size={18} />
                        </button>

                    )}

                </div>


                <div>

                    <p className="navbar-eyebrow">
                        TELANGANA STATE
                    </p>

                    <h1>
                        Rainfall Dashboard
                    </h1>

                </div>

            </div>


            {/* ==================================================
                RIGHT
            ================================================== */}

            <div className="navbar-right">

                {/* YEAR SELECTOR */}

                <div className="year-selector">

                    <FaCalendarAlt size={18} />

                    <select
                        value={selectedYear || ""}
                        onChange={handleYearChange}
                        disabled={loadingYears || !availableYears.length}
                        aria-label="Select year"
                    >

                        {!selectedYear && (
                            <option value="">Loading years...</option>
                        )}

                        {availableYears.map(year => (

                            <option
                                key={year}
                                value={year}
                            >
                                {year}
                            </option>

                        ))}

                    </select>

                </div>


                {/* NOTIFICATION */}

                <button
                    className="icon-button"
                    type="button"
                >
                    <FaBell size={19} />
                </button>

            </div>

        </header>

    );

}


export default Navbar;
