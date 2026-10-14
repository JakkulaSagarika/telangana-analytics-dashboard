import { useEffect, useState } from "react";
import API from "../../services/api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BarChart({ filters }) {
  const [chart, setChart] = useState();

  useEffect(() => {
    API.get("charts/district/", { params: filters }).then((res) => {
      setChart({
        labels: res.data.map((x) => x.district_name),
        datasets: [{
          data: res.data.map((x) => x.total),
          backgroundColor: [
            "#FF9F68",
            "#FF7AA2",
            "#D8A7FF",
            "#8B5CF6",
            "#5BC0EB",
            "#FFB86B"
          ],
          borderRadius: 12,
          districtInfo: res.data,
        }],
      });
    });
  }, [filters]);

  if (!chart) return <p>Loading...</p>;

  return (
    <div style={{ height: 380 }}>
      <Bar
        data={chart}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1200 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#fff",
              titleColor: "#444",
              bodyColor: "#444",
              borderColor: "#FF9F68",
              borderWidth: 1,
              callbacks: {
                title: (c) =>
                  chart.datasets[0].districtInfo[c[0].dataIndex].district_name,
                label: (c) => {
                  const d = chart.datasets[0].districtInfo[c.dataIndex];
                  return [
                    `Patients : ${d.total}`,
                    `Male : ${d.male}`,
                    `Female : ${d.female}`,
                    `RBC : ${d.avg_rbc}`,
                    `WBC : ${d.avg_wbc}`,
                    `Platelets : ${d.avg_platelets}`,
                  ];
                },
              },
            },
          },
          scales: {
            x: {
              ticks: { display: false },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              grid: { color: "#F8D9E8" },
            },
          },
        }}
      />
    </div>
  );
}