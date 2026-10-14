import React from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DashboardHeader from "../components/DashboardHeader";
import FilterBar from "../components/FilterBar";
import PageNavigation from "../components/PageNavigation";

import AnalyticsKPIs from "../components/AnalyticsKPIs";
import DistrictRanking from "../components/DistrictRanking";
import FacilityLeaderboard from "../components/FacilityLeaderboard";
import MonthlyComparison from "../components/MonthlyComparison";
import SmartInsights from "../components/SmartInsights";
import PatientTable from "../components/PatientTable";
import DistrictAverageAge from "../components/DistrictAverageAge";

import "../styles/dashboard.css";
import "../styles/analytics.css";

const Analytics = () => {
    return (
        <>
            <Navbar />
            <Sidebar />

            <main className="dashboard">

                {/* Back Navigation */}
                <PageNavigation />

                <DashboardHeader
                    title="Health Analytics Dashboard"
                    subtitle="Advanced Health Insights & Statistical Analysis"
                />

                <FilterBar />

                {/* KPI Cards */}
                <AnalyticsKPIs />

                {/* District Ranking & Average Age */}
                <div className="analytics-grid">

                    <div className="analytics-card">

                        <h3 className="section-title">
                            District Ranking
                        </h3>

                        <DistrictRanking />

                    </div>

                    <div className="analytics-card">

                        <h3 className="section-title">
                            District-wise Average Age
                        </h3>

                        <DistrictAverageAge />

                    </div>

                </div>

                {/* Facility Leaderboard & Monthly Comparison */}
                <div className="analytics-grid">

                    <div className="analytics-card">

                        <h3 className="section-title">
                            Facility Leaderboard
                        </h3>

                        <FacilityLeaderboard />

                    </div>

                    <div className="analytics-card">

                        <h3 className="section-title">
                            Monthly Comparison
                        </h3>

                        <MonthlyComparison />

                    </div>

                </div>

                {/* Smart Insights */}
                <div className="analytics-card">

                    <h3 className="section-title">
                        Smart Insights
                    </h3>

                    <SmartInsights />

                </div>

                {/* Patient Records */}
                <div className="analytics-card">

                    <h3 className="section-title">
                        Patient Records
                    </h3>

                    <PatientTable />

                </div>

            </main>
        </>
    );
};

export default Analytics;