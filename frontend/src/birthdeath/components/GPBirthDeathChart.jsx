import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend
} from "recharts";


function GPBirthDeathChart({data}) {


    if(!data || data.length === 0){
        return null;
    }



    // TOP 10 BY BIRTHS

    const top10 = [...data]

        .sort(
            (a,b)=>
            Number(b.birth_total || 0) -
            Number(a.birth_total || 0)
        )

        .slice(0,10)

        .map(item=>({

            name:item.name,

            births:Number(item.birth_total || 0),

            deaths:Number(item.death_total || 0)

        }));





    return (

        <div className="chart-card">


            <h3 className="chart-title">

                Top 10 Gram Panchayats

            </h3>



            <p className="chart-subtitle">

                Highest registrations by births

            </p>





            <div

                style={{

                    height:"520px"

                }}

            >



            <ResponsiveContainer

                width="100%"

                height="100%"

            >



            <BarChart

                data={top10}

                layout="vertical"

                margin={{

                    top:20,

                    right:40,

                    left:120,

                    bottom:20

                }}

            >



            <CartesianGrid

                stroke="#EFE8FF"

            />




            <XAxis

                type="number"

            />




            <YAxis

                type="category"

                dataKey="name"

                width={120}

                tick={{

                    fill:"#756B98",

                    fontSize:12

                }}

            />





            <Tooltip

                contentStyle={{

                    background:"#FFFFFF",

                    borderRadius:"15px",

                    border:"1px solid #E9DDFF"

                }}

            />




            <Legend/>





            <Bar

                dataKey="births"

                name="Births"

                fill="#6C4DFF"

                radius={[0,10,10,0]}

                barSize={14}

            />





            <Bar

                dataKey="deaths"

                name="Deaths"

                fill="#EC4899"

                radius={[0,10,10,0]}

                barSize={14}

            />





            </BarChart>



            </ResponsiveContainer>



            </div>


        </div>


    );

}


export default GPBirthDeathChart;