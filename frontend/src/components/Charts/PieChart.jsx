import { useEffect, useState } from "react";
import API from "../../services/api";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ filters, height = 420 }) {
  const [chart, setChart] = useState(null);

  useEffect(() => {
    API.get("charts/gender/", { params: filters }).then((res) => {
      const male =
        res.data.find((g) => g.gender?.toUpperCase() === "M")?.count || 0;

      const female =
        res.data.find((g) => g.gender?.toUpperCase() === "F")?.count || 0;

      setChart({
        labels: ["Male", "Female"],
        datasets: [
          {
            data: [male, female],
            backgroundColor: ["#FF9F68", "#FF5D8F"],
            hoverBackgroundColor: ["#FFB07A", "#FF7AA2"],
            borderColor: "#fff",
            borderWidth: 3,
            hoverOffset: 12,
          },
        ],
      });
    });
  }, [filters]);

  if (!chart) return <p>Loading...</p>;

  return (
    <div style={{ height }}>
      <Pie
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
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const value = context.raw;
                  const percent = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${value} (${percent}%)`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
}