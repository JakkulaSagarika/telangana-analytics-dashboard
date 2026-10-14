import { useEffect, useMemo, useState } from "react";
import { FaBaby, FaMapMarkedAlt } from "react-icons/fa";

import KPICard from "../components/KPICard";
import BirthBarChart from "../components/BirthBarChart";
import GenderPieChart from "../components/GenderPieChart";
import TopBottomBirthChart from "../components/TopBottomBirthChart";
import BirthDeathNav from "../components/BirthDeathNav";

import { getDistrictTable } from "../services/dashboardService";

import "../styles/birthStatistics.css";

function BirthStatistics() {
    const [birthData, setBirthData] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getDistrictTable();
            setBirthData(data);
        } catch (error) {
            console.log(error);
        }
    };

    const stats = useMemo(() => {

        const totalBirths = birthData.reduce(
            (sum, item) => sum + Number(item.births || 0),
            0
        );

        const totalMale = birthData.reduce(
            (sum, item) => sum + Number(item.birth_male || 0),
            0
        );

        const totalFemale = birthData.reduce(
            (sum, item) => sum + Number(item.birth_female || 0),
            0
        );

        const totalOthers = birthData.reduce(
            (sum, item) => sum + Number(item.birth_others || 0),
            0
        );

        return {
            totalBirths,
            totalMale,
            totalFemale,
            totalOthers,
        };

    }, [birthData]);

    return (

        <div className="birth-dashboard">

            <div className="birth-background">

                <div className="blob blob1"></div>

                <div className="blob blob2"></div>

                <div className="blob blob3"></div>

            </div>

            <div className="birth-content">

                <BirthDeathNav />

                {/* Header */}

                <div className="birth-header">

                    <div className="header-left">

                        <div className="header-icon">

                            <FaBaby />

                        </div>

                        <div>

                            <h1>Birth Dashboard</h1>

                            <p>
                                Telangana Birth Registration Analytics
                            </p>

                        </div>

                    </div>

                    <div className="summary-card">

                        <FaMapMarkedAlt className="summary-icon" />

                        <div>

                            <h3>{birthData.length}</h3>

                            <span>Districts Covered</span>

                        </div>

                    </div>

                </div>
                                {/* ==========================
                    KPI Cards
                ========================== */}

                <div className="row g-4 mb-5">

                    <div className="col-xl-3 col-md-6">

                        <KPICard
                            title="Total Births"
                            value={stats.totalBirths.toLocaleString()}
                        />

                    </div>

                    <div className="col-xl-3 col-md-6">

                        <KPICard
                            title="Male Births"
                            value={stats.totalMale.toLocaleString()}
                        />

                    </div>

                    <div className="col-xl-3 col-md-6">

                        <KPICard
                            title="Female Births"
                            value={stats.totalFemale.toLocaleString()}
                        />

                    </div>

                    <div className="col-xl-3 col-md-6">

                        <KPICard
                            title="Other Births"
                            value={stats.totalOthers.toLocaleString()}
                        />

                    </div>

                </div>
                                {/* ==========================
                    Charts
                ========================== */}

                <div className="row g-4 mb-5">

                    <div className="col-lg-8">

                        <div className="glass-chart-card">

                            <div className="glass-chart-header">

                                <div>

                                    <h3>Birth Distribution by District</h3>

                                    <p>
                                        Total registered births across Telangana districts
                                    </p>

                                </div>

                            </div>

                            <BirthBarChart data={birthData} />

                        </div>

                    </div>

                    <div className="col-lg-4">

                        <div className="glass-chart-card">

                            <div className="glass-chart-header">

                                <div>

                                    <h3>Gender Distribution</h3>

                                    <p>
                                        Male • Female • Other Births
                                    </p>

                                </div>

                            </div>

                            <GenderPieChart data={birthData} />

                        </div>

                    </div>

                </div>

                {/* ==========================
                    Top & Bottom Analysis
                ========================== */}

                <div className="mb-5">

                    <TopBottomBirthChart
                        districts={birthData}
                    />

                </div>
                                {/* ==========================
                    District Table
                ========================== */}

                <div className="glass-table-card">

                    <div className="glass-table-header">

                        <div>

                            <h3>District-wise Birth Statistics</h3>

                            <p>
                                Showing {birthData.length} Telangana districts
                            </p>

                        </div>

                    </div>

                    <div className="table-responsive">

                        <table className="table death-table align-middle mb-0">

                            <thead>

                                <tr>

                                    <th>#</th>

                                    <th>District</th>

                                    <th>Total Births</th>

                                    <th>Male</th>

                                    <th>Female</th>

                                    <th>Others</th>

                                </tr>

                            </thead>

                            <tbody>

                                {birthData.length ? (

                                    birthData.map((item, index) => (

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

                                                    {Number(item.births).toLocaleString()}

                                                </span>

                                            </td>

                                            <td>

                                                <span className="birth-pill male-pill">

                                                    {Number(item.birth_male).toLocaleString()}

                                                </span>

                                            </td>

                                            <td>

                                                <span className="birth-pill female-pill">

                                                    {Number(item.birth_female).toLocaleString()}

                                                </span>

                                            </td>

                                            <td>

                                                <span className="birth-pill other-pill">

                                                    {Number(item.birth_others).toLocaleString()}

                                                </span>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center py-5"
                                        >

                                            No birth statistics available.

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

export default BirthStatistics;