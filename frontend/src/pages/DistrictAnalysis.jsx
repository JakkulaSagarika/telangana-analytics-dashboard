import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import DashboardHeader from "../components/DashboardHeader";
import FilterBar from "../components/FilterBar";
import KPICard from "../components/KPICard";
import LineChart from "../components/charts/LineChart";
import PieChart from "../components/charts/PieChart";
import DoughnutChart from "../components/charts/DoughnutChart";
import BarChart from "../components/charts/BarChart";
import PageNavigation from "../components/PageNavigation";

import "../styles/district-analysis.css";

const API = import.meta.env.VITE_API_BASE_URL || "/api/health";

export default function DistrictAnalysis() {

    const { district } = useParams();

    const selectedDistrict = district
        ? decodeURIComponent(district)
        : "All";

    const [filters, setFilters] = useState({
        district: selectedDistrict,
        month: "All",
        gender: "All",
    });

    const [summary, setSummary] = useState({
        total_patients: 0,
        male: 0,
        female: 0,
        average_age: 0,
        facilities: 0,
    });

    const [records, setRecords] = useState([]);
    const [monthlyTopFacilities, setMonthlyTopFacilities] = useState([]);

    useEffect(() => {
        loadSummary();
        loadRecords();
        loadMonthlyTopFacilities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const loadSummary = async () => {
        try {
            const res = await axios.get(`${API}/district-summary/`, {
                params: filters,
            });

            setSummary(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const loadRecords = async () => {
        try {
            const res = await axios.get(`${API}/records/`, {
                params: filters,
            });

            setRecords(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const loadMonthlyTopFacilities = async () => {
        try {
            const res = await axios.get(`${API}/charts/monthly-top-facilities/`, {
                params: filters,
            });

            setMonthlyTopFacilities(res.data || []);
        } catch (err) {
            console.log(err);
        }
    };

    const formatMonth = (month) => {
        if (!month) return "-";
        return month.replace(/_/g, " / ");
    };

    return (

        <div className="container-fluid p-4 district-page">

            {/* Back / Forward Navigation */}
            <PageNavigation />

            <DashboardHeader
                title={
                    filters.district === "All"
                        ? "District Analysis"
                        : `${filters.district} District Report`
                }
                subtitle="Peripheral Smear Clinical Analytics"
            />

            <FilterBar
    filters={filters}
    defaultDistrict={filters.district}
    hideDistrictFilter={false}
    onFilterChange={(value) => setFilters(value)}
/>

            {/* KPI Cards */}

            <div className="row mt-4 g-4">

                <div className="col-lg-3 col-md-6">
                    <KPICard
                        title="Total Patients"
                        value={summary.total_patients}
                        color="#4F46E5"
                    />
                </div>

                <div className="col-lg-3 col-md-6">
                    <KPICard
                        title="Male"
                        value={summary.male}
                        color="#2563EB"
                    />
                </div>

                <div className="col-lg-3 col-md-6">
                    <KPICard
                        title="Female"
                        value={summary.female}
                        color="#EC4899"
                    />
                </div>

                <div className="col-lg-3 col-md-6">
                    <KPICard
                        title="Average Age"
                        value={summary.average_age}
                        color="#14B8A6"
                    />
                </div>

                <div className="col-lg-3 col-md-6">
                    <KPICard
                        title="Facilities"
                        value={summary.facilities}
                        color="#10B981"
                    />
                </div>

            </div>

            {/* Charts */}

            <div className="row mt-4">

                <div className="col-lg-8">

                    <div className="district-card p-3 h-100">

                        <h5 className="fw-bold mb-3">
                            Monthly Trend
                        </h5>

                        <LineChart filters={filters} />

                    </div>

                </div>

                <div className="col-lg-4">

                    <div className="district-card p-3 h-100">

                        <h5 className="fw-bold mb-3">
                            Gender Distribution
                        </h5>

                        <PieChart filters={filters} />

                    </div>

                </div>

            </div>

            <div className="row mt-4">

                <div className="col-lg-6">

                    <div className="district-card p-3 h-100">

                        <h5 className="fw-bold mb-3">
                            Age Distribution
                        </h5>

                        <DoughnutChart filters={filters} />

                    </div>

                </div>

                <div className="col-lg-6">

                    <div className="district-card p-3 h-100">

                        <h5 className="fw-bold mb-3">
                            District Statistics
                        </h5>

                        <BarChart filters={filters} />

                    </div>

                </div>

            </div>

            <div className="row mt-4">

                <div className="col-12">

                    <div className="district-card p-3 h-100">

                        <h5 className="fw-bold mb-3">
                            Top Facility by Month
                        </h5>

                        {monthlyTopFacilities.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-sm mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Month</th>
                                            <th>Facility</th>
                                            <th>Patients</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyTopFacilities.map((item) => (
                                            <tr key={`${item.month}-${item.facility_name}`}>
                                                <td>{formatMonth(item.month)}</td>
                                                <td>{item.facility_name}</td>
                                                <td>{item.patients}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-muted">
                                No monthly top facility data available for the selected filters.
                            </div>
                        )}

                    </div>

                </div>

            </div>

            {/* Patient Records */}

            <div className="district-card p-4 mt-4">

                <h4 className="fw-bold mb-3">
                    Patient Records
                </h4>

                <div className="table-responsive">

                    <table className="table table-hover table-bordered align-middle">

                        <thead className="table-light">

                            <tr>
                                <th>Patient ID</th>
                                <th>Facility</th>
                                <th>Gender</th>
                                <th>Age</th>
                                <th>Month</th>
                            </tr>

                        </thead>

                        <tbody>

                            {records.length > 0 ? (

                                records.map((record) => (

                                    <tr key={record.unique_id}>

                                        <td>{record.unique_id}</td>
                                        <td>{record.facility_name}</td>
                                        <td>{record.gender}</td>
                                        <td>{record.age}</td>
                                        <td>{record.month}</td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="text-center py-4"
                                    >
                                        No records found.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );

}
