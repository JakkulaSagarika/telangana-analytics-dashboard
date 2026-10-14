import React, { useEffect, useState } from "react";
import API from "../services/api";

const FacilityLeaderboard = () => {

    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFacilities();
    }, []);

    const loadFacilities = async () => {

        try {

            const res = await API.get("charts/facilities/");
            console.log(res.data);

            const sorted = [...res.data].sort(
                (a, b) => b.patients - a.patients
            );

            setFacilities(sorted);

        } catch (err) {

            console.error("Facility Leaderboard Error:", err);

        } finally {

            setLoading(false);

        }

    };

    const maxPatients =
        facilities.length > 0
            ? facilities[0].patients
            : 1;

    if (loading) {
        return (
            <div
                style={{
                    height: "420px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#7C3AED",
                    fontSize: "18px",
                    fontWeight: 600,
                }}
            >
                Loading Facilities...
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                maxHeight: "520px",
                overflowY: "auto",
                paddingRight: "6px",
            }}
        >

            {facilities.map((facility, index) => {

                const percentage =
                    (facility.patients / maxPatients) * 100;

                return (

                    <div
                        key={facility.facility_name}
                        style={{
                            background: "rgba(255,255,255,.55)",
                            backdropFilter: "blur(18px)",
                            borderRadius: "18px",
                            padding: "18px",
                            border: "1px solid rgba(255,255,255,.45)",
                            boxShadow: "0 8px 20px rgba(0,0,0,.08)",
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "14px",
                            }}
                        >

                            <div>

                                <h4
                                    style={{
                                        margin: 0,
                                        color: "#4C1D95",
                                        fontWeight: 700,
                                    }}
                                >
                                    {facility.facility_name}
                                </h4>

                                <span
                                    style={{
                                        color: "#6B7280",
                                        fontSize: "13px",
                                    }}
                                >
                                    Rank #{index + 1}
                                </span>

                            </div>

                            <div
                                style={{
                                    textAlign: "right",
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: "bold",
                                        color: "#7C3AED",
                                    }}
                                >
                                    {facility.patients}
                                </div>

                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#6B7280",
                                    }}
                                >
                                    Patients
                                </div>

                            </div>

                        </div>

                        <div
                            style={{
                                width: "100%",
                                height: "10px",
                                background: "#E5E7EB",
                                borderRadius: "999px",
                                overflow: "hidden",
                                marginBottom: "16px",
                            }}
                        >

                            <div
                                style={{
                                    width: `${percentage}%`,
                                    height: "100%",
                                    background:
                                        "linear-gradient(90deg,#8B5CF6,#EC4899)",
                                    borderRadius: "999px",
                                }}
                            />

                        </div>
                        <div
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "12px",
    }}
>

    {/* Male */}
    <div
        style={{
            background: "#f7c2ff",
            borderRadius: "12px",
            padding: "12px",
            textAlign: "center",
        }}
    >
        <div
            style={{
                fontSize: "13px",
                color: "#140907",
                fontWeight: 500,
                marginBottom: "6px",
            }}
        >
            Male
        </div>

        <div
            style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#140907",
            }}
        >
            {facility.male}
        </div>
    </div>

    {/* Female */}
    <div
        style={{
            background: "#ffc2f0",
            borderRadius: "12px",
            padding: "12px",
            textAlign: "center",
        }}
    >
        <div
            style={{
                fontSize: "13px",
                color: "#140907",
                fontWeight: 500,
                marginBottom: "6px",
            }}
        >
            Female
        </div>

        <div
            style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#140907",
            }}
        >
            {facility.female}
        </div>
    </div>

    {/* Average Age */}
    <div
        style={{
            background: "#ffc2da",
            borderRadius: "12px",
            padding: "12px",
            textAlign: "center",
        }}
    >
        <div
            style={{
                fontSize: "13px",
                color: "#140907",
                fontWeight: 500,
                marginBottom: "6px",
            }}
        >
            Avg Age
        </div>

        <div
            style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#140907",
            }}
        >
            {Number(facility.average_age || 0).toFixed(1)}
        </div>
    </div>

</div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: "16px",
                                fontSize: "13px",
                                color: "#6B7280",
                            }}
                        >
                            <span>
                                {percentage.toFixed(1)}% of Top Facility
                            </span>

                            <span>
                                {facility.patients.toLocaleString()} Records
                            </span>
                        </div>

                    </div>

                );

            })}

        </div>
    );
};

export default FacilityLeaderboard;