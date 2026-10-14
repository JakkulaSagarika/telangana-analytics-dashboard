import { useEffect, useState } from "react";
import axios from "axios";

import {
    FaMapMarkedAlt,
    FaSearch,
} from "react-icons/fa";


import GenderDistributionChart from "../components/GenderDistributionChart";
import MaleFemaleComparisonChart from "../components/MaleFemaleComparisonChart";
import LocalBodiesChart from "../components/LocalBodiesChart";
import DistrictSummaryCard from "../components/DistrictSummaryCard";
import BirthDeathNav from "../components/BirthDeathNav";


import "../styles/districtAnalysis.css";



function DistrictAnalysis(){


    const [districts,setDistricts] = useState([]);

    const [selectedDistrict,setSelectedDistrict] = useState("");

    const [districtInfo,setDistrictInfo] = useState(null);



    useEffect(()=>{

        loadDistricts();

    },[]);



    useEffect(()=>{

        if(selectedDistrict){

            loadDistrictInfo(selectedDistrict);

        }

    },[selectedDistrict]);





    const loadDistricts = async()=>{

        try{

            const res = await axios.get(
                "/api/birthdeath/districts/"
            );

            setDistricts(res.data);

        }

        catch(error){

            console.log(error);

        }

    };






    const loadDistrictInfo = async(district)=>{


        try{


            const res = await axios.get(

                `/api/birthdeath/district/${district}/`

            );


            console.log(
                "API DISTRICT DATA:",
                res.data
            );


            setDistrictInfo(res.data);


        }

        catch(error){

            console.log(error);

        }


    };






    return(


        <div className="district-dashboard">



            <div className="district-background">

                <div className="blob blob1"></div>

                <div className="blob blob2"></div>

                <div className="blob blob3"></div>

            </div>






            <div className="district-content">

                <BirthDeathNav />





                <div className="district-page-header">


                    <div className="page-title">


                        <div className="page-icon">

                            <FaMapMarkedAlt/>

                        </div>



                        <div>

                            <h1>
                                District Analysis
                            </h1>


                            <p>
                                Telangana District Birth & Death Analytics
                            </p>

                        </div>


                    </div>





                    <div className="district-counter">

                        <h2>
                            {districts.length}
                        </h2>


                        <span>
                            Districts
                        </span>


                    </div>



                </div>







                <div className="glass-search-card">


                    <div className="search-label">


                        <FaSearch/>


                        <span>
                            Select District
                        </span>


                    </div>





                    <select

                        className="glass-select"

                        value={selectedDistrict}

                        onChange={(e)=>
                            setSelectedDistrict(
                                e.target.value
                            )
                        }

                    >


                        <option value="">
                            Choose District
                        </option>



                        {
                            districts.map((item,index)=>(

                                <option

                                    key={index}

                                    value={item.district}

                                >

                                    {item.district}

                                </option>


                            ))
                        }


                    </select>



                </div>









                {!districtInfo ? (


                    <div className="empty-state">


                        <FaMapMarkedAlt className="empty-icon"/>


                        <h2>
                            Select a District
                        </h2>


                        <p>
                            Choose a district from the dropdown above to view analytics.
                        </p>


                    </div>



                ) : (


                    <>


                        <DistrictSummaryCard

                            districtInfo={districtInfo}

                        />





                        {/* Gender + Male Female Charts */}


                        <div className="row g-4 mt-4 mb-5">


                            <div className="col-xl-6">


                                <GenderDistributionChart

                                    districtInfo={districtInfo}

                                    type="birth"

                                />


                            </div>





                            <div className="col-xl-6">


                                <MaleFemaleComparisonChart

                                    districtInfo={districtInfo}

                                />


                            </div>


                        </div>







                        {/* Local Bodies Chart */}


                        <div className="row g-4 mb-5">


                            <div className="col-xl-12">


                                <LocalBodiesChart

                                    districtInfo={districtInfo}

                                />


                            </div>


                        </div>



                    </>


                )}



            </div>



        </div>


    );


}


export default DistrictAnalysis;
