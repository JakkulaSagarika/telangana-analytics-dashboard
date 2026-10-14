import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import agriBg from "../../assets/images/Agri bg.jpeg";
import axios from "axios";

const AgricultureMap = lazy(() => import("../components/Agriculture/AgricultureMap"));

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Treemap,
} from "recharts";

const API = "/api/agriculture/summary/";

const GREEN = "#4E8F68";
const DARK_GREEN = "#1F4F39";
const LIGHT_GREEN = "#9FC7A5";
const PALE_GREEN = "#D5E3D4";
const BG = "#F9F3E9";

const CHART_COLORS = [
  "#1F4F39",
  "#4E8F68",
  "#6FAF86",
  "#8FBD9D",
  "#9FC7A5",
  "#B9D4BE",
  "#D5E3D4",
  "#3D7A5A",
  "#5F9B76",
  "#7EAE91",
];

/* ------------------------- DATA HELPERS ------------------------- */

const first = (...values) =>
  values.find((v) => v !== undefined && v !== null);

const num = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const labelOf = (row, index = 0) =>
  String(
    first(
      row?.crop,
      row?.crop_name,
      row?.cropName,
      row?.commodity,
      row?.name,
      row?.district,
      row?.district_name,
      row?.districtName,
      row?.label,
      row?.category,
      `Item ${index + 1}`
    )
  );

const arrayFrom = (...values) => {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
};

const rowsFrom = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.results)) return value.results;
    if (Array.isArray(value.rows)) return value.rows;
  }
  return [];
};

const productionOf = (row) =>
  num(
    first(
      row?.production,
      row?.Production,
      row?.production_value,
      row?.productionValue,
      row?.total_production,
      row?.totalProduction,
      row?.prod
    )
  );

const areaOf = (row) =>
  num(
    first(
      row?.area,
      row?.Area,
      row?.crop_area,
      row?.cropArea,
      row?.cultivated_area,
      row?.cultivatedArea,
      row?.area_value,
      row?.areaValue,
      row?.acreage
    )
  );

const cropRows = (yearData) => {
  const source = first(
    yearData?.top_crops,
    yearData?.crop_analysis,
    yearData?.crops,
    yearData?.crop_data,
    yearData?.cropAnalytics
  );

  return rowsFrom(source)
    .map((r, i) => ({
      name: labelOf(r, i),
      production: productionOf(r),
      area: areaOf(r),
      raw: r,
    }))
    .filter((r) => r.name && (r.production > 0 || r.area > 0));
};

const districtRows = (yearData) => {
  const source = first(
    yearData?.districts,
    yearData?.district_data,
    yearData?.district_analytics,
    yearData?.districtAnalytics
  );

  return rowsFrom(source)
    .map((r, i) => ({
      name: labelOf(r, i),
      production: productionOf(r),
      area: areaOf(r),
      raw: r,
    }))
    .filter((r) => r.name && (r.production > 0 || r.area > 0));
};

const breakdownRows = (yearData, crops) => {
  const source = first(
    yearData?.production_breakdown,
    yearData?.production_distribution,
    yearData?.productionDistribution,
    yearData?.breakdown
  );

  const rows = rowsFrom(source);

  if (rows.length) {
    return rows
      .map((r, i) => ({
        name: labelOf(r, i),
        value: productionOf(r) || num(first(r?.value, r?.total)),
      }))
      .filter((r) => r.value > 0);
  }

  return crops
    .filter((r) => r.production > 0)
    .slice(0, 8)
    .map((r) => ({ name: r.name, value: r.production }));
};

