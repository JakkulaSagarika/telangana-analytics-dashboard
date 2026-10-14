import { useEffect, useState } from "react";
import axios from "axios";

import LocalGenderChart from "../components/LocalGenderChart";
import GPBirthDeathChart from "../components/GPBirthDeathChart";
import BirthDeathNav from "../components/BirthDeathNav";

import {
    FaSearch,
    FaMapMarkerAlt
} from "react-icons/fa";

import { useDistrict } from "../context/DistrictContext";

import "../styles/dashboard.css";
import GenderBarChart from "../components/GenderBarChart";


function GramPanchayat(){

    const { selectedDistrict } = useDistrict();

    const [gpData,setGpData] = useState([]);
    const [search,setSearch] = useState("");


    useEffect(()=>{

        if(!selectedDistrict) return;

        axios.get(
            `/api/birthdeath/gram-panchayats/${selectedDistrict}/`
        )
        .then(res=>setGpData(res.data))
        .catch(err=>console.log(err));

    },[selectedDistrict]);



    const filteredData = gpData.filter(item=>

        item.name
        .toLowerCase()
        .includes(search.toLowerCase())

    );



    const totalBirths = filteredData.reduce(
        (sum,item)=>sum + Number(item.birth_total || 0),0
    );


    const totalDeaths = filteredData.reduce(
        (sum,item)=>sum + Number(item.death_total || 0),0
    );


    const totalMale = filteredData.reduce(
        (sum,item)=>sum + Number(item.birth_male || 0),0
    );


    const totalFemale = filteredData.reduce(
        (sum,item)=>sum + Number(item.birth_female || 0),0
    );


    const birthOthers = Math.max(
        totalBirths-totalMale-totalFemale,
        0
    );




return (

<div className="local-page">

    <BirthDeathNav />

{

!selectedDistrict ? (

<div className="local-filter-card text-center">

<FaMapMarkerAlt
style={{
fontSize:"45px",
color:"#6C4DFF"
}}
/>

<h3 style={{color:"#5B46D3"}}>
Select a District
</h3>

<p>
Choose a district from Dashboard to view Gram Panchayat data.
</p>

</div>


)

:

(

<>


{/* SEARCH */}

<div className="local-filter-card">

<div className="search-label">

<FaSearch/>

Search Gram Panchayat

</div>


<input

className="form-control"

placeholder="Search Gram Panchayat..."

value={search}

onChange={(e)=>setSearch(e.target.value)}

/>


</div>




{/* KPI */}

<div className="local-kpi-grid">


{[

["Total Gram Panchayats",filteredData.length],

["Total Births",totalBirths],

["Total Deaths",totalDeaths],

["Male Births",totalMale],

["Female Births",totalFemale],

["Others",birthOthers]

].map((item,index)=>(


<div className="local-kpi-card" key={index}>

<span>{item[0]}</span>

<h2>
{Number(item[1]).toLocaleString()}
</h2>

</div>


))}


</div>






{/* TOP 10 GRAPH */}

<div className="local-chart-card mt-4">


<GPBirthDeathChart

data={filteredData}

/>


</div>
{/* GENDER VISUALIZATION */}

<div className="row g-4 mt-4">


<div className="col-lg-6">


<div className="local-chart-card">


<LocalGenderChart

male={totalMale}

female={totalFemale}

others={birthOthers}

/>


</div>


</div>




<div className="col-lg-6">


<GenderBarChart

births={totalBirths}

deaths={totalDeaths}

/>


</div>


</div>

{/* TABLE */}

<div className="local-table-card mt-4">


<h2 className="district-name">

{selectedDistrict}

</h2>


<p>
Gram Panchayat Details
</p>



<div className="table-responsive">


<table className="table district-table">


<thead>

<tr>

<th>S.No</th>
<th>Name</th>
<th>Births</th>
<th>Male</th>
<th>Female</th>
<th>Deaths</th>
<th>Male Deaths</th>
<th>Female Deaths</th>

</tr>

</thead>



<tbody>


{

filteredData.length ?


filteredData.map((gp,index)=>(


<tr key={gp.id}>


<td>

<span className="serial-badge">

{index+1}

</span>

</td>



<td>

<strong>

{gp.name}

</strong>

</td>



<td>

<span className="stat-badge birth">

{gp.birth_total}

</span>

</td>



<td>

<span className="stat-badge male">

{gp.birth_male}

</span>

</td>



<td>

<span className="stat-badge female">

{gp.birth_female}

</span>

</td>



<td>

<span className="stat-badge death">

{gp.death_total}

</span>

</td>



<td>

<span className="male-death">

{gp.death_male}

</span>

</td>



<td>

<span className="female-death">

{gp.death_female}

</span>

</td>



</tr>


))


:

<tr>

<td colSpan="8" className="text-center">

No Gram Panchayat data available.

</td>

</tr>


}


</tbody>


</table>


</div>


</div>


</>


)


}


</div>

);

}


export default GramPanchayat;
