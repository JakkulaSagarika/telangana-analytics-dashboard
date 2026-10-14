import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";



function LocalGenderChart({
    male,
    female,
    others
}) {



    const data = [

        {
            name:"Male",
            value:Number(male || 0)
        },


        {
            name:"Female",
            value:Number(female || 0)
        },


        {
            name:"Others",
            value:Number(others || 0)
        }

    ];





    const COLORS = [

    "#6C63FF",   // Male - dashboard purple

    "#EC4899",   // Female - dashboard pink

    "#BFD9FF"    // Others - soft blue theme

];







    return(


        <div>


            <h3 className="chart-title">

                Gender Distribution

            </h3>


            <p className="chart-subtitle">

                Birth registrations by gender

            </p>





            <div

            style={{

                height:"350px"

            }}

            >



            <ResponsiveContainer

                width="100%"

                height="100%"

            >



            <PieChart>



            <Pie

                data={data}

                dataKey="value"

                nameKey="name"

                cx="50%"

                cy="50%"

                innerRadius={70}

                outerRadius={110}

                paddingAngle={5}


            >



            {

                data.map((entry,index)=>(


                    <Cell

                        key={index}

                        fill={COLORS[index]}

                    />


                ))

            }



            </Pie>





            <Tooltip

            contentStyle={{

                background:"#FFFFFF",

                borderRadius:"15px",

                border:"1px solid #E8E0FF",

                boxShadow:
                "0 10px 25px rgba(108,77,255,.12)"

            }}

            />





            <Legend

            verticalAlign="bottom"

            height={40}

            />





            </PieChart>



            </ResponsiveContainer>



            </div>





        </div>


    );


}


export default LocalGenderChart;