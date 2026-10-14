import React, { useEffect, useState } from "react";
import API from "../../services/api";
import DoughnutChart from "./DoughnutChart";
import PieChart from "./PieChart";

export default function CombinedDistribution({ filters }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    API.get("analytics-summary/", { params: filters })
      .then((res) => {
        if (mounted) setSummary(res.data || null);
      })
      .catch((err) => {
        console.error("Failed to fetch analytics-summary", err);
        if (mounted) setSummary(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => (mounted = false);
  }, [filters]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Top: Age Distribution (smaller) */}
      <div style={{ flex: "0 0 auto" }}>
        <DoughnutChart filters={filters} height={260} showInsights={false} className="combined-chart-canvas" />
      </div>

      {/* Bottom: Gender Distribution (reduced) */}
      <div style={{ flex: "0 0 auto" }}>
        <PieChart filters={filters} height={220} className="combined-chart-canvas" />
      </div>

      {/* Top-2 Age Groups summary */}
      <div
        style={{
          marginTop: 6,
          padding: 12,
          borderRadius: 12,
          background: "rgba(255,255,255,.8)",
          border: "1px solid rgba(0,0,0,.04)",
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 700, color: "#FF5D8F", marginBottom: 8 }}>
          Age Group Insights
        </div>

        {summary ? (
          <div>
            <div>
              <strong> Highest:</strong> {summary.highest_age_group} ({summary.highest_age_group_patients?.toLocaleString() || 0} Patients)
            </div>
            <div style={{ marginTop: 6 }}>
              <strong> Second:</strong> {summary.second_highest_age_group} ({summary.second_highest_age_group_patients?.toLocaleString() || 0} Patients)
            </div>
          </div>
        ) : (
          <div>No insights available.</div>
        )}
      </div>
    </div>
  );
}
