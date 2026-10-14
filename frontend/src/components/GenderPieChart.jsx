import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function GenderPieChart() {

    // Read colors from your CSS theme
    const styles = getComputedStyle(document.documentElement);

    const chart1 = styles.getPropertyValue("--chart-1").trim();
    const chart2 = styles.getPropertyValue("--chart-2").trim();
    const chart3 = styles.getPropertyValue("--chart-3").trim();

    const data = {

        labels: [

            "Male",

            "Female",

            "Others"

        ],

        datasets: [

            {

                data: [

                    58,

                    40,

                    2

                ],

                backgroundColor: [

                    chart1,

                    chart2,

                    chart3

                ],

                borderWidth: 0,

                hoverOffset: 12

            }

        ]

    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {

                position: "bottom",

                labels: {

                    usePointStyle: true,

                    pointStyle: "circle",

                    padding: 20,

                    font: {

                        size: 14,

                        weight: "600"

                    }

                }

            }

        }

    };

    return (

        <div className="chart-card">

            <h3>Gender Distribution</h3>

            <div className="chart-wrapper">

                <Pie
                    data={data}
                    options={options}
                />

            </div>

        </div>

    );

}

export default GenderPieChart;