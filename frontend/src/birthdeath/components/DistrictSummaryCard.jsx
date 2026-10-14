import bogatha from "../assets/images/bogatha.png";
import charminar from "../assets/images/charminar.png";
import golkonda from "../assets/images/golkonda.png";
import secretariat from "../assets/images/secretariat.png";


function DistrictSummaryCard({ districtInfo }) {


    if (!districtInfo) return null;



    const birthOthers = Math.max(
        Number(districtInfo.births.total || 0) -
        Number(districtInfo.births.male || 0) -
        Number(districtInfo.births.female || 0),
        0
    );



    const deathOthers = Math.max(
        Number(districtInfo.deaths.total || 0) -
        Number(districtInfo.deaths.male || 0) -
        Number(districtInfo.deaths.female || 0),
        0
    );




    return (

        <div className="district-kpi-section">



            {/* ================= BIRTH ================= */}


            <div
                className="district-kpi-card"
                style={{
                    backgroundImage:`url(${bogatha})`
                }}
            >

                <div className="kpi-overlay"></div>


                <div className="kpi-content">


                    <span>
                        Total Births
                    </span>


                    <h1>
                        {
                        Number(
                        districtInfo.births.total || 0
                        ).toLocaleString()
                        }
                    </h1>


                    <p>
                        Registered Births
                    </p>


                </div>


            </div>







            {/* ================= DEATH ================= */}


            <div
                className="district-kpi-card"
                style={{
                    backgroundImage:`url(${charminar})`
                }}
            >

                <div className="kpi-overlay"></div>


                <div className="kpi-content">


                    <span>
                        Total Deaths
                    </span>


                    <h1>
                        {
                        Number(
                        districtInfo.deaths.total || 0
                        ).toLocaleString()
                        }
                    </h1>


                    <p>
                        Registered Deaths
                    </p>


                </div>


            </div>







            {/* ================= OTHERS ================= */}


            <div
                className="district-kpi-card"
                style={{
                    backgroundImage:`url(${golkonda})`
                }}
            >

                <div className="kpi-overlay"></div>


                <div className="kpi-content">


                    <span>
                        Other Records
                    </span>


                    <h1>
                        {
                        (birthOthers + deathOthers)
                        .toLocaleString()
                        }
                    </h1>


                    <p>
                        Calculated Others
                    </p>


                </div>


            </div>







            {/* ================= LOCAL BODIES ================= */}


            <div
                className="district-kpi-card"
                style={{
                    backgroundImage:`url(${secretariat})`
                }}
            >

                <div className="kpi-overlay"></div>


                <div className="kpi-content">


                    <span>
                        Local Bodies
                    </span>



                    <div className="local-body-values">


                        <div>

                            <small>
                                GP
                            </small>

                            <h2>
                                {
                                Number(
                                districtInfo.gram_panchayats || 0
                                ).toLocaleString()
                                }
                            </h2>

                        </div>





                        <div>

                            <small>
                                Municipal
                            </small>

                            <h2>
                                {
                                Number(
                                districtInfo.municipalities || 0
                                ).toLocaleString()
                                }
                            </h2>

                        </div>





                        <div>

                            <small>
                                Corporation
                            </small>

                            <h2>
                                {
                                Number(
                                districtInfo.corporations || 0
                                ).toLocaleString()
                                }
                            </h2>

                        </div>



                    </div>



                    <p>
                        Administrative Units
                    </p>


                </div>


            </div>





        </div>

    );


}


export default DistrictSummaryCard;