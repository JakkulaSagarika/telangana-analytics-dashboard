import React, { useEffect, useState } from "react";
import API from "../services/api";

const cardStyle = {
    background:
        "linear-gradient(135deg,#F58DAA 0%,#EFA3C3 55%,#D8AFE9 100%)",

    borderRadius: "20px",

    padding: "16px",

    minHeight: "110px",

    display: "flex",

    flexDirection: "column",

    justifyContent: "space-between",

    textAlign: "center",

    overflow: "hidden",

    boxShadow: "0 8px 18px rgba(214,171,233,.18)",

    transition: ".35s",
};

const titleStyle = {
    color: "#FFFFFF",

    fontSize: ".95rem",

    fontWeight: "600",

    lineHeight: "1.2",

    marginBottom: "6px",
};

const dividerStyle = {
    width: "48px",

    height: "2px",

    background: "rgba(255,255,255,.45)",

    borderRadius: "999px",

    margin: "0 auto 10px",
};

const valueStyle = {
    color: "#FFFFFF",

    fontSize: "1.85rem",

    fontWeight: "600",

    lineHeight: "1.05",

    marginBottom: "8px",

    whiteSpace: "nowrap",

    overflow: "hidden",

    textOverflow: "ellipsis",
};

const textStyle = {
    color: "rgba(255,255,255,.92)",

    fontSize: ".78rem",

    lineHeight: "1.35",
};

const formatMonth = (month) => {

    if (!month) return "-";

    return month.replace("_", " / ");

};

const InsightCard = ({ title, value, description }) => (

    <div style={cardStyle}>

        <div>

            <div style={titleStyle}>
                {title}
            </div>

            <div style={dividerStyle}></div>

            <div style={valueStyle}>
                {value}
            </div>

        </div>

        <div style={textStyle}>
            {description}
        </div>

    </div>

);

const SmartInsights = () => {

    const [insights, setInsights] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadInsights();

    }, []);

    const loadInsights = async () => {

        try {

            // primary summary endpoint
            const res = await API.get("analytics-summary/");

            let data = res.data || {};

            // If backend didn't provide top age groups, fetch age-group counts and compute fallback
            if (!data.highest_age_group || data.highest_age_group_patients === undefined) {

                try {
                    const ag = await API.get("charts/age-groups/");

                    // ag.data expected as object: { '0-18': n, '19-35': n, ... }
                    const entries = Object.entries(ag.data || {});

                    const sorted = entries.sort((a, b) => b[1] - a[1]);

                    if (sorted.length >= 1) {
                        data.highest_age_group = sorted[0][0];
                        data.highest_age_group_patients = sorted[0][1];
                    }

                    if (sorted.length >= 2) {
                        data.second_highest_age_group = sorted[1][0];
                        data.second_highest_age_group_patients = sorted[1][1];
                    }

                } catch (err) {
                    console.error("Failed to fetch age groups fallback", err);
                }

            }

            setInsights(data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div
                style={{
                    height: 180,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#E76BA6",
                    fontWeight: 600,
                    fontSize: "18px",
                }}
            >
                Loading Insights...
            </div>

        );

    }
        return (

        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                gap: "16px",
                width: "100%",
            }}
        >

            <InsightCard
                title="Highest Month"
                value={
                    <span style={{ fontSize: "2.2rem", whiteSpace: "nowrap" }}>
                        {formatMonth(insights.highest_growth_month)}
                    </span>
                }
                description="Highest patient registrations."
            />

            <InsightCard
                title="Top District"
                value={
                    <span style={{ fontSize: "2rem", whiteSpace: "nowrap" }}>
                        {insights.highest_patient_district}
                    </span>
                }
                description="District with the highest patients."
            />

            <InsightCard
                title="Lowest Month"
                value={
                    <span style={{ fontSize: "2.2rem", whiteSpace: "nowrap" }}>
                        {formatMonth(insights.lowest_patient_month)}
                    </span>
                }
                description="Lowest patient registrations."
            />

            <InsightCard
                title="Top Facility"
                value={
                    <span style={{ fontSize: "1.8rem", whiteSpace: "nowrap" }}>
                        {insights.highest_testing_facility}
                    </span>
                }
                description="Highest patient volume."
            />            <InsightCard
                title="Male : Female"
                value={
                    <span style={{ fontSize: "1.85rem", whiteSpace: "nowrap" }}>
                        {insights.male_percent}% : {insights.female_percent}%
                    </span>
                }
                description="Overall gender distribution."
            />

            <InsightCard
                title="Avg Patients"
                value={
                    <span style={{ fontSize: "2rem", whiteSpace: "nowrap" }}>
                        {insights.avg_patients_per_facility}
                    </span>
                }
                description="Average patients per facility."
            />

            <InsightCard
    title="Age Group Insights"
    value={
        <div
            style={{
                fontSize: "0.95rem",
                lineHeight: "1.8",
                whiteSpace: "normal",
                textAlign: "left",
            }}
        >
            <div>
                <strong>Highest:</strong>{" "}
                {insights.highest_age_group} (
                {insights.highest_age_group_patients} Patients)
            </div>

            <div style={{ marginTop: "10px" }}>
                <strong>Second:</strong>{" "}
                {insights.second_highest_age_group} (
                {insights.second_highest_age_group_patients} Patients)
            </div>
        </div>
    }
    description=""
/>

        </div>

    );

};

export default SmartInsights;