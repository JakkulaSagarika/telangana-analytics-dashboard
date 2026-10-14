import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

function GenderPieChart({
  data = [],
  type = "birth",
}) {

  const isBirth = type === "birth";

  const totalMale = data.reduce(
    (sum, item) =>
      sum +
      Number(
        isBirth
          ? item.birth_male
          : item.death_male
      ),
    0
  );

  const totalFemale = data.reduce(
    (sum, item) =>
      sum +
      Number(
        isBirth
          ? item.birth_female
          : item.death_female
      ),
    0
  );

  const totalOthers = data.reduce((sum, item) => {

    if (isBirth) {

      return sum + Number(item.birth_others || 0);

    }

    const others =
      Number(item.deaths || 0) -
      Number(item.death_male || 0) -
      Number(item.death_female || 0);

    return sum + others;

  }, 0);

  const chartData = {

    labels: [
      "Male",
      "Female",
      "Others",
    ],

    datasets: [

      {

        data: [
          totalMale,
          totalFemale,
          totalOthers,
        ],

        backgroundColor: [
          "#6C4DFF",
          "#F472B6",
          "#C8B5FF",
        ],

        hoverBackgroundColor: [
          "#5B46D3",
          "#EC4899",
          "#AE96FF",
        ],

        borderColor: "#FFFFFF",

        borderWidth: 4,

        hoverOffset: 12,

      },

    ],

  };

  const options = {

    responsive: true,

    maintainAspectRatio: false,

    cutout: "68%",

    animation: {

      animateRotate: true,

      duration: 1400,

    },

    plugins: {

      legend: {

        position: "bottom",

        labels: {

          color: "#6F628E",

          padding: 20,

          usePointStyle: true,

          pointStyle: "circle",

          font: {

            size: 13,

            weight: "600",

          },

        },

      },

      tooltip: {

        backgroundColor: "#FFFFFF",

        titleColor: "#5C45D5",

        bodyColor: "#666",

        borderColor: "#ECE6FF",

        borderWidth: 1,

        cornerRadius: 12,

        padding: 12,

        callbacks: {

          label: function (context) {

            return (
              context.label +
              " : " +
              Number(context.raw).toLocaleString()
            );

          },

        },

      },

    },

  };

  return (

    <div
      style={{
        height: "420px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >

      <Doughnut
        data={chartData}
        options={options}
      />

    </div>

  );

}

export default GenderPieChart;