const formatNumber = (value) => {
  const n = num(value);
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)} K`;
  return n.toLocaleString("en-IN");
};

/* ------------------------- DASHBOARD ------------------------- */

function AgricultureDashboard() {
  const [data, setData] = useState({
    district_count: 0,
    mandal_count: 0,
    crop_count: 0,
    year_count: 0,
    total_records: 0,
    years: [],
  });
  const [yearData, setYearData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [yearLoading, setYearLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get(API)
      .then((res) => {
        setData(res.data || {
          district_count: 0,
          mandal_count: 0,
          crop_count: 0,
          year_count: 0,
          total_records: 0,
          years: [],
        });
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load agriculture data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const id = "agriculture-dashboard-chart-style";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        .agri-chart-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
          margin-bottom: 24px;
          width: 100%;
        }
        .agri-chart-card {
          min-width: 0;
        }
        @media (max-width: 900px) {
          .agri-chart-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .agri-chart-card {
            padding: 16px !important;
          }
          .agri-chart-card h3 {
            font-size: 20px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }
    const renderCropTreemap = (props) => {
    const { x, y, width, height, name } = props;
    if (!width || !height || width < 45 || height < 28) return null;
    const label = String(name || "").length > 20
      ? String(name).slice(0, 20) + "…"
      : String(name || "");
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="#4f956f"
          stroke="#f8f6ee"
          strokeWidth={2}
          rx={2}
        />
        {label && (
          <text
            x={x + 8}
            y={y + Math.min(24, height / 2)}
            fill="#ffffff"
            fontSize={Math.max(11, Math.min(16, width / 12))}
            fontWeight="600"
          >
            {label}
          </text>
        )}
      </g>
    );
  };

  return () => {
      const style = document.getElementById(id);
      if (style) style.remove();
    };
  }, []);

  useEffect(() => {
    if (!Array.isArray(data?.years) || data.years.length === 0) return;

    const years = data.years.slice(0, 4);
    setComparisonLoading(true);

    Promise.all(
      years.map((year) =>
        axios
          .get(`${API}${encodeURIComponent(year)}/`)
          .then((res) => ({ year, data: res.data || {} }))
          .catch((err) => {
            console.error(`Comparison data error for ${year}:`, err);
            return { year, data: {} };
          })
      )
    )
      .then((results) => setComparisonData(results))
      .finally(() => setComparisonLoading(false));
  }, [data?.years]);

  const handleYearClick = (year) => {
    setSelectedYear(year);
    setYearLoading(true);
    setYearData(null);

    axios
      .get(`${API}${encodeURIComponent(year)}/`)
      .then((res) => {
        console.log("Agriculture year API:", res.data);
        setYearData(res.data);
        setYearLoading(false);
      })
      .catch((err) => {
        console.error("Year analytics error:", err);
        setYearLoading(false);
        setYearData(null);
      });
  };

  if (error) {
    return (
      <div style={{ ...centerPage, color: "#8B1E1E", padding: 40 }}>
        {error}
      </div>
    );
  }

  return (
  <div
    style={{
      minHeight: "100vh",
      backgroundImage: `url("${agriBg}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      padding: "30px 40px 60px",
      color: DARK_GREEN,
    }}
  >
    
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: DARK_GREEN,
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          ← Back to Home
        </Link>
      </div>

      <div style={{ textAlign: "center", marginBottom: 45 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 42,
            fontWeight: 700,
            color: DARK_GREEN,
          }}
        >
          Telangana Agriculture Dashboard
        </h1>
        <p style={{ marginTop: 10, fontSize: 18, color: GREEN }}>
          Horticulture crop area, production and yield analytics
        </p>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 22,
          marginBottom: 45,
        }}
      >
        <KpiCard icon="🗺️" value={data.district_count} title="Districts" color={GREEN} />
        <KpiCard icon="🏘️" value={data.mandal_count} title="Mandals" color={DARK_GREEN} />
        <KpiCard icon="🌱" value={data.crop_count} title="Crop Categories" color={LIGHT_GREEN} />
        <KpiCard icon="📅" value={data.year_count} title="Agriculture Years" color={GREEN} />
        <KpiCard
          icon="📊"
          value={num(data.total_records).toLocaleString("en-IN")}
          title="Total Records"
          color={DARK_GREEN}
        />
      </div>

      {/* DATA COVERAGE */}
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>🌾 Agriculture Data Coverage</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 18,
          }}
        >
          {(data.years || []).map((year) => (
            <div
              key={year}
              onClick={() => handleYearClick(year)}
              style={{
                background:
                  selectedYear === year ? LIGHT_GREEN : PALE_GREEN,
                borderRadius: 14,
                padding: 20,
                textAlign: "center",
                cursor: "pointer",
                border:
                  selectedYear === year
                    ? `2px solid ${DARK_GREEN}`
                    : "2px solid transparent",
                transition: "all .25s ease",
                transform:
                  selectedYear === year ? "translateY(-3px)" : "translateY(0)",
                boxShadow:
                  selectedYear === year
                    ? "0 8px 18px rgba(31,79,57,.15)"
                    : "none",
              }}
            >
              <div style={{ fontSize: 16, color: GREEN, marginBottom: 8 }}>
                Agriculture Year
              </div>
              <strong style={{ fontSize: 25, color: DARK_GREEN }}>
                {year}
              </strong>
            </div>
          ))}
        </div>
      </section>

      {/* YEAR ANALYTICS */}
      {selectedYear && (
        <section style={sectionStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 25,
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: DARK_GREEN }}>
                📊 {selectedYear} Agriculture Analytics
              </h2>
              <p style={{ marginTop: 8, marginBottom: 0, color: GREEN }}>
                Year-wise agriculture statistics for Telangana
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedYear(null);
                setYearData(null);
              }}
              style={{
                border: "none",
                background: PALE_GREEN,
                color: DARK_GREEN,
                padding: "10px 16px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ✕ Clear
            </button>
          </div>

          {yearLoading ? (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                color: GREEN,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Loading {selectedYear} analytics...
            </div>
          ) : yearData ? (
            <YearAnalytics yearData={yearData} selectedYear={selectedYear} />
          ) : (
            <div style={{ padding: 30, color: "#8B1E1E" }}>
              Unable to load data for {selectedYear}.
            </div>
          )}
        </section>
      )}

      <Suspense fallback={<div style={{ ...centerPage, minHeight: 220, fontSize: 18 }}>Loading map...</div>}>
        <AgricultureMap />
      </Suspense>

      {/* COMBINED 4-YEAR VISUALIZATIONS */}
      <FourYearAnalytics
        comparisonData={comparisonData}
        loading={comparisonLoading}
      />

      {/* 4-YEAR COMPARISON */}
      <FourYearComparison
        comparisonData={comparisonData}
        loading={comparisonLoading}
      />

      {/* EXPLORE */}
      <section>
        <h2 style={{ color: DARK_GREEN, marginBottom: 20 }}>
          🔎 Explore Agriculture Data
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 22,
          }}
        >
          <Link to="/agriculture/districts" style={{ textDecoration: "none" }}>
            <ExploreCard
              icon="🗺️"
              title="District Analytics"
              text="Explore agriculture statistics district by district."
            />
          </Link>

          <Link to="/agriculture/crops" style={{ textDecoration: "none" }}>
            <ExploreCard
              icon="🌱"
              title="Crop Analytics"
              text="Explore the different crops available across Telangana."
            />
          </Link>

          <ExploreCard
            icon="📈"
            title="Year-wise Analysis"
            text="Compare agriculture data across the available years."
          />
        </div>
      </section>

      <div
        style={{
          marginTop: 45,
          textAlign: "center",
          color: GREEN,
          fontSize: 14,
        }}
      >
        Agriculture data available for {data.district_count} districts across{" "}
        {data.year_count} years.
      </div>
    </div>
  );
}

