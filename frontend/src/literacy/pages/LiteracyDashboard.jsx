import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "../styles/LiteracyDashboard.css";
import literacyBg from "../../assets/images/Literacy bg.jpeg";

import LiteracyMap from "../components/LiteracyMap";
import { Link } from "react-router-dom";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function LiteracyDashboard() {
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // =========================================================
  // EXISTING DASHBOARD STATE
  // =========================================================

  const [stats, setStats] = useState({
    averageLiteracy: 0,
    averageMale: 0,
    averageFemale: 0,
    districts: 0,
    data: [],
  });

  // =========================================================
  // DISTRICT VS DISTRICT COMPARISON STATE
  // =========================================================

  const [comparisonDistrict1, setComparisonDistrict1] = useState("");
  const [comparisonDistrict2, setComparisonDistrict2] = useState("");

  // =========================================================
  // MALE VS FEMALE COMPARISON STATE
  // =========================================================

  const [genderDistricts, setGenderDistricts] = useState([]);

  // =========================================================
  // TABLE SORT STATE
  // =========================================================

  const [sortBy, setSortBy] = useState("overall");

  // =========================================================
  // LOAD CSV DATA
  // =========================================================

  useEffect(() => {
    Papa.parse("/literacy.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        const rows = results.data.filter(
          (row) =>
            row.Districts &&
            row.Districts.trim() !== ""
        );

        if (rows.length === 0) {
          return;
        }

        const maleAvg =
          rows.reduce(
            (sum, row) =>
              sum +
              parseFloat(
                row["Literacy Rate Males"] || 0
              ),
            0
          ) / rows.length;

        const femaleAvg =
          rows.reduce(
            (sum, row) =>
              sum +
              parseFloat(
                row["Literacy Rate Females"] || 0
              ),
            0
          ) / rows.length;

        const overallAvg =
          (maleAvg + femaleAvg) / 2;

        setStats({
          averageLiteracy: overallAvg.toFixed(2),
          averageMale: maleAvg.toFixed(2),
          averageFemale: femaleAvg.toFixed(2),
          districts: rows.length,
          data: rows,
        });
      },

      error: (error) => {
        console.error(
          "Error loading literacy.csv:",
          error
        );
      },
    });
  }, []);

  // =========================================================
  // EXISTING CHART DATA
  // =========================================================

  const chartData = stats.data.map((row) => ({
    district: row.Districts,

    male: Number(
      row["Literacy Rate Males"]
    ),

    female: Number(
      row["Literacy Rate Females"]
    ),

    overall: Number(
      (
        (
          parseFloat(
            row["Literacy Rate Males"]
          ) +
          parseFloat(
            row["Literacy Rate Females"]
          )
        ) / 2
      ).toFixed(2)
    ),
  }));

  // =========================================================
  // TOP 5 DISTRICTS
  // =========================================================

  const topDistricts = [...chartData]
    .sort(
      (a, b) =>
        b.overall - a.overall
    )
    .slice(0, 5);

  // =========================================================
  // BOTTOM 5 DISTRICTS
  // =========================================================

  const bottomDistricts = [...chartData]
    .sort(
      (a, b) =>
        a.overall - b.overall
    )
    .slice(0, 5);

  // =========================================================
  // PIE COLORS
  // =========================================================

  const COLORS = [
    "#0F766E",
    "#14B8A6",
  ];

  // =========================================================
  // SELECTED DISTRICT
  // =========================================================

  const selectedData =
    selectedDistrict
      ? stats.data.find(
          (d) =>
            d.Districts
              .trim()
              .toLowerCase() ===
            selectedDistrict
              .trim()
              .toLowerCase()
        )
      : null;

  const currentMale = selectedData
    ? Number(
        selectedData[
          "Literacy Rate Males"
        ]
      )
    : Number(stats.averageMale);

  const currentFemale = selectedData
    ? Number(
        selectedData[
          "Literacy Rate Females"
        ]
      )
    : Number(stats.averageFemale);

  const currentOverall = (
    (currentMale + currentFemale) / 2
  ).toFixed(2);

  // =========================================================
  // PIE DATA
  // =========================================================

  const pieData = [
    {
      name: "Male",
      value: currentMale,
    },
    {
      name: "Female",
      value: currentFemale,
    },
  ];

  // =========================================================
  // DISTRICT VS DISTRICT COMPARISON
  // OVERALL ONLY
  // =========================================================

  const district1Data =
    stats.data.find(
      (row) =>
        row.Districts ===
        comparisonDistrict1
    );

  const district2Data =
    stats.data.find(
      (row) =>
        row.Districts ===
        comparisonDistrict2
    );

  const district1Overall =
    district1Data
      ? (
          (
            Number(
              district1Data[
                "Literacy Rate Males"
              ]
            ) +
            Number(
              district1Data[
                "Literacy Rate Females"
              ]
            )
          ) / 2
        ).toFixed(2)
      : null;

  const district2Overall =
    district2Data
      ? (
          (
            Number(
              district2Data[
                "Literacy Rate Males"
              ]
            ) +
            Number(
              district2Data[
                "Literacy Rate Females"
              ]
            )
          ) / 2
        ).toFixed(2)
      : null;

  const districtComparisonData =
    district1Data && district2Data
      ? [
          {
            district:
              comparisonDistrict1,
            overall:
              Number(district1Overall),
          },
          {
            district:
              comparisonDistrict2,
            overall:
              Number(district2Overall),
          },
        ]
      : [];

  // =========================================================
  // MALE VS FEMALE COMPARISON
  // =========================================================

  const genderComparisonData =
    genderDistricts
      .map((district) => {
        const row =
          stats.data.find(
            (item) =>
              item.Districts ===
              district
          );

        if (!row) {
          return null;
        }

        return {
          district:
            district,

          male: Number(
            row["Literacy Rate Males"]
          ),

          female: Number(
            row["Literacy Rate Females"]
          ),
        };
      })
      .filter(Boolean);

  // =========================================================
  // SELECT / UNSELECT GENDER DISTRICT
  // =========================================================

  const handleGenderDistrictChange = (
    district,
    checked
  ) => {
    if (checked) {
      setGenderDistricts(
        (previous) => [
          ...previous,
          district,
        ]
      );
    } else {
      setGenderDistricts(
        (previous) =>
          previous.filter(
            (item) =>
              item !== district
          )
      );
    }
  };

  // =========================================================
  // SELECT ALL GENDER DISTRICTS
  // =========================================================

  const selectAllGenderDistricts = () => {
    setGenderDistricts(
      stats.data.map(
        (row) => row.Districts
      )
    );
  };

  // =========================================================
  // CLEAR GENDER DISTRICTS
  // =========================================================

  const clearGenderDistricts = () => {
    setGenderDistricts([]);
  };

  // =========================================================
  // SORTED DISTRICT TABLE DATA
  // =========================================================

  const sortedTableData = [...stats.data]
    .map((row) => {
      const male = Number(
        row["Literacy Rate Males"]
      );

      const female = Number(
        row["Literacy Rate Females"]
      );

      const overall =
        (male + female) / 2;

      return {
        ...row,
        male,
        female,
        overall,
      };
    })
    .sort(
      (a, b) =>
        b[sortBy] - a[sortBy]
    );

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="literacy-dashboard"
        style={{
    backgroundImage: `url("${literacyBg}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  }}
    >

      {/* =====================================================
          BACK TO HOME
      ===================================================== */}

      <Link
        to="/"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          textDecoration: "none",
          color: "#2563eb",
          fontWeight: "600",
          fontSize: "16px",
        }}
      >
        ⬅ Back to Home
      </Link>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="lit-header">

        <h1>
          Literacy Dashboard
        </h1>

        <p>
          Telangana Education Analytics
        </p>

      </header>

      {/* =====================================================
          KPI SECTION
      ===================================================== */}

      <section className="kpi-section">

        <div className="kpi-card">

          <h2>
            {currentOverall}%
          </h2>

          <p>
            Average Literacy
          </p>

        </div>

        <div className="kpi-card">

          <h2>
            {currentMale.toFixed(2)}%
          </h2>

          <p>
            Male Literacy
          </p>

        </div>

        <div className="kpi-card">

          <h2>
            {currentFemale.toFixed(2)}%
          </h2>

          <p>
            Female Literacy
          </p>

        </div>

        <div className="kpi-card">

          <h2>
            {stats.districts}
          </h2>

          <p>
            Total Districts
          </p>

        </div>

      </section>

      {/* =====================================================
          SELECTED DISTRICT DETAILS
      ===================================================== */}

      {selectedDistrict &&
        selectedData && (

          <div className="selected-district">

            <h2>
              {selectedDistrict}
            </h2>

            <p>
              Overall Literacy :
              {" "}
              {(
                (
                  Number(
                    selectedData[
                      "Literacy Rate Males"
                    ]
                  ) +
                  Number(
                    selectedData[
                      "Literacy Rate Females"
                    ]
                  )
                ) / 2
              ).toFixed(2)}
              %
            </p>

            <p>
              Male :
              {" "}
              {
                selectedData[
                  "Literacy Rate Males"
                ]
              }%
            </p>

            <p>
              Female :
              {" "}
              {
                selectedData[
                  "Literacy Rate Females"
                ]
              }%
            </p>

          </div>
        )}

      {/* =====================================================
          SEARCH DISTRICT
      ===================================================== */}

      <div className="search-box">

        <input
          type="text"
          placeholder="Search District..."
          value={selectedDistrict}
          onChange={(e) =>
            setSelectedDistrict(
              e.target.value
            )
          }
        />

      </div>

      {/* =====================================================
          MAP
      ===================================================== */}

      <div className="map-container">

        <LiteracyMap
          selectedDistrict={
            selectedDistrict
          }
          setSelectedDistrict={
            setSelectedDistrict
          }
          literacyData={
            stats.data
          }
        />

      </div>

      {/* =====================================================
          EXISTING CHARTS — ROW 1
      ===================================================== */}

      <section className="charts-section">

        <div className="chart-card">

          <h2>
            District-wise Literacy Rate
          </h2>

          <ResponsiveContainer
            width="100%"
            height={380}
          >

            <BarChart
              data={chartData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="district"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={100}
              />

              <YAxis
                domain={[0, 100]}
              />

              <Tooltip />

              <Bar
                dataKey="overall"
                fill="#0F766E"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h2>
            Average Male vs Female Literacy
          </h2>

          <ResponsiveContainer
            width="100%"
            height={380}
          >

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >

                {pieData.map(
                  (entry, index) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[index]
                      }
                    />

                  )
                )}

              </Pie>

              <Legend />

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </section>

      {/* =====================================================
          EXISTING TOP / BOTTOM
      ===================================================== */}

      <section className="charts-section">

        <div className="chart-card">

          <h2>
            Top 5 Districts
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              layout="vertical"
              data={topDistricts}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                type="number"
                domain={[0, 100]}
              />

              <YAxis
                type="category"
                dataKey="district"
                width={120}
              />

              <Tooltip />

              <Bar
                dataKey="overall"
                fill="#14B8A6"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h2>
            Bottom 5 Districts
          </h2>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              layout="vertical"
              data={bottomDistricts}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                type="number"
                domain={[0, 100]}
              />

              <YAxis
                type="category"
                dataKey="district"
                width={120}
              />

              <Tooltip />

              <Bar
                dataKey="overall"
                fill="#EF4444"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </section>

      {/* =====================================================
          NEW COMPARISON SECTION
      ===================================================== */}

      <section className="comparison-section">

        {/* ===================================================
            1. DISTRICT VS DISTRICT
            OVERALL ONLY
        =================================================== */}

        <div className="chart-card comparison-card">

          <h2>
            District vs District Comparison
          </h2>

          <p className="comparison-description">
            Select two districts to compare
            their overall literacy rates.
          </p>

          <div className="comparison-selectors">

            {/* DISTRICT 1 */}

            <div className="comparison-selector">

              <label>
                District 1
              </label>

              <select
                value={
                  comparisonDistrict1
                }
                onChange={(e) =>
                  setComparisonDistrict1(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select District
                </option>

                {stats.data.map(
                  (row, index) => (

                    <option
                      key={index}
                      value={
                        row.Districts
                      }
                      disabled={
                        row.Districts ===
                        comparisonDistrict2
                      }
                    >
                      {row.Districts}
                    </option>

                  )
                )}

              </select>

            </div>

            {/* VS */}

            <div className="comparison-vs">
              VS
            </div>

            {/* DISTRICT 2 */}

            <div className="comparison-selector">

              <label>
                District 2
              </label>

              <select
                value={
                  comparisonDistrict2
                }
                onChange={(e) =>
                  setComparisonDistrict2(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select District
                </option>

                {stats.data.map(
                  (row, index) => (

                    <option
                      key={index}
                      value={
                        row.Districts
                      }
                      disabled={
                        row.Districts ===
                        comparisonDistrict1
                      }
                    >
                      {row.Districts}
                    </option>

                  )
                )}

              </select>

            </div>

          </div>

          {/* COMPARISON RESULTS */}

          {district1Data &&
          district2Data ? (

            <>

              {/* VALUES */}

              <div className="comparison-values">

                <div className="comparison-value-card">

                  <h3>
                    {
                      comparisonDistrict1
                    }
                  </h3>

                  <div className="comparison-main-value">
                    {district1Overall}%
                  </div>

                  <p>
                    Overall Literacy
                  </p>

                </div>

                <div className="comparison-value-card">

                  <h3>
                    {
                      comparisonDistrict2
                    }
                  </h3>

                  <div className="comparison-main-value">
                    {district2Overall}%
                  </div>

                  <p>
                    Overall Literacy
                  </p>

                </div>

              </div>

              {/* CHART */}

              <div className="comparison-chart">

                <ResponsiveContainer
                  width="100%"
                  height={380}
                >

                  <BarChart
                    data={
                      districtComparisonData
                    }
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="district"
                    />

                    <YAxis
                      domain={[0, 100]}
                      label={{
                        value:
                          "Literacy Rate (%)",
                        angle: -90,
                        position:
                          "insideLeft",
                      }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${Number(
                          value
                        ).toFixed(2)}%`,
                        "Overall Literacy",
                      ]}
                    />

                    <Bar
                      dataKey="overall"
                      name="Overall Literacy"
                      fill="#0F766E"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </>

          ) : (

            <div className="comparison-placeholder">

              Select two districts to
              compare their overall
              literacy rates.

            </div>

          )}

        </div>

        {/* ===================================================
            2. MALE VS FEMALE BY DISTRICT
        =================================================== */}

        <div className="chart-card comparison-card">

          <h2>
            Male vs Female Literacy by District
          </h2>

          <p className="comparison-description">
            Select districts to compare
            male and female literacy rates.
          </p>

          {/* SELECT ALL / CLEAR */}

          <div className="comparison-actions">

            <button
              type="button"
              onClick={
                selectAllGenderDistricts
              }
            >
              Select All
            </button>

            <button
              type="button"
              onClick={
                clearGenderDistricts
              }
            >
              Clear All
            </button>

          </div>

          {/* DISTRICT CHECKBOXES */}

          <div className="district-checkbox-container">

            {stats.data.map(
              (row, index) => (

                <label
                  key={index}
                  className="district-checkbox"
                >

                  <input
                    type="checkbox"
                    checked={genderDistricts.includes(
                      row.Districts
                    )}
                    onChange={(e) =>
                      handleGenderDistrictChange(
                        row.Districts,
                        e.target.checked
                      )
                    }
                  />

                  <span>
                    {row.Districts}
                  </span>

                </label>

              )
            )}

          </div>

          {/* GENDER RESULTS */}

          {genderComparisonData.length >
          0 ? (

            <>

              {/* VALUES TABLE */}

              <div className="gender-comparison-table-wrapper">

                <table className="gender-comparison-table">

                  <thead>

                    <tr>

                      <th>
                        District
                      </th>

                      <th>
                        Male Literacy (%)
                      </th>

                      <th>
                        Female Literacy (%)
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {genderComparisonData.map(
                      (row, index) => (

                        <tr key={index}>

                          <td>
                            {row.district}
                          </td>

                          <td>
                            {row.male.toFixed(
                              2
                            )}
                            %
                          </td>

                          <td>
                            {row.female.toFixed(
                              2
                            )}
                            %
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* GENDER CHART */}

              <div className="comparison-chart">

                <ResponsiveContainer
                  width="100%"
                  height={420}
                >

                  <BarChart
                    data={
                      genderComparisonData
                    }
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 80,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="district"
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      height={100}
                    />

                    <YAxis
                      domain={[0, 100]}
                      label={{
                        value:
                          "Literacy Rate (%)",
                        angle: -90,
                        position:
                          "insideLeft",
                      }}
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${Number(
                          value
                        ).toFixed(2)}%`,
                      ]}
                    />

                    <Legend />

                    <Bar
                      dataKey="male"
                      name="Male"
                      fill="#0F766E"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                    <Bar
                      dataKey="female"
                      name="Female"
                      fill="#14B8A6"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </>

          ) : (

            <div className="comparison-placeholder">

              Select one or more districts
              above to compare male and
              female literacy.

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          DISTRICT LITERACY STATISTICS
      ===================================================== */}

      <section className="table-section">

        <div className="chart-card">

          <h2>
            District Literacy Statistics
          </h2>

          {/* =================================================
              SORT CONTROLS
          ================================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >

            <label
              htmlFor="literacy-sort"
              style={{
                fontWeight: "600",
                fontSize: "16px",
              }}
            >
              Sort by:
            </label>

            <select
              id="literacy-sort"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #D1D5DB",
                fontSize: "15px",
                cursor: "pointer",
                background: "#FFFFFF",
              }}
            >

              <option value="male">
                Male Literacy
              </option>

              <option value="female">
                Female Literacy
              </option>

              <option value="overall">
                Overall Literacy
              </option>

            </select>

          </div>

          <div className="table-wrapper">

            <table className="literacy-table">

              <thead>

                <tr>

                  <th>
                    District
                  </th>

                  <th>
                    Male Literacy (%)
                  </th>

                  <th>
                    Female Literacy (%)
                  </th>

                  <th>
                    Overall Literacy (%)
                  </th>

                </tr>

              </thead>

              <tbody>

                {sortedTableData.map(
                  (row, index) => {

                    const overall =
                      row.overall.toFixed(2);

                    return (
                      <tr
                        key={index}
                        className={
                          selectedDistrict ===
                          row.Districts
                            ? "selected-row"
                            : ""
                        }
                      >

                        <td>
                          {row.Districts}
                        </td>

                        <td>
                          {row.male.toFixed(2)}
                        </td>

                        <td>
                          {row.female.toFixed(2)}
                        </td>

                        <td>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >

                            <progress
                              value={
                                row.overall
                              }
                              max="100"
                              style={{
                                width: "120px",
                              }}
                            />

                            {overall}%

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>

    </div>
  );
}

export default LiteracyDashboard;