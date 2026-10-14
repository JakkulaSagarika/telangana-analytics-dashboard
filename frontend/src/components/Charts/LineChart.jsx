import { useEffect, useState } from "react";
import API from "../../services/api";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function LineChart({ filters }) {

  const [chart, setChart] = useState(null);

  useEffect(() => {

    API.get("charts/monthly/", { params: filters })
      .then((res) => {

        const monthNames = {
          "01": "Jan",
          "02": "Feb",
          "03": "Mar",
          "04": "Apr",
          "05": "May",
          "06": "Jun",
          "07": "Jul",
          "08": "Aug",
          "09": "Sep",
          "10": "Oct",
          "11": "Nov",
          "12": "Dec",
        };

        setChart({

          labels: res.data.map((item) => {
            const [year, month] = item.month.split("_");
            return `${monthNames[month]} ${year}`;
          }),

          datasets: [
            {
              label: "Patients",

              data: res.data.map((item) => item.count),

              fill: true,

              tension: 0.45,

              borderWidth: 3,

              borderColor: "#FF5D8F",

              backgroundColor: "rgba(255,93,143,.18)",

              pointRadius: 6,

              pointHoverRadius: 10,

              pointHitRadius: 25,

              pointBackgroundColor: "#FF9F68",

              pointBorderColor: "#fff",

              pointBorderWidth: 2,
            },
          ],
        });

      });

  }, [filters]);

  if (!chart) return <p>Loading...</p>;

  return (
    <div style={{ height: "360px" }}>
      <Line
        data={chart}
        options={{
          responsive: true,
          maintainAspectRatio: false,

          interaction: {
            mode: "index",
            intersect: false,
          },

          hover: {
            mode: "index",
            intersect: false,
          },

          plugins: {
            legend: {
              position: "top",
              labels: {
                usePointStyle: true,
                color: "#555",
              },
            },

            tooltip: {
              enabled: true,
              mode: "index",
              intersect: false,

              backgroundColor: "#fff",
              titleColor: "#333",
              bodyColor: "#333",

              borderColor: "#FF9F68",
              borderWidth: 1,
            },
          },

          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "#666",
              },
            },

            y: {
              beginAtZero: true,
              grid: {
                color: "#F7D8E5",
              },
              ticks: {
                color: "#666",
              },
            },
          },
        }}
      />
    </div>
  );
}