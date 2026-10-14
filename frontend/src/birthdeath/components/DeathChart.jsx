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

function DeathChart({ data = [] }) {

  const labels = data.map((item) => item.district);

  const deaths = data.map((item) =>
    Number(item.deaths || 0)
  );

  const chartData = {

    labels,

    datasets: [

      {

        label: "Deaths",

        data: deaths,

        backgroundColor: "#6C4DFF",

        borderRadius: 10,

        borderSkipped: false,

        maxBarThickness: 34,

      },

    ],

  };

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {

        display: false,

      },

      tooltip: {

        backgroundColor: "#FFFFFF",

        titleColor: "#5B46D3",

        bodyColor: "#666",

        borderColor: "#E8E0FF",

        borderWidth: 1,

        cornerRadius: 12,

        padding: 12,

        callbacks: {

          label: (context) =>
            "Deaths : " +
            Number(context.raw).toLocaleString(),

        },

      },

    },

    scales: {

      x: {

        ticks: {

          color: "#6F628E",

          maxRotation: 45,

          minRotation: 45,

        },

        grid: {

          display: false,

        },

      },

      y: {

        beginAtZero: true,

        ticks: {

          color: "#6F628E",

        },

        grid: {

          color: "#ECE6FF",

        },

      },

    },

  };

  return (

    <div
      style={{
        height: "420px",
      }}
    >

      <Bar
        data={chartData}
        options={options}
      />

    </div>

  );

}

export default DeathChart;