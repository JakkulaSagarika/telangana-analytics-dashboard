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

function LocalBodiesChart({ districtInfo }) {

    if (!districtInfo) return null;

    const chartData = {

        labels: [

            "Gram Panchayats",

            "Municipalities",

            "Corporations",

        ],

        datasets: [

            {

                label: "Local Bodies",

                data: [

                    Number(districtInfo.gram_panchayats || 0),

                    Number(districtInfo.municipalities || 0),

                    Number(districtInfo.corporations || 0),

                ],

                backgroundColor: [
    "#E8A6C8",
    "#B8B2F5",
    "#6C4DFF",
],

                borderRadius: 14,

                borderSkipped: false,

                barThickness: 26,

            },

        ],

    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        indexAxis: "y",

        plugins: {

            legend: {

                display: false,

            },

            tooltip: {

                backgroundColor: "#FFFFFF",

                titleColor: "#5B46D3",

                bodyColor: "#555",

                borderColor: "#ECE6FF",

                borderWidth: 1,

                cornerRadius: 12,

                padding: 12,

                callbacks: {

                    label: (context) =>

                        Number(context.raw).toLocaleString(),

                },

            },

        },

        scales: {

            x: {

                beginAtZero: true,

                grid: {

                    color: "#EFE8FF",

                },

                ticks: {

                    color: "#5F4B8B",

                },

            },

            y: {

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

        },

    };

    return (

        <div
            className="glass-chart-card"
            style={{
                height: "360px",
            }}
        >

            <div className="glass-chart-header">

                <div>

                    <h3>Local Bodies Distribution</h3>

                    <p>
                        Administrative units in the selected district
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

export default LocalBodiesChart;