import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function BirthBarChart({ data = [] }) {
  const labels = data.map((item) => item.district);

  const values = data.map((item) => Number(item.births || 0));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Birth Registrations",
        data: values,

        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return "#7B61FF";

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );

          gradient.addColorStop(0, "#B89DFF");
          gradient.addColorStop(0.45, "#8B7DFF");
          gradient.addColorStop(1, "#6C4DFF");

          return gradient;
        },

        borderRadius: 14,
        borderSkipped: false,
        maxBarThickness: 26,
        hoverBackgroundColor: "#5C45D5",
      },
    ],
  };

  const options = {
    responsive: true,

    maintainAspectRatio: false,

    animation: {
      duration: 1400,
      easing: "easeOutQuart",
    },

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#FFFFFF",

        titleColor: "#5C45D5",

        bodyColor: "#666",

        borderColor: "#E8E1FF",

        borderWidth: 1,

        padding: 14,

        cornerRadius: 12,

        displayColors: false,

        callbacks: {
          label: (context) =>
            `Births : ${Number(context.raw).toLocaleString()}`,
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },

        ticks: {
          color: "#766A95",

          font: {
            size: 11,
            weight: "600",
          },

          maxRotation: 45,
          minRotation: 45,
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          color: "#766A95",

          font: {
            size: 12,
          },

          callback(value) {
            return Number(value).toLocaleString();
          },
        },

        grid: {
          color: "rgba(108,77,255,.08)",
          drawBorder: false,
        },
      },
    },
  };

  return (
    <div
      style={{
        height: "420px",
        position: "relative",
      }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default BirthBarChart;