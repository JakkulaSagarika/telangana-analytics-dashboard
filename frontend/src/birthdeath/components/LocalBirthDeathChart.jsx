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



function LocalBirthDeathChart({births, deaths}){


    const data={


        labels:[
            "Births",
            "Deaths"
        ],


        datasets:[

            {

                label:"Count",

                data:[
                    births,
                    deaths
                ],


                backgroundColor:[

                    "#6C4DFF",
                    "#F472B6"

                ],


                borderRadius:15,

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

        },


        scales:{


            x:{

                ticks:{

                    color:"#756B98"

                },

                grid:{

                    display:false

                }

            },



            y:{

                beginAtZero:true,

                ticks:{

                    color:"#756B98"

                }

            }


        }



    };



    return(


        <div className="local-chart-card">


            <h3
            style={{
                color:"#5B46D3",
                marginBottom:"20px"
            }}
            >

                Birth vs Death

            </h3>



            <div
            style={{
                height:"350px"
            }}
            >

                <Bar
                data={data}
                options={options}
                />

            </div>



        </div>


    );

}



export default LocalBirthDeathChart;