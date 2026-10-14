import { useEffect, useMemo, useState } from "react";
import { FaSkull, FaMapMarkedAlt } from "react-icons/fa";

import KPICard from "../components/KPICard";
import DeathChart from "../components/DeathChart";
import GenderPieChart from "../components/GenderPieChart";
import TopBottomDeathChart from "../components/TopBottomDeathChart";
import BirthDeathNav from "../components/BirthDeathNav";

import { getDistrictTable } from "../services/dashboardService";

import "../styles/deathStatistics.css";

function DeathStatistics() {

    const [deathData, setDeathData] = useState([]);

    useEffect(() => {
        fetchDeathData();
    }, []);

    const fetchDeathData = async () => {

        try {

            const response = await getDistrictTable();

            setDeathData(response);

        } catch (error) {

            console.error("Failed to load death data:", error);

        }

    };

    const stats = useMemo(() => {

        const totalDeaths = deathData.reduce(
            (sum, item) => sum + Number(item.deaths || 0),
            0
        );

        const totalMale = deathData.reduce(
            (sum, item) => sum + Number(item.death_male || 0),
            0
        );

        const totalFemale = deathData.reduce(
            (sum, item) => sum + Number(item.death_female || 0),
            0
        );

        const totalOthers = deathData.reduce((sum, item) => {

            const others =
                Number(item.deaths || 0) -
                Number(item.death_male || 0) -
                Number(item.death_female || 0);

            return sum + Math.max(others, 0);

        }, 0);

        return {

            totalDeaths,
            totalMale,
            totalFemale,
            totalOthers,

        };

    }, [deathData]);

    return (

        <div className="death-dashboard">

            <div className="death-background">

                <div className="blob blob1"></div>
                <div className="blob blob2"></div>
                <div className="blob blob3"></div>

            </div>

            <div className="death-content">

                <BirthDeathNav />

                {/* Header */}

                <div className="death-header">

                    <div className="header-left">

                        <div className="header-icon">

                            <FaSkull />

                        </div>

                        <div>

                            <h1>Death Dashboard</h1>

                            <p>
                                Telangana Death Registration Analytics
                            </p>

                        </div>

                    </div>

                    <div className="summary-card">

                        <FaMapMarkedAlt className="summary-icon" />

                        <div>

                            <h3>{deathData.length}</h3>

                            <span>Districts Covered</span>

                        </div>

                    </div>

                </div>
                                {/* =====================================
                    KPI Cards
                ====================================== */}

                <div className="row g-4 mb-5">

                    <div className="col-xl-3 col-md-6">

                        <KPICard
                            title="Total Deaths"
                            value={stats.totalDeaths.toLocaleString()}
                        />

                    </div>

                    <div className="col-xl-3 col-md-6">

                        <KPICard
                            title="Male Deaths"
                            value={stats.totalMale.toLocaleString()}
                        />

                    </div>

                    <div className="col-xl-3 col-md-6">

                        <KPICard
                            title="Female Deaths"
                            value={stats.totalFemale.toLocaleString()}
                        />

                    </div>

                    <div className="col-xl-3 col-md-6">

                        <KPICard
                            title="Other Deaths"
                            value={stats.totalOthers.toLocaleString()}
                        />

                    </div>

                </div>
                                {/* =====================================
                    Charts Section
                ====================================== */}

                <div className="row g-4 mb-5">

                    {/* Death Distribution */}

                    <div className="col-lg-8">

                        <div className="glass-chart-card">

                            <div className="glass-chart-header">

                                <div>

                                    <h3>Death Distribution by District</h3>

                                    <p>
                                        Total registered deaths across Telangana districts
                                    </p>

                                </div>

                            </div>

                            <DeathChart
                                data={deathData}
                            />

                        </div>

                    </div>

                    {/* Gender Distribution */}

                    <div className="col-lg-4">

                        <div className="glass-chart-card">

                            <div className="glass-chart-header">

                                <div>

                                    <h3>Gender Distribution</h3>

                                    <p>
                                        Male • Female • Others
                                    </p>

                                </div>

                            </div>

                            <GenderPieChart
                                data={deathData}
                                type="death"
                            />

                        </div>

                    </div>

                </div>

                {/* =====================================
                    Top & Bottom Analysis
                ====================================== */}

                <div className="analysis-section">

                    <TopBottomDeathChart
                        districts={deathData}
                    />

                </div>
                                {/* =====================================
                    District-wise Table
                ====================================== */}

                <div className="glass-table-card">

                    <div className="glass-table-header">

                        <div>

                            <h3>District-wise Death Statistics</h3>

                            <p>
                                Showing {deathData.length} Telangana districts
                            </p>

                        </div>

                    </div>

                    <div className="table-responsive">

                        <table className="table death-table align-middle mb-0">

                            <thead>

                                <tr>

                                    <th>#</th>

                                    <th>District</th>

                                    <th>Total Deaths</th>

                                    <th>Male</th>

                                    <th>Female</th>

                                    <th>Others</th>

                                </tr>

                            </thead>

                            <tbody>

                                {deathData.length ? (

                                    deathData.map((item, index) => {

                                        const others = Math.max(
                                            Number(item.deaths || 0) -
                                            Number(item.death_male || 0) -
                                            Number(item.death_female || 0),
                                            0
                                        );

                                        return (

                                            <tr key={item.id || index}>

                                                <td>

                                                    <span className="table-rank">

                                                        {index + 1}

                                                    </span>

                                                </td>

                                                <td className="district-name">

                                                    {item.district}

                                                </td>

                                                <td>

                                                    <span className="birth-pill total-pill">

                                                        {Number(item.deaths || 0).toLocaleString()}

                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="birth-pill male-pill">

                                                        {Number(item.death_male || 0).toLocaleString()}

                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="birth-pill female-pill">

                                                        {Number(item.death_female || 0).toLocaleString()}

                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="birth-pill other-pill">

                                                        {others.toLocaleString()}

                                                    </span>

                                                </td>

                                            </tr>

                                        );

                                    })

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center py-5"
                                        >

                                            No death statistics available.

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default DeathStatistics;