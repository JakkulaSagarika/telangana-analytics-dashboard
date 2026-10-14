import { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaVenusMars } from "react-icons/fa";

import api from "../services/api";

import "../styles/analyticsFilters.css";

function AnalyticsFilters({ filters, setFilters }) {

    const [districts, setDistricts] = useState([]);
    const [months, setMonths] = useState([]);

    useEffect(() => {

        api.get("filter-options/")
            .then((response) => {

                setDistricts(response.data.districts || []);
                setMonths(response.data.months || []);

            })
            .catch((error) => {

                console.error("Filter API Error:", error);

            });

    }, []);

    return (

        <div className="filters-container">

            {/* District */}

            <div className="filter-box">

                <label>

                    <FaMapMarkerAlt className="filter-icon" />

                    District

                </label>

                <select
                    value={filters.district}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            district: e.target.value
                        })
                    }
                >

                    <option value="">All Districts</option>

                    {districts.map((district, index) => (

                        <option
                            key={index}
                            value={district}
                        >
                            {district}
                        </option>

                    ))}

                </select>

            </div>

            {/* Month */}

            <div className="filter-box">

                <label>

                    <FaCalendarAlt className="filter-icon" />

                    Month

                </label>

                <select
                    value={filters.month}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            month: e.target.value
                        })
                    }
                >

                    <option value="">All Months</option>

                    {months.map((month, index) => (

                        <option
                            key={index}
                            value={month}
                        >
                            {month}
                        </option>

                    ))}

                </select>

            </div>

            {/* Gender */}

            <div className="filter-box">

                <label>

                    <FaVenusMars className="filter-icon" />

                    Gender

                </label>

                <select
                    value={filters.gender}
                    onChange={(e) =>
                        setFilters({
                            ...filters,
                            gender: e.target.value
                        })
                    }
                >

                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>

                </select>

            </div>

        </div>

    );

}

export default AnalyticsFilters;