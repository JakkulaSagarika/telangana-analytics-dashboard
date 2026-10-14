import { useEffect, useState } from "react";
import API from "../services/api";

const formatNumber = (value) => value?.toLocaleString() || "0";

const DistrictBlock = ({ district, totalPatients, totalFacilities, facilities }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>
          {district.rank === 1 ? "🥇" : district.rank === 2 ? "🥈" : "🥉"}
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{district.name}</div>
          <div style={{ color: "#555", fontSize: 13 }}>
            Total Patients: {formatNumber(totalPatients)}
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#4B5563" }}>
          Facilities
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
          {formatNumber(totalFacilities)}
        </div>
      </div>
    </div>

    <ol style={{ margin: 0, paddingLeft: 22, color: "#444", fontSize: 13, lineHeight: 1.7 }}>
      {facilities.map((facility, index) => (
        <li key={facility.facility_name}>
          <span style={{ display: "inline-flex", justifyContent: "space-between", width: "100%" }}>
            <span>{facility.facility_name}</span>
            <span style={{ fontWeight: 700 }}>{formatNumber(facility.patients)}</span>
          </span>
        </li>
      ))}
    </ol>
  </div>
);

export default function TopPerformingDistricts({ filters }) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const districtRes = await API.get("district-ranking/", { params: filters });
        const topDistricts = (districtRes.data || []).slice(0, 8);

        const blocks = await Promise.all(
          topDistricts.map(async (district, index) => {
            const [facilityRes, districtSummaryRes] = await Promise.all([
              API.get("charts/facilities/", {
                params: { ...filters, district: district.district_name },
              }),
              API.get("district-summary/", {
                params: { ...filters, district: district.district_name },
              }),
            ]);

            return {
              rank: index + 1,
              district_name: district.district_name,
              total_patients: districtSummaryRes.data.total_patients || district.patients,
              total_facilities: districtSummaryRes.data.facilities || 0,
              facilities: (facilityRes.data || []).slice(0, 5),
            };
          })
        );

        if (mounted) setDistricts(blocks);
      } catch (err) {
        if (mounted) setError("Failed to load top districts.");
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [filters]);

  if (loading) return <p>Loading...</p>;

  if (error) return <p>{error}</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {districts.map((district, index) => (
        <div key={district.district_name}>
          <DistrictBlock
            district={{ name: district.district_name, rank: district.rank }}
            totalPatients={district.total_patients}
            totalFacilities={district.total_facilities}
            facilities={district.facilities}
          />
          {index !== districts.length - 1 && (
            <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.08)", margin: "0 0 18px" }} />
          )}
        </div>
      ))}
    </div>
  );
}
