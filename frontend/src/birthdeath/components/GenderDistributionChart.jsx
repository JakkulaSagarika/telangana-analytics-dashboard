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

function GenderDistributionChart({

    districtInfo,

    type = "birth",

}) {

    if (!districtInfo) return null;

    const info =
        type === "birth"
            ? districtInfo.births
            : districtInfo.deaths;

    const total = Number(info.total || 0);

    const male = Number(info.male || 0);

    const female = Number(info.female || 0);

    const others = Math.max(
        total - male - female,
        0
    );

    const chartData = {

        labels: [

            "Male",

            "Female",

            "Others",

        ],

        datasets: [

            {

                data: [

                    male,

                    female,

                    others,

                ],

                backgroundColor: [
    "#6C4DFF",
    "#E8A6C8",
    "#C9B8F5",
],

                borderColor: "#FFFFFF",

                borderWidth: 3,

                hoverOffset: 12,

            },

        ],

    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "72%",

        plugins: {

            legend: {

                position: "bottom",

                labels: {

                    color: "#5F4B8B",

                    boxWidth: 14,

                    padding: 18,

                    font: {

                        size: 13,

                        weight: "600",

                    },

                },

            },

            tooltip: {

                backgroundColor: "#FFFFFF",

                titleColor: "#5B46D3",

                bodyColor: "#555",

                borderColor: "#ECE6FF",

                borderWidth: 1,

                cornerRadius: 12,

                callbacks: {

                    label: (context) =>

                        `${context.label}: ${Number(
                            context.raw
                        ).toLocaleString()}`,

                },

            },

        },

    };

    return (

        <div
            className="glass-chart-card"
            style={{ height: "420px" }}
        >

            <div className="glass-chart-header">

                <div>

                    <h3>

                        {type === "birth"

                            ? "Birth Gender Distribution"

                            : "Death Gender Distribution"}

                    </h3>

                    <p>

                        Male • Female • Others

                    </p>

                </div>

            </div>

            <div
                style={{
                    height: "280px",
                }}
            >

                <Doughnut
                    data={chartData}
                    options={options}
                />

            </div>

        </div>

    );

}

export default GenderDistributionChart;