import React, { useEffect, useState } from "react";
import API from "../services/api";

const AnalyticsKPIs = () => {

    const [summary, setSummary] = useState({

        total_patients: 0,

        male: 0,

        female: 0,

        average_age: 0,

        facility_count: 0,

        district_count: 0,

        month_count: 0,

    });

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {

        try {

            const response = await API.get("/analytics-kpis/");

            setSummary(response.data);

        }

        catch (error) {

            console.error(error);

        }

    };

    const cards = [

        {
            title: "Total Patients",
            value: summary.total_patients,
        },

        {
            title: "Male Patients",
            value: summary.male,
        },

        {
            title: "Female Patients",
            value: summary.female,
        },

        {
            title: "Average Age",
            value: summary.average_age,
        },

        {
            title: "Total Facilities",
            value: summary.facility_count,
        },

        {
            title: "Total Districts",
            value: summary.district_count,
        },

        {
            title: "Total Months",
            value: summary.month_count,
        },

    ];

    return (

        <div className="analytics-kpi-grid">

            {cards.map((card, index) => (

                <div
                    key={index}
                    className="analytics-kpi-card"
                >

                    <div className="analytics-kpi-content">

                        <span className="analytics-kpi-title">

                            {card.title}

                        </span>

                        <h2 className="analytics-kpi-value">

                            {card.value}

                        </h2>

                    </div>

                </div>

            ))}

        </div>

    );

};

export default AnalyticsKPIs;