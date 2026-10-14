import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../services/api";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import FilterBar from "../components/FilterBar";
import SectionTitle from "../components/SectionTitle";
import KPICard from "../components/KPICard";
import ChartCard from "../components/ChartCard";

import LineChart from "../components/Charts/LineChart";
import CombinedDistribution from "../components/Charts/CombinedDistribution";
import TopPerformingDistricts from "../components/TopPerformingDistricts";
import BloodCellReferenceCard from "../components/BloodCellReferenceCard";

import TelanganaMap from "../components/TelanganaMap";

import "../styles/dashboard.css";

function HealthDashboard() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    district: "",
    month: "",
    gender: "",
    search: "",
  });

  const [summary, setSummary] = useState({
    total_records: 0,
    male: 0,
    female: 0,
    average_age: 0,
  });
  const [monthlyTopFacilities, setMonthlyTopFacilities] = useState([]);
  const [topFacilitiesLoading, setTopFacilitiesLoading] = useState(true);

  const loadDashboard = async (filterValues) => {

    try {

      const response = await API.get("filter-data/", {
        params: filterValues,
      });

      setSummary(response.data.summary);

    } catch (error) {

      console.log(error);

    }

  };

  useEffect(() => {

    loadDashboard(filters);
    loadMonthlyTopFacilities(filters);

  }, []);

  const loadMonthlyTopFacilities = async (filterValues) => {
    setTopFacilitiesLoading(true);

    try {
      const response = await API.get("charts/monthly-top-facilities/", {
        params: filterValues,
      });

      setMonthlyTopFacilities(response.data || []);
    } catch (error) {
      console.log(error);
      setMonthlyTopFacilities([]);
    } finally {
      setTopFacilitiesLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {

    setFilters(newFilters);

    loadDashboard(newFilters);
    loadMonthlyTopFacilities(newFilters);

  };

  // ===========================
  // KPI Gender Filter
  // ===========================

  const handleGenderFilter = (gender) => {

    const updatedFilters = {

      ...filters,

      gender,

    };

    setFilters(updatedFilters);

    loadDashboard(updatedFilters);
    loadMonthlyTopFacilities(updatedFilters);

  };

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="dashboard">

        <div className="dashboard-top-actions">
          <button
            className="home-btn"
            onClick={() => navigate("/")}
          >
            Back to Landing Page
          </button>
        </div>

        <FilterBar
        filters={filters}
          onFilterChange={handleFilterChange}
        />

        <SectionTitle title="Key Performance Indicators" />

        <div className="kpi-grid">

          <KPICard
            title="Total Tests"
            value={summary.total_records}
            color="#FF9F68"
          />

          <KPICard
            title="Male Patients"
            value={summary.male}
            color="#5BC0EB"
            onClick={() => handleGenderFilter("M")}
          />

          <KPICard
            title="Female Patients"
            value={summary.female}
            color="#FF5D8F"
            onClick={() => handleGenderFilter("F")}
          />

          <KPICard
            title="Average Age"
            value={`${summary.average_age} Years`}
            color="#8B5CF6"
          />

        </div>

        <SectionTitle title="Health Analytics" />

        <div className="chart-grid">

          <ChartCard title="Telangana Health Map">

            <TelanganaMap
              filters={filters}
              onDistrictSelect={(district) => {

                const updated = {

                  ...filters,

                  district,

                };

                setFilters(updated);

                loadDashboard(updated);

              }}
            />

          </ChartCard>

          <ChartCard title="Monthly Tests">
            <LineChart filters={filters} />
          </ChartCard>

          <ChartCard title="Age & Gender Distribution">
            <CombinedDistribution filters={filters} />
          </ChartCard>

          <ChartCard title="Top Facility by Month">
            {topFacilitiesLoading ? (
              <p>Loading...</p>
            ) : monthlyTopFacilities.length > 0 ? (
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
                        <td>{item.month.replace(/_/g, " / ")}</td>
                        <td>{item.facility_name}</td>
                        <td>{item.patients}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div>No data available for selected filters.</div>
            )}
          </ChartCard>

          <ChartCard title="Top Performing Districts & Leading Facilities">
            <TopPerformingDistricts filters={filters} />
          </ChartCard>

          <BloodCellReferenceCard />

        </div>

      </main>
    </>
  );
}

export default HealthDashboard;