import { useDistrict } from "../context/DistrictContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import KPICard from "../components/KPICard";
import TelanganaMap from "../components/TelanganaMap";
import BirthDeathChart from "../components/BirthDeathChart";
import DistrictTable from "../components/DistrictTable";
import DistrictInfo from "../components/DistrictInfo";


import {
    getDashboardData,
    getDistrictData,
    getDistrictChartData,
} from "../services/dashboardService";

import dashboardBg from "../../assets/images/health-dashboard.png";

import "../styles/dashboard.css";



function Dashboard(){
    const navigate = useNavigate();



const [dashboard,setDashboard] = useState({

    districts:0,
    births:0,
    deaths:0,

});



const [districtChart,setDistrictChart] = useState([]);




const {
    selectedDistrict,
    setSelectedDistrict

}=useDistrict();



const [districtInfo,setDistrictInfo]=useState(null);





// KPI DATA

useEffect(()=>{


    const fetchDashboard=async()=>{


        try{


            const data=await getDashboardData();

            setDashboard(data);


        }
        catch(error){

            console.log(error);

        }


    };


    fetchDashboard();


},[]);







// CHART DATA

useEffect(()=>{


    const fetchChart=async()=>{


        try{


            const data=await getDistrictChartData();



            const merged=data.birth_chart.map((birth)=>{


                const death=data.death_chart.find(

                    item=>item.district===birth.district

                );



                return {

                    district:birth.district,

                    births:birth.births,

                    deaths:death
                    ?
                    death.deaths
                    :
                    0

                };


            });



            setDistrictChart(merged);


        }
        catch(error){

            console.log(error);

        }



    };



    fetchChart();



},[]);








// SELECTED DISTRICT

useEffect(()=>{


    if(!selectedDistrict)
        return;



    const fetchDistrict=async()=>{


        try{


            const data=
            await getDistrictData(
                selectedDistrict
            );


            setDistrictInfo(data);


        }
        catch(error){

            console.log(error);

        }


    };



    fetchDistrict();



},[selectedDistrict]);







return(


<div
    className="dashboard-page"
    style={{
        backgroundImage: `linear-gradient(rgba(238,243,255,.82), rgba(232,224,255,.82), rgba(214,204,255,.82)), url(${dashboardBg})`,
    }}
>

<div className="container-fluid p-4">

                <div className="birthdeath-landing-nav">
                    <button
                        className="birthdeath-home-btn"
                        onClick={() => navigate("/")}
                    >
                         Back to Landing Page
                    </button>
                </div>





{/* KPI */}


<div className="row g-4 mb-4">



<div className="col-lg-4">

<KPICard

title="Total Births"

value={
dashboard.births.toLocaleString()
}

/>

</div>




<div className="col-lg-4">


<KPICard

title="Total Deaths"

value={
dashboard.deaths.toLocaleString()
}

/>


</div>




<div className="col-lg-4">


<KPICard

title="Districts"

value={
dashboard.districts
}

/>


</div>


</div>







{/* MAP */}


<div className="row g-4">



<div className="col-lg-8">


<div className="card map-card">


<TelanganaMap

setSelectedDistrict={
setSelectedDistrict
}

/>


</div>


</div>





<div className="col-lg-4">


<DistrictInfo

districtInfo={
districtInfo
}

/>


</div>



</div>









{/* GRAPH */}


<div className="row mt-4">


<div className="col-lg-12">


<BirthDeathChart

districtData={
districtChart
}

/>


</div>


</div>









{/* TABLE */}


<div className="table-card mt-4">


<DistrictTable/>


</div>





</div>


</div>


);



}


export default Dashboard;