import { useEffect, useState } from "react";
import axios from "axios";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";


function ChartCard({ title }) {


  const [chartData, setChartData] = useState(null);



  useEffect(() => {

    axios
      .get("/api/birthdeath/charts/")
      .then((res)=>{

        setChartData(res.data);

      })
      .catch((err)=>{

        console.log(err);

      });


  }, []);




  if(!chartData){

    return(

      <div
        className="card shadow-sm border-0"
        style={{
          borderRadius:"22px",
          height:"420px"
        }}
      >

        <div
          className="card-body d-flex justify-content-center align-items-center"
          style={{
            color:"#6C4DFF",
            fontWeight:"600"
          }}
        >

          Loading Chart...

        </div>

      </div>

    );

  }





  const COLORS=[

    "#6C63FF",
    "#EC4899"

  ];



  const genderData=[

    {

      name:"Male",

      value:Number(
        chartData.gender.male || 0
      )

    },


    {

      name:"Female",

      value:Number(
        chartData.gender.female || 0
      )

    }

  ];





  return(


    <div

      className="card shadow-sm border-0"

      style={{

        borderRadius:"22px",

        height:"420px",

        overflow:"hidden"

      }}

    >



      <div className="card-body">


        <h5

          style={{

            color:"#5B46D3",

            fontWeight:"700",

            marginBottom:"20px",

            borderBottom:
            "2px solid #ECE8FF",

            paddingBottom:"12px"

          }}

        >

          Gender Distribution


        </h5>





        <ResponsiveContainer

          width="100%"

          height={250}

        >


          <PieChart>


            <Pie

              data={genderData}

              dataKey="value"

              nameKey="name"

              outerRadius={90}

              innerRadius={50}

              paddingAngle={4}


            >


              {

                genderData.map(
                  (item,index)=>(

                    <Cell

                      key={index}

                      fill={COLORS[index]}

                    />

                  )

                )

              }


            </Pie>


            <Tooltip />


          </PieChart>


        </ResponsiveContainer>





        <div

          style={{

            textAlign:"center",

            color:"#6B7280"

          }}

        >


          <p>

            <b style={{color:"#6C63FF"}}>

              Male Births:

            </b>

            {" "}

            {chartData.gender.male.toLocaleString()}


          </p>



          <p>

            <b style={{color:"#EC4899"}}>

              Female Births:

            </b>

            {" "}

            {chartData.gender.female.toLocaleString()}


          </p>



        </div>




      </div>


    </div>


  );

}


export default ChartCard;
