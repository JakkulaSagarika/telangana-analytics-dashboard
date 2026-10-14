import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

function DistrictComparisonChart() {

    // Read colors from your theme
    const styles = getComputedStyle(document.documentElement);

    const chart1 = styles.getPropertyValue("--chart-1").trim();
    const chart2 = styles.getPropertyValue("--chart-2").trim();
    const chart3 = styles.getPropertyValue("--chart-3").trim();
    const chart4 = styles.getPropertyValue("--chart-4").trim();
    const chart5 = styles.getPropertyValue("--chart-5").trim();

    const data = {

        labels: [

            "Hyderabad",
            "Warangal",
            "Khammam",
            "Karimnagar",
            "Nizamabad"

        ],

        datasets: [

            {

                label: "Tests",

                data: [

                    920,
                    760,
                    640,
                    540,
                    470

                ],

                backgroundColor: [

                    chart1,
                    chart2,
                    chart3,
                    chart4,
                    chart5

                ],

                borderRadius: 10,

                borderSkipped: false,

                maxBarThickness: 45

            }

        ]

    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                display: false

            }

        },

        scales: {

            x: {

                grid: {

                    display: false

                },

                ticks: {

                    color: "#475569",

                    font: {

                        size: 13,

                        weight: "600"

                    }

                }

            },

            y: {

                beginAtZero: true,

                grid: {

                    color: "#E2E8F0"

                },

                ticks: {

                    color: "#475569"

                }

            }

        }

    };

    return (

        <div className="chart-card">

            <h3>District Comparison</h3>

            <div className="chart-wrapper">

                <Bar
                    data={data}
                    options={options}
                />

            </div>

        </div>

    );

}

export default DistrictComparisonChart;