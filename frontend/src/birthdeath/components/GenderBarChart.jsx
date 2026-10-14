function GenderBarChart({
    births,
    deaths
}) {


    const ratio = deaths > 0
        ? (births / deaths).toFixed(2)
        : 0;


    const difference =
        Number(births || 0) -
        Number(deaths || 0);



    return (

        <div className="registration-card">


            <h3 className="chart-title">

                Registration Summary

            </h3>



            <div className="summary-grid">


                <div className="summary-box birth-summary">


                    <span>
                        Total Births
                    </span>


                    <h2>
                        {Number(births).toLocaleString()}
                    </h2>


                    <small>
                        This District
                    </small>


                </div>




                <div className="summary-box death-summary">


                    <span>
                        Total Deaths
                    </span>


                    <h2>
                        {Number(deaths).toLocaleString()}
                    </h2>


                    <small>
                        This District
                    </small>


                </div>





                <div className="summary-box ratio-summary">


                    <span>
                        Birth - Death Ratio
                    </span>


                    <h2>
                        {ratio} : 1
                    </h2>


                    <small>
                        Births are higher
                    </small>


                </div>





                <div className="summary-box difference-summary">


                    <span>
                        Net Difference
                    </span>


                    <h2>
                        {difference.toLocaleString()}
                    </h2>


                    <small>
                        More Births
                    </small>


                </div>



            </div>



        </div>

    );

}


export default GenderBarChart;