/* ------------------------- YEAR ANALYTICS ------------------------- */
const AGRI_COLORS = [
  "#205C46",
  "#3F8062",
  "#5A9875",
  "#75AD8B",
  "#91BEA0",
  "#A8C9B2",
  "#C0D8C7",
  "#D5E5DA",
];
function CropTreemapContent({
  x,
  y,
  width,
  height,
  name,
}) {
  if (!name || width <= 0 || height <= 0) return null;

  const text = String(name);

  // Adjust font size based on box size
  const fontSize = Math.max(
    9,
    Math.min(16, Math.min(width / 8, height / 3))
  );

  // Approximate how many characters can fit per line
  const charsPerLine = Math.max(
    6,
    Math.floor(width / (fontSize * 0.58))
  );

  // Wrap text into multiple lines
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (testLine.length <= charsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);

  // Maximum number of lines that can fit
  const maxLines = Math.max(
    1,
    Math.floor((height - 8) / (fontSize + 4))
  );

  const visibleLines = lines.slice(0, maxLines);

  if (lines.length > maxLines && visibleLines.length) {
    const last = visibleLines.length - 1;
    visibleLines[last] =
      visibleLines[last].length > 3
        ? visibleLines[last].slice(0, -1) + "…"
        : visibleLines[last] + "…";
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={GREEN}
        stroke="#FFFFFF"
        strokeWidth={2}
      />

      <text
        x={x + 8}
        y={y + 8}
        fill="#FFFFFF"
        fontSize={fontSize}
        fontWeight={700}
        dominantBaseline="hanging"
        style={{
          pointerEvents: "none",
          textShadow: "0 1px 2px rgba(0,0,0,.35)",
        }}
      >
        {visibleLines.map((line, index) => (
          <tspan
            key={index}
            x={x + 8}
            dy={index === 0 ? 0 : fontSize + 4}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}


function FourYearAnalytics({ comparisonData, loading }) {
  if (loading) {
    return (
      <section style={sectionStyle}>
        <h2 style={sectionTitle}>📊 Combined 4-Year Visualizations</h2>
        <div style={{ padding: 35, textAlign: "center", color: GREEN, fontWeight: 600 }}>
          Loading 4-year agriculture visualizations...
        </div>
      </section>
    );
  }

  if (!comparisonData?.length) return null;

  const yearRows = comparisonData.map(({ year, data }) => {
    const crops = cropRows(data);
    const districts = districtRows(data);
    return {
      year: String(year),
      production: crops.reduce((sum, r) => sum + r.production, 0),
      area: crops.reduce((sum, r) => sum + r.area, 0),
      crops,
      districts,
    };
  });

  const allCropNames = Array.from(
    new Set(yearRows.flatMap((r) => r.crops.map((c) => c.name)))
  );

  const cropProduction = allCropNames
    .map((name) => {
      const row = { name };
      yearRows.forEach((yr) => {
        const crop = yr.crops.find((c) => c.name === name);
        row[yr.year] = crop?.production || 0;
      });
      return row;
    })
    .sort((a, b) =>
      yearRows.reduce((s, yr) => s + num(b[yr.year]), 0) -
      yearRows.reduce((s, yr) => s + num(a[yr.year]), 0)
    )
    .slice(0, 8);

  const cropArea = allCropNames
    .map((name) => {
      const row = { name };
      yearRows.forEach((yr) => {
        const crop = yr.crops.find((c) => c.name === name);
        row[yr.year] = crop?.area || 0;
      });
      return row;
    })
    .sort((a, b) =>
      yearRows.reduce((s, yr) => s + num(b[yr.year]), 0) -
      yearRows.reduce((s, yr) => s + num(a[yr.year]), 0)
    )
    .slice(0, 8);

  const years = yearRows.map((r) => r.year);

  return (
    <section style={sectionStyle}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={sectionTitle}>📊 Combined 4-Year Visualizations</h2>
        <p style={{ margin: 0, color: GREEN }}>
          All available agriculture years are shown together for direct comparison.
        </p>
      </div>

      <div className="agri-chart-grid">
        <ChartCard icon="🌾" title="Total Production — 4-Year Trend" subtitle="Overall production across the four agriculture years">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={yearRows} margin={{ top: 15, right: 20, left: 10, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D5E3D4" />
              <XAxis dataKey="year" tick={{ fill: DARK_GREEN }} />
              <YAxis tick={{ fill: DARK_GREEN }} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Bar dataKey="production" name="Production" fill={GREEN} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard icon="🌱" title="Total Area — 4-Year Trend" subtitle="Overall cultivated area across the four years">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={yearRows} margin={{ top: 15, right: 20, left: 10, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D5E3D4" />
              <XAxis dataKey="year" tick={{ fill: DARK_GREEN }} />
              <YAxis tick={{ fill: DARK_GREEN }} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Bar dataKey="area" name="Area" fill={LIGHT_GREEN} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="agri-chart-grid">
        <ChartCard icon="📈" title="Production vs Area — 4 Years" subtitle="Combined comparison of total area and production">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={yearRows} margin={{ top: 15, right: 20, left: 10, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D5E3D4" />
              <XAxis dataKey="year" tick={{ fill: DARK_GREEN }} />
              <YAxis tick={{ fill: DARK_GREEN }} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Legend />
              <Bar dataKey="area" name="Area" fill={LIGHT_GREEN} radius={[5, 5, 0, 0]} />
              <Bar dataKey="production" name="Production" fill={GREEN} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard icon="🌾" title="Top Crops — Production Across 4 Years" subtitle="Same major crops compared year by year">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cropProduction} margin={{ top: 15, right: 20, left: 10, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D5E3D4" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={75} tick={{ fill: DARK_GREEN, fontSize: 11 }} />
              <YAxis tick={{ fill: DARK_GREEN }} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Legend />
              {years.map((year, i) => (
                <Bar key={year} dataKey={year} name={year} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="agri-chart-grid">
        <ChartCard icon="🌿" title="Top Crops — Area Across 4 Years" subtitle="Cultivated area comparison for major crops">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={cropArea} margin={{ top: 15, right: 20, left: 10, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D5E3D4" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={75} tick={{ fill: DARK_GREEN, fontSize: 11 }} />
              <YAxis tick={{ fill: DARK_GREEN }} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Legend />
              {years.map((year, i) => (
                <Bar key={year} dataKey={year} name={year} fill={CHART_COLORS[(i + 3) % CHART_COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard icon="📊" title="Production Trend" subtitle="Year-to-year change in total production">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={yearRows} margin={{ top: 15, right: 20, left: 10, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D5E3D4" />
              <XAxis dataKey="year" tick={{ fill: DARK_GREEN }} />
              <YAxis tick={{ fill: DARK_GREEN }} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Bar dataKey="production" name="Production" fill={DARK_GREEN} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

function FourYearComparison({ comparisonData, loading }) {
  if (loading || !comparisonData?.length) return null;

  const years = comparisonData.map((r) => String(r.year));
  const rows = comparisonData.map(({ year, data }) => {
    const crops = cropRows(data);
    const districts = districtRows(data);
    return {
      year: String(year),
      production: crops.reduce((s, r) => s + r.production, 0),
      area: crops.reduce((s, r) => s + r.area, 0),
      crops: crops.length,
      districts: districts.length,
    };
  });

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitle}>🔍 4-Year Comparison</h2>
      <p style={{ color: GREEN, marginTop: -10, marginBottom: 22 }}>
        Quick year-over-year comparison of the four agriculture years.
      </p>

      <div style={{ overflowX: "auto", border: "1px solid #D5E3D4", borderRadius: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
          <thead>
            <tr style={{ background: PALE_GREEN }}>
              <th style={thStyle}>Metric</th>
              {years.map((year) => <th key={year} style={thStyle}>{year}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...tdStyle, fontWeight: 700 }}>Total Production</td>
              {rows.map((r) => <td key={r.year + "p"} style={tdStyle}>{formatNumber(r.production)}</td>)}
            </tr>
            <tr>
              <td style={{ ...tdStyle, fontWeight: 700 }}>Total Area</td>
              {rows.map((r) => <td key={r.year + "a"} style={tdStyle}>{formatNumber(r.area)}</td>)}
            </tr>
            <tr>
              <td style={{ ...tdStyle, fontWeight: 700 }}>Crop Categories</td>
              {rows.map((r) => <td key={r.year + "c"} style={tdStyle}>{r.crops}</td>)}
            </tr>
            <tr>
              <td style={{ ...tdStyle, fontWeight: 700 }}>Districts with Data</td>
              {rows.map((r) => <td key={r.year + "d"} style={tdStyle}>{r.districts}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function YearAnalytics({ yearData, selectedYear }) {
  const crops = cropRows(yearData);
  const districts = districtRows(yearData);

  /*
    IMPORTANT:
    These fallbacks prevent the old:
    "Cannot read properties of null (reading 'top_crops')"
    error. Every chart receives an array, even when the API returns null.
  */

  const topProduction = [...crops]
    .filter((r) => r.production > 0)
    .sort((a, b) => b.production - a.production)
    .slice(0, 10);

  const topArea = [...crops]
    .filter((r) => r.area > 0)
    .sort((a, b) => b.area - a.area)
    .slice(0, 10);

  const productionVsArea = [...crops]
    .filter((r) => r.production > 0 || r.area > 0)
    .sort((a, b) => Math.max(b.production, b.area) - Math.max(a.production, a.area))
    .slice(0, 8);

  const distData = breakdownRows(yearData, crops);

  const diversity = [...crops]
    .filter((r) => r.area > 0 || r.production > 0)
    .sort((a, b) => (b.area || b.production) - (a.area || a.production))
    .slice(0, 15)
    .map((r) => ({
      name: r.name,
      size: r.area || r.production,
    }));

  const topDistrictProduction = [...districts]
    .filter((r) => r.production > 0)
    .sort((a, b) => b.production - a.production)
    .slice(0, 10);

  const topDistrictArea = [...districts]
    .filter((r) => r.area > 0)
    .sort((a, b) => b.area - a.area)
    .slice(0, 10);

  const summaryRows = [...districts]
    .sort(
      (a, b) =>
        Math.max(b.production, b.area) - Math.max(a.production, a.area)
    )
    .slice(0, 20);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        <KpiCard
          icon="🗺️"
          value={yearData.district_count}
          title="Districts"
          color={GREEN}
        />
        <KpiCard
          icon="🏘️"
          value={yearData.mandal_count}
          title="Mandals"
          color={DARK_GREEN}
        />
        <KpiCard
          icon="🌱"
          value={yearData.crop_count}
          title="Crop Categories"
          color={LIGHT_GREEN}
        />
        <KpiCard
          icon="📊"
          value={num(yearData.records).toLocaleString("en-IN")}
          title="Records"
          color={DARK_GREEN}
        />
      </div>

      {/* ROW 1 */}
      <div className="agri-chart-grid">
        <ChartCard
          icon="🌾"
          title="Top Crops by Production"
          subtitle={`Highest producing crops in ${selectedYear}`}
        >
          <BarChartComponent
            data={topProduction}
            dataKey="production"
            label="Production"
          />
        </ChartCard>

        <ChartCard
          icon="🌱"
          title="Top Crops by Area"
          subtitle={`Crops occupying the highest area in ${selectedYear}`}
        >
          <BarChartComponent data={topArea} dataKey="area" label="Area" />
        </ChartCard>
      </div>

      {/* ROW 2 */}
      <div className="agri-chart-grid">
        <ChartCard
          icon="📊"
          title="Production vs Area"
          subtitle="Comparison of area and production for major crops"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={productionVsArea}
              margin={{ top: 10, right: 25, left: 10, bottom: 55 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#D5E3D4" />
              <XAxis
                dataKey="name"
                tick={{ fill: DARK_GREEN, fontSize: 12 }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: DARK_GREEN, fontSize: 12 }} />
              <Tooltip formatter={(v) => formatNumber(v)} />
              <Legend />
              <Bar dataKey="area" name="Area" fill={LIGHT_GREEN} radius={[5, 5, 0, 0]} />
              <Bar
                dataKey="production"
                name="Production"
                fill={GREEN}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
  icon="🍑"
  title="Production Distribution"
  subtitle="Share of total production among top crops"
>
  <ResponsiveContainer width="100%" height={320}>
    <PieChart>
      <Pie
        data={distData
          .map((r, i) => ({
            name:
              r.name ||
              r.crop ||
              r.crop_name ||
              r.category ||
              r.label ||
              `Crop ${i + 1}`,
            value: Number(
              r.value ??
              r.production ??
              r.total_production ??
              r.amount ??
              0
            ),
          }))
          .filter((r) => r.value > 0)
        }
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="45%"
        outerRadius={115}
        innerRadius={65}
        paddingAngle={2}
        label={({ name, percent }) =>
          `${name} ${(percent * 100).toFixed(1)}%`
        }
        labelLine={true}
      >
        {distData
          .map((r, i) => ({
            name:
              r.name ||
              r.crop ||
              r.crop_name ||
              r.category ||
              r.label ||
              `Crop ${i + 1}`,
            value: Number(
              r.value ??
              r.production ??
              r.total_production ??
              r.amount ??
              0
            ),
          }))
          .filter((r) => r.value > 0)
          .map((entry, index) => (
            <Cell
              key={`distribution-cell-${index}`}
              fill={AGRI_COLORS[index % AGRI_COLORS.length]}
            />
          ))}
      </Pie>

      <Tooltip
        formatter={(value, name) => [
          Number(value).toLocaleString("en-IN"),
          name,
        ]}
      />

      <Legend
        verticalAlign="bottom"
        height={36}
        formatter={(value) => value}
      />
    </PieChart>
  </ResponsiveContainer>
</ChartCard>
      </div>

      {/* ROW 3 */}
      <div className="agri-chart-grid">
        <ChartCard
          icon="🌈"
          title="Crop Diversity"
          subtitle="Relative crop production/area across categories"
          tall
        >
          <ResponsiveContainer width="100%" height="100%">
  <Treemap
    data={diversity}
    dataKey="size"
    nameKey="name"
    aspectRatio={4 / 3}
    content={<CropTreemapContent />}
  >
    <Tooltip
      formatter={(value) => formatNumber(value)}
      labelFormatter={(label) => String(label)}
    />
  </Treemap>
</ResponsiveContainer>
        </ChartCard>

        <ChartCard
          icon="🏆"
          title="Top Districts by Production"
          subtitle="Districts with the highest production"
        >
          <BarChartComponent
            data={topDistrictProduction}
            dataKey="production"
            label="Production"
            district
          />
        </ChartCard>
      </div>

      {/* ROW 4 */}
      <div className="agri-chart-grid">
        <ChartCard
          icon="🌱"
          title="Top Districts by Crop Area"
          subtitle="Districts with the highest cultivated area"
        >
          <BarChartComponent
            data={topDistrictArea}
            dataKey="area"
            label="Crop Area"
            district
          />
        </ChartCard>

        <ChartCard
          icon="📋"
          title="District Summary"
          subtitle="Production and cultivated area by district"
          tall
        >
          <div style={{ height: "100%", overflow: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: PALE_GREEN }}>
                  <th style={thStyle}>#</th>
                  <th style={{ ...thStyle, textAlign: "left" }}>District</th>
                  <th style={thStyle}>Production</th>
                  <th style={thStyle}>Crop Area</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row, index) => (
                  <tr key={`${row.name}-${index}`}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>
                      {row.name}
                    </td>
                    <td style={tdStyle}>{formatNumber(row.production)}</td>
                    <td style={tdStyle}>{formatNumber(row.area)}</td>
                  </tr>
                ))}

                {!summaryRows.length && (
                  <tr>
                    <td colSpan="4" style={{ ...tdStyle, padding: 35 }}>
                      No district data available for this year.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

/* ------------------------- BAR CHART ------------------------- */

function BarChartComponent({ data, dataKey, label, district = false }) {
  if (!data.length) {
    return <EmptyChart message={`No ${label.toLowerCase()} data available.`} />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 25, left: district ? 85 : 65, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#D5E3D4" />
        <XAxis
          type="number"
          tick={{ fill: DARK_GREEN, fontSize: 11 }}
          tickFormatter={formatNumber}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={district ? 105 : 90}
          tick={{ fill: DARK_GREEN, fontSize: 11 }}
        />
        <Tooltip
          formatter={(value) => [formatNumber(value), label]}
          contentStyle={{
            borderRadius: 10,
            border: `1px solid ${PALE_GREEN}`,
          }}
        />
        <Bar
          dataKey={dataKey}
          name={label}
          fill={GREEN}
          radius={[0, 6, 6, 0]}
          barSize={22}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------- CHART CARD ------------------------- */

function ChartCard({ icon, title, subtitle, children, tall = false }) {
  return (
    <div
      className="agri-chart-card"
      style={{
        background: "#FCFAF5",
        border: "1px solid #D5E3D4",
        borderRadius: 20,
        padding: "20px 22px 18px",
        minWidth: 0,
        minHeight: tall ? 430 : 410,
        boxShadow: "0 6px 18px rgba(31,79,57,.08)",
        overflow: "hidden",
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <h3
          style={{
            margin: 0,
            color: DARK_GREEN,
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {icon} {title}
        </h3>
        <p
          style={{
            margin: "8px 0 0",
            color: GREEN,
            fontSize: 16,
          }}
        >
          {subtitle}
        </p>
      </div>

      <div
        style={{
          width: "100%",
          height: tall ? 330 : 325,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: GREEN,
        fontSize: 16,
        background: "rgba(213,227,212,.18)",
        borderRadius: 12,
      }}
    >
      {message}
    </div>
  );
}

/* ------------------------- CARDS ------------------------- */

function KpiCard({ icon, value, title, color }) {
  return (
    <div
      style={{
        background: "#FCFAF5",
        border: "1px solid #D5E3D4",
        borderTop: `5px solid ${color}`,
        borderRadius: 18,
        minHeight: 170,
        padding: 22,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        boxShadow: "0 6px 18px rgba(31,79,57,.08)",
        transition: "all .25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 12px 25px rgba(31,79,57,.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 18px rgba(31,79,57,.08)";
      }}
    >
      <div style={{ fontSize: 38, marginBottom: 12 }}>{icon}</div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: DARK_GREEN,
        }}
      >
        {value ?? 0}
      </div>
      <div
        style={{
          marginTop: 7,
          fontSize: 16,
          color: GREEN,
          fontWeight: 600,
        }}
      >
        {title}
      </div>
    </div>
  );
}

function ExploreCard({ icon, title, text }) {
  return (
    <div
      style={{
        background: "#FCFAF5",
        border: "1px solid #D5E3D4",
        borderRadius: 18,
        padding: 25,
        minHeight: 140,
        boxShadow: "0 6px 18px rgba(31,79,57,.08)",
        transition: "all .25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.background = PALE_GREEN;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "#FCFAF5";
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <h3 style={{ margin: "0 0 8px", color: DARK_GREEN, fontSize: 20 }}>
        {title}
      </h3>
      <p style={{ margin: 0, color: GREEN, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

const sectionStyle = {
  background: "#FCFAF5",
  border: "1px solid #D5E3D4",
  borderRadius: 20,
  padding: 28,
  marginBottom: 30,
  boxShadow: "0 6px 18px rgba(31,79,57,.08)",
};

const sectionTitle = {
  marginTop: 0,
  marginBottom: 22,
  color: DARK_GREEN,
};

const thStyle = {
  padding: "11px 8px",
  color: DARK_GREEN,
  fontWeight: 700,
  borderBottom: "1px solid #BFD3C2",
  textAlign: "center",
};

const tdStyle = {
  padding: "10px 8px",
  color: DARK_GREEN,
  borderBottom: "1px solid #E1EAE1",
  textAlign: "center",
};

const centerPage = {
  minHeight: "100vh",
  background: BG,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: DARK_GREEN,
  fontSize: 22,
  fontWeight: 600,
};

export default AgricultureDashboard;
