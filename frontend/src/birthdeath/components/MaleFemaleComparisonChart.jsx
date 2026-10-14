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

function MaleFemaleComparisonChart({ districtInfo }) {

    if (!districtInfo) return null;

    const chartData = {

        labels: [

            "Births",

            "Deaths",

        ],

        datasets: [

            {

                label: "Male",

                data: [

                    Number(districtInfo.births.male || 0),

                    Number(districtInfo.deaths.male || 0),

                ],

                backgroundColor: "#6C4DFF",

                borderRadius: 12,

                borderSkipped: false,

                maxBarThickness: 34,

            },

            {

                label: "Female",

                data: [

                    Number(districtInfo.births.female || 0),

                    Number(districtInfo.deaths.female || 0),

                ],

                backgroundColor:"#E8A6C8",

                borderRadius: 12,

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

                position: "top",

                labels: {

                    color: "#5F4B8B",

                    usePointStyle: true,

                    pointStyle: "circle",

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

                        `${context.dataset.label}: ${Number(
                            context.raw
                        ).toLocaleString()}`,

                },

            },

        },

        scales: {

            x: {

                grid: {

                    display: false,

                },

                ticks: {

                    color: "#5F4B8B",

                    font: {

                        weight: "600",

                    },

                },

            },

            y: {

                beginAtZero: true,

                grid: {

                    color: "#EFE8FF",

                },

                ticks: {

                    color: "#5F4B8B",

                },

            },

        },

    };

    return (

        <div
            className="glass-chart-card"
            style={{ height: "360px" }}
        >

            <div className="glass-chart-header">

                <div>

                    <h3>Male vs Female Comparison</h3>

                    <p>
                        Birth and Death registrations by gender
                    </p>

                </div>

            </div>

            <Bar

                data={chartData}

                options={options}

            />

        </div>

    );

}

export default MaleFemaleComparisonChart;