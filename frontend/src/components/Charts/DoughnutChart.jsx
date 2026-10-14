import { useEffect, useState } from "react";
import API from "../../services/api";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ filters, height = 460, showInsights = true }) {
  const [chart, setChart] = useState(null);
  const [insights, setInsights] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    API.get("charts/age-groups/", {
      params: filters,
    }).then((res) => {
      setChart({
        labels: Object.keys(res.data),

        datasets: [
          {
            data: Object.values(res.data),

            backgroundColor: [
              "#FF9F68",
              "#FF5D8F",
              "#C084FC",
              "#7C83FD",
              "#66D9E8",
            ],

            hoverBackgroundColor: [
              "#FFB07A",
              "#FF7AA2",
              "#D4A3FF",
              "#959BFF",
              "#8AE5F0",
            ],

            borderColor: "#fff",
            borderWidth: 3,
            cutout: "60%",
            hoverOffset: 10,
          },
        ],
      });
    });

    API.get("charts/age-insights/", {
      params: filters,
    }).then((res) => {
      setInsights(res.data);
    });

    // also fetch analytics summary to get top-2 age groups (updates with filters)
    API.get("analytics-summary/", { params: filters }).then((res) => {
      setSummary(res.data || null);
    }).catch(() => {
      setSummary(null);
    });
  }, [filters]);

  if (!chart || !insights) return <p>Loading...</p>;

  return (
    <>
      <div style={{ height }}>
        <Doughnut
          className="combined-chart-canvas"
          data={chart}
          options={{
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
              legend: {
                position: "right",
                align: "center",
                labels: {
                  usePointStyle: true,
                  padding: 10,
                  color: "#555",
                  font: {
                    size: 12,
                    weight: "bold",
                  },
                },
              },

              tooltip: {
                backgroundColor: "#fff",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "#FF9F68",
                borderWidth: 1,

                callbacks: {
                  label: function (context) {
                    const total = context.dataset.data.reduce(
                      (a, b) => a + b,
                      0
                    );

                    const value = context.raw;

                    const percent = (
                      (value / total) *
                      100
                    ).toFixed(1);

                    return `${context.label}: ${value} (${percent}%)`;
                  },
                },
              },
            },
          }}
        />
      </div>

      {showInsights && (
        <div
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 16,
            background: "rgba(255,255,255,.65)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,.5)",
            boxShadow: "0 8px 24px rgba(0,0,0,.08)",
            fontSize: 14,
            lineHeight: 1.8,
          }}
        >
          <h5
            style={{
              marginBottom: 12,
              color: "#FF5D8F",
              fontWeight: 700,
            }}
          >
            Age Group Insights
          </h5>

          {
            // Prefer summary top-2 (updates with filters). Fallback to age-insights if needed.
          }

          {summary ? (
            <div>
              <p>
                Highest Age Group: <b>{summary.highest_age_group}</b> ({summary.highest_age_group_patients?.toLocaleString() || 0} Patients)
              </p>
              <p>
                Second Highest: <b>{summary.second_highest_age_group}</b> ({summary.second_highest_age_group_patients?.toLocaleString() || 0} Patients)
              </p>
            </div>
          ) : insights ? (
            // backend `charts/age-insights/` returns `largest_group` as [group, stats]
            <div>
              <p>
                Highest Age Group: <b>{insights.largest_group?.[0] || "-"}</b> ({insights.largest_group?.[1]?.patients?.toLocaleString() || 0} Patients)
              </p>
              <p>
                Second Highest: <b>{insights.second_largest_group?.[0] || "-"}</b> ({insights.second_largest_group?.[1]?.patients?.toLocaleString() || 0} Patients)
              </p>
            </div>
          ) : (
            <p>Loading insights...</p>
          )}
        </div>
      )}
    </>
  );
}