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




function BirthDeathChart({districtData}){



if(!districtData || districtData.length===0){

    return null;

}





return(



<div className="chart-card">



<h3 className="chart-title">

Birth vs Death

</h3>



<p className="chart-subtitle">

District wise registrations comparison

</p>





<div

style={{

height:"650px",

width:"100%"

}}

>



<ResponsiveContainer

width="100%"

height="100%"

>



<BarChart

data={districtData}

layout="vertical"

margin={{

top:20,

right:40,

left:100,

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

dataKey="district"

width={120}

/>





<Tooltip/>





<Legend/>





<Bar

dataKey="births"

name="Births"

fill="#6C4DFF"

radius={[0,10,10,0]}

barSize={12}

/>





<Bar

dataKey="deaths"

name="Deaths"

fill="#EC4899"

radius={[0,10,10,0]}

barSize={12}

/>





</BarChart>



</ResponsiveContainer>



</div>




</div>


);


}


export default BirthDeathChart;