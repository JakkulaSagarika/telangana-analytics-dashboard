import { useEffect, useState } from "react";
import axios from "axios";

import LocalGenderChart from "../components/LocalGenderChart";
import GenderBarChart from "../components/GenderBarChart";
import GPBirthDeathChart from "../components/GPBirthDeathChart";
import BirthDeathNav from "../components/BirthDeathNav";

import {
    FaSearch,
    FaMapMarkerAlt
} from "react-icons/fa";

import { useDistrict } from "../context/DistrictContext";

import "../styles/dashboard.css";


function Corporation(){

    const { selectedDistrict } = useDistrict();

    const [corporationData,setCorporationData] = useState([]);
    const [search,setSearch] = useState("");



    useEffect(()=>{


        if(!selectedDistrict) return;


        axios.get(

            `/api/birthdeath/corporations/${selectedDistrict}/`

        )

        .then(res=>{

            setCorporationData(res.data);

        })

        .catch(err=>{

            console.log(err);

        });


    },[selectedDistrict]);






    const filteredData = corporationData.filter(item=>

        item.name
        .toLowerCase()
        .includes(search.toLowerCase())

    );






    const totalBirths = filteredData.reduce(

        (sum,item)=>

        sum + Number(item.birth_total || 0),

        0

    );




    const totalDeaths = filteredData.reduce(

        (sum,item)=>

        sum + Number(item.death_total || 0),

        0

    );





    const totalMale = filteredData.reduce(

        (sum,item)=>

        sum + Number(item.birth_male || 0),

        0

    );





    const totalFemale = filteredData.reduce(

        (sum,item)=>

        sum + Number(item.birth_female || 0),

        0

    );





    const others = Math.max(

        totalBirths-totalMale-totalFemale,

        0

    );







return(


<div className="local-page">

    <BirthDeathNav />



{

!selectedDistrict ?



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

Choose a district from Dashboard to view Corporation data.

</p>



</div>



:



<>






{/* SEARCH */}



<div className="local-filter-card">


<div className="search-label">


<FaSearch/>


Search Municipal Corporation


</div>





<input


className="form-control"


placeholder="Search Corporation..."


value={search}


onChange={(e)=>setSearch(e.target.value)}


/>



</div>









{/* KPI */}



<div className="local-kpi-grid">



{


[

["Total Corporations",filteredData.length],

["Total Births",totalBirths],

["Total Deaths",totalDeaths],

["Male Births",totalMale],

["Female Births",totalFemale],

["Others",others]


]

.map((item,index)=>(



<div

className="local-kpi-card"

key={index}

>


<span>

{item[0]}

</span>



<h2>

{Number(item[1]).toLocaleString()}

</h2>



</div>



))


}



</div>









{/* TOP 10 GRAPH */}



<div className="local-chart-card mt-4">


<GPBirthDeathChart


data={filteredData}


/>


</div>









{/* GENDER SECTION */}



<div className="row g-4 mt-4">



<div className="col-lg-6">


<div className="local-chart-card">



<LocalGenderChart


male={totalMale}


female={totalFemale}


others={others}


/>



</div>


</div>








<div className="col-lg-6">


<div className="local-chart-card">



<GenderBarChart


births={totalBirths}


deaths={totalDeaths}


/>



</div>


</div>




</div>









{/* TABLE */}



<div className="local-table-card mt-4">



<h2 className="district-name">

{selectedDistrict}

</h2>



<p>

Municipal Corporation Details

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



filteredData.map((corp,index)=>(



<tr key={corp.id}>




<td>


<span className="serial-badge">


{index+1}


</span>


</td>







<td>


<strong>


{corp.name}


</strong>


</td>








<td>


<span className="stat-badge birth">


{corp.birth_total}


</span>


</td>








<td>


<span className="stat-badge male">


{corp.birth_male}


</span>


</td>








<td>


<span className="stat-badge female">


{corp.birth_female}


</span>


</td>








<td>


<span className="stat-badge death">


{corp.death_total}


</span>


</td>








<td>


<span className="male-death">


{corp.death_male}


</span>


</td>








<td>


<span className="female-death">


{corp.death_female}


</span>


</td>





</tr>




))



:



<tr>


<td colSpan="8" className="text-center">


No Corporation data available.


</td>


</tr>



}



</tbody>



</table>



</div>



</div>







</>


}



</div>



);


}


export default Corporation;
