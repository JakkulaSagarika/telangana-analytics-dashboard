import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const BG = "#F9F3E9";
const CARD = "#FCFAF5";
const DARK = "#1F4F39";
const GREEN = "#4E8F68";
const LIGHT = "#D5E3D4";
const TEXT = "#64748B";

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

function cropName(r) {
  return r?.crop || r?.crop_name || r?.name || r?.Crop || "Unknown Crop";
}

function valueOf(r, keys) {
  for (const k of keys) {
    if (r && r[k] !== undefined && r[k] !== null && r[k] !== "") {
      const v = Number(r[k]);
      if (Number.isFinite(v)) return v;
    }
  }
  return 0;
}

function BarList({ items, valueKey, color = GREEN, formatter = (v) => n(v).toLocaleString("en-IN") }) {
  if (!items.length) {
    return <div style={{ color: TEXT, padding: "20px 0" }}>No data available.</div>;
  }

  const max = Math.max(...items.map((x) => n(x[valueKey])), 1);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {items.map((item, i) => {
        const value = n(item[valueKey]);
        const width = Math.max((value / max) * 100, value > 0 ? 3 : 0);

        return (
          <div key={`${item.name}-${i}`}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
              marginBottom: 6,
              color: DARK,
              fontWeight: 600,
              fontSize: 14
            }}>
              <span title={item.name}>{item.name}</span>
              <span style={{ color: GREEN, whiteSpace: "nowrap" }}>{formatter(value)}</span>
            </div>

            <div style={{
              height: 13,
              background: "#E8EFE8",
              borderRadius: 20,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${width}%`,
                height: "100%",
                background: color,
                borderRadius: 20,
                transition: "width .3s ease"
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Card({ title, subtitle, children, style = {} }) {
  return (
    <section style={{
      background: CARD,
      border: "1px solid #D5E3D4",
      borderRadius: 20,
      padding: 25,
      boxShadow: "0 6px 18px rgba(31,79,57,0.07)",
      ...style
    }}>
      <h2 style={{ margin: 0, color: DARK, fontSize: 21 }}>{title}</h2>
      {subtitle && (
        <p style={{ margin: "7px 0 20px", color: GREEN, fontSize: 15 }}>
          {subtitle}
        </p>
      )}
      {children}
    </section>
  );
}

function KPICard({ icon, value, title, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: CARD,
        border: "1px solid #D5E3D4",
        borderTop: "5px solid #4E8F68",
        borderRadius: 18,
        padding: 24,
        textAlign: "center",
        boxShadow: "0 6px 18px rgba(31,79,57,0.08)",
        cursor: onClick ? "pointer" : "default",
        transition: "transform .15s ease, box-shadow .15s ease"
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 10px 24px rgba(31,79,57,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 18px rgba(31,79,57,0.08)";
        }
      }}
    >
      <div style={{ fontSize: 38, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: DARK }}>
        {value}
      </div>
      <div style={{ marginTop: 8, color: GREEN, fontWeight: 600 }}>
        {title}
      </div>
    </div>
  );
}

function InfoCard({ title, value, subtitle }) {
  return (
    <div style={{
      background: CARD,
      border: "1px solid #D5E3D4",
      borderRadius: 18,
      padding: 25,
      boxShadow: "0 6px 18px rgba(31,79,57,0.07)"
    }}>
      <h3 style={{ margin: 0, color: DARK, fontSize: 18 }}>{title}</h3>
      <div style={{
        fontSize: 32,
        fontWeight: 700,
        color: GREEN,
        margin: "18px 0 7px"
      }}>
        {value}
      </div>
      <div style={{ color: TEXT, fontSize: 14 }}>{subtitle}</div>
    </div>
  );
}

function AgricultureDistrictDashboard() {
  const { districtName } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mandals, setMandals] = useState([]);
  const [mandalsLoading, setMandalsLoading] = useState(true);
  const [cropData, setCropData] = useState([]);
  const [cropLoading, setCropLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);

  // District summary / selected-year data
  useEffect(() => {
    setLoading(true);
    setError("");

    const yearQuery = selectedYear
      ? `?year=${encodeURIComponent(selectedYear)}`
      : "";

    axios
      .get(
        `/api/agriculture/district/${encodeURIComponent(
          districtName
        )}/${yearQuery}`
      )
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("District agriculture error:", err);
        setError("Unable to load district agriculture data.");
        setLoading(false);
      });
  }, [districtName, selectedYear]);

  // Mandal data
  useEffect(() => {
    setMandalsLoading(true);

    axios
      .get(
        `/api/agriculture/district/${encodeURIComponent(
          districtName
        )}/mandals/`
      )
      .then((res) => {
        const result = res.data;
        setMandals(Array.isArray(result) ? result : result?.mandals || result?.data || []);
        setMandalsLoading(false);
      })
      .catch((err) => {
        console.error("Mandal agriculture error:", err);
        setMandals([]);
        setMandalsLoading(false);
      });
  }, [districtName]);

  // Crop data is loaded automatically so the district page contains
  // visualizations immediately; no extra button is required.
  useEffect(() => {
    setCropLoading(true);

    axios
      .get(
        `/api/agriculture/district/${encodeURIComponent(
          districtName
        )}/crops/`
      )
      .then((res) => {
        const result = res.data;

        if (Array.isArray(result)) setCropData(result);
        else if (Array.isArray(result?.crops)) setCropData(result.crops);
        else if (Array.isArray(result?.crop_data)) setCropData(result.crop_data);
        else if (Array.isArray(result?.crop_breakdown)) setCropData(result.crop_breakdown);
        else if (Array.isArray(result?.data)) setCropData(result.data);
        else setCropData([]);

        setCropLoading(false);
      })
      .catch((err) => {
        console.error("Crop analytics error:", err);
        setCropData([]);
        setCropLoading(false);
      });
  }, [districtName]);

  const cropRows = useMemo(() => {
    return cropData
      .map((r) => ({
        name: cropName(r),
        area: valueOf(r, ["area", "crop_area", "cultivated_area", "Area"]),
        production: valueOf(r, ["production", "crop_production", "Production"]),
        records: valueOf(r, ["records", "record_count", "Records"]),
        yield: valueOf(r, ["yield", "crop_yield", "Yield"])
      }))
      .filter((r) => r.name !== "Unknown Crop");
  }, [cropData]);

  const topProduction = useMemo(
    () => [...cropRows].sort((a, b) => b.production - a.production).filter(x => x.production > 0).slice(0, 10),
    [cropRows]
  );

  const topArea = useMemo(
    () => [...cropRows].sort((a, b) => b.area - a.area).filter(x => x.area > 0).slice(0, 10),
    [cropRows]
  );

  const topYield = useMemo(
    () => [...cropRows].sort((a, b) => b.yield - a.yield).filter(x => x.yield > 0).slice(0, 10),
    [cropRows]
  );

  const topMandalRecords = useMemo(() => {
    return mandals
      .map((m) => ({
        name: m.mandal || m.name || "Unknown Mandal",
        records: n(m.records || m.record_count || 0),
        crops: n(m.crops || m.crop_count || 0)
      }))
      .sort((a, b) => b.records - a.records)
      .slice(0, 10);
  }, [mandals]);

  const productionBreakdown = useMemo(() => {
    return (data?.production_breakdown || [])
      .map((x) => ({
        name: x.unit || x.name || "Production",
        value: n(x.value)
      }))
      .filter(x => x.value > 0)
      .slice(0, 10);
  }, [data]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: DARK,
        fontSize: 22,
        fontWeight: 600
      }}>
        Loading agriculture data...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", background: BG, padding: 40, color: DARK }}>
        <Link to="/agriculture" style={{ color: DARK, textDecoration: "none", fontWeight: 600 }}>
          ← Back to Agriculture Dashboard
        </Link>
        <h2 style={{ marginTop: 40 }}>{error || "No data found"}</h2>
      </div>
    );
  }

  const years = Array.isArray(data.years) ? data.years : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      padding: "25px 40px 60px",
      color: DARK
    }}>
      <Link
        to="/agriculture"
        style={{
          textDecoration: "none",
          color: DARK,
          fontWeight: 600,
          fontSize: 16
        }}
      >
        ← Back to Agriculture Dashboard
      </Link>

      <div style={{
        textAlign: "center",
        marginTop: 20,
        marginBottom: 35
      }}>
        <h1 style={{
          margin: 0,
          fontSize: 42,
          fontWeight: 700,
          color: DARK
        }}>
          {data.district} Agriculture Dashboard
        </h1>
        <p style={{
          marginTop: 10,
          fontSize: 18,
          color: GREEN
        }}>
          Horticulture crop area, production and yield analytics
        </p>
      </div>

      {/* KPI CARDS - same visual style as the home page */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(200px, 1fr))",
        gap: 24,
        marginBottom: 35
      }}>
        <KPICard
          icon="🌾"
          value={n(data.crop_count).toLocaleString("en-IN")}
          title="Crop Categories"
        />
        <KPICard
          icon="🗺️"
          value={n(data.mandal_count).toLocaleString("en-IN")}
          title="Mandals"
        />
        <KPICard
          icon="📊"
          value={n(data.records).toLocaleString("en-IN")}
          title="Total Records"
        />
        <KPICard
          icon="📅"
          value={years.length}
          title="Agriculture Years"
        />
      </div>

      {/* YEAR FILTER */}
      {years.length > 0 && (
        <Card
          title="📅 Agriculture Data Coverage"
          subtitle="Select a year to update the district summary"
          style={{ marginBottom: 35 }}
        >
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 18
          }}>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(selectedYear === year ? null : year)}
                style={{
                  background: selectedYear === year ? GREEN : LIGHT,
                  color: selectedYear === year ? "#fff" : DARK,
                  border: selectedYear === year ? `2px solid ${DARK}` : "2px solid transparent",
                  borderRadius: 14,
                  padding: "20px 15px",
                  textAlign: "center",
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 700
                }}
              >
                {year}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* OVERVIEW */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 25,
        marginBottom: 35
      }}>
        <InfoCard
          title="🌱 Total Crop Area"
          value={data.area_total !== null && data.area_total !== undefined
            ? n(data.area_total).toLocaleString("en-IN")
            : "N/A"}
          subtitle={selectedYear ? `Recorded agricultural area in ${selectedYear}` : "Recorded agricultural area"}
        />

        <InfoCard
          title="📦 Production Overview"
          value={productionBreakdown.length
            ? productionBreakdown[0].value.toLocaleString("en-IN")
            : "N/A"}
          subtitle={productionBreakdown.length
            ? productionBreakdown[0].name
            : "Production data"}
        />
      </div>

      {/* VISUALIZATIONS - same card style as home page */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 25,
        marginBottom: 25
      }}>
        <Card
          title="🌾 Top Crops by Production"
          subtitle={`Highest producing crops${selectedYear ? ` in ${selectedYear}` : ""}`}
        >
          {cropLoading ? (
            <p style={{ color: TEXT }}>Loading crop visualization...</p>
          ) : (
            <BarList items={topProduction} valueKey="production" />
          )}
        </Card>

        <Card
          title="🌱 Top Crops by Area"
          subtitle={`Crops occupying the highest area${selectedYear ? ` in ${selectedYear}` : ""}`}
        >
          {cropLoading ? (
            <p style={{ color: TEXT }}>Loading crop visualization...</p>
          ) : (
            <BarList items={topArea} valueKey="area" color="#7FB28F" />
          )}
        </Card>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 25,
        marginBottom: 35
      }}>
        <Card
          title="📈 Top Crops by Yield"
          subtitle="Highest yielding crops in this district"
        >
          {cropLoading ? (
            <p style={{ color: TEXT }}>Loading crop visualization...</p>
          ) : (
            <BarList items={topYield} valueKey="yield" color="#2F6F50" />
          )}
        </Card>

        <Card
          title="📊 Production Distribution"
          subtitle="Production categories recorded for this district"
        >
          <BarList items={productionBreakdown} valueKey="value" color="#6FA783" />
        </Card>
      </div>

      {/* MANDAL VISUALIZATION */}
      <Card
        title="🏘️ Top Mandals by Records"
        subtitle={`Mandals with the highest agriculture records in ${data.district}`}
        style={{ marginBottom: 35 }}
      >
        {mandalsLoading ? (
          <p style={{ color: TEXT }}>Loading mandal data...</p>
        ) : (
          <BarList
            items={topMandalRecords}
            valueKey="records"
            color="#4E8F68"
          />
        )}
      </Card>

      {/* MANDAL TABLE */}
      <Card
        title="🌾 Mandal-wise Agriculture Data"
        subtitle={`Agriculture records and crop coverage across mandals in ${data.district}`}
        style={{ marginBottom: 35 }}
      >
        {mandalsLoading ? (
          <p style={{ color: TEXT }}>Loading mandal agriculture data...</p>
        ) : mandals.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              background: BG
            }}>
              <thead>
                <tr style={{ background: LIGHT, color: DARK }}>
                  <th style={{ padding: 14, textAlign: "left" }}>Mandal</th>
                  <th style={{ padding: 14, textAlign: "center" }}>Records</th>
                  <th style={{ padding: 14, textAlign: "center" }}>Crop Categories</th>
                </tr>
              </thead>
              <tbody>
                {mandals.map((mandal, index) => (
                  <tr key={mandal.mandal || mandal.name || index}
                    style={{ borderBottom: "1px solid #D5E3D4" }}>
                    <td style={{ padding: 13, color: DARK, fontWeight: 600 }}>
                      {mandal.mandal || mandal.name || "Unknown"}
                    </td>
                    <td style={{ padding: 13, textAlign: "center", color: GREEN }}>
                      {n(mandal.records || mandal.record_count).toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: 13, textAlign: "center", color: GREEN }}>
                      {n(mandal.crops || mandal.crop_count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: TEXT }}>No mandal-wise agriculture data available.</p>
        )}
      </Card>

      {/* CROP TABLE */}
      <Card
        title="🌿 Crop-wise Agriculture Data"
        subtitle={`Complete crop coverage for ${data.district}`}
      >
        {cropLoading ? (
          <p style={{ color: TEXT }}>Loading crop data...</p>
        ) : cropRows.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              background: BG
            }}>
              <thead>
                <tr style={{ background: LIGHT, color: DARK }}>
                  <th style={{ padding: 14, textAlign: "left" }}>Crop</th>
                  <th style={{ padding: 14, textAlign: "center" }}>Records</th>
                  <th style={{ padding: 14, textAlign: "center" }}>Area</th>
                  <th style={{ padding: 14, textAlign: "center" }}>Production</th>
                  <th style={{ padding: 14, textAlign: "center" }}>Yield</th>
                </tr>
              </thead>
              <tbody>
                {cropRows.map((crop, index) => (
                  <tr key={`${crop.name}-${index}`}
                    style={{ borderBottom: "1px solid #D5E3D4" }}>
                    <td style={{ padding: 13, color: DARK, fontWeight: 600 }}>
                      {crop.name}
                    </td>
                    <td style={{ padding: 13, textAlign: "center", color: GREEN }}>
                      {crop.records.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: 13, textAlign: "center", color: GREEN }}>
                      {crop.area ? crop.area.toLocaleString("en-IN") : "-"}
                    </td>
                    <td style={{ padding: 13, textAlign: "center", color: GREEN }}>
                      {crop.production ? crop.production.toLocaleString("en-IN") : "-"}
                    </td>
                    <td style={{ padding: 13, textAlign: "center", color: GREEN }}>
                      {crop.yield ? crop.yield.toLocaleString("en-IN") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: TEXT }}>No crop-wise data available.</p>
        )}
      </Card>
    </div>
  );
}

export default AgricultureDistrictDashboard;
