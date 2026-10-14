import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

function MonthlyTrendChart() {

    const data = {

        labels:[
            "Jan","Feb","Mar","Apr","May","Jun",
            "Jul","Aug","Sep","Oct","Nov","Dec"
        ],

        datasets:[

            {

                label:"Tests",

                data:[120,180,220,260,300,340,380,360,410,450,480,520],

                borderColor:"var(--chart-1)",

                backgroundColor:"rgba(79,70,229,.15)",

                fill:true,

                tension:.4,

                pointRadius:5,

                pointHoverRadius:7

            }

        ]

    };

    const options={

        responsive:true,

        maintainAspectRatio:false,

        plugins:{

            legend:{
                display:false
            }

        }

    };

    return(

        <div className="chart-card">

            <h3>Monthly Test Trend</h3>

            <div className="chart-wrapper">

                <Line
                    data={data}
                    options={options}
                />

            </div>

        </div>

    );

}

export default MonthlyTrendChart;