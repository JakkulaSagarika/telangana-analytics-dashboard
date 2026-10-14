import React, { useEffect, useState } from "react";
import API from "../services/api";

const DistrictRanking = () => {
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRanking();
    }, []);

    const fetchRanking = async () => {
        try {
            const res = await API.get("district-ranking/");

            const sorted = [...res.data].sort(
                (a, b) => b.patients - a.patients
            );

            setDistricts(sorted);
        } catch (err) {
            console.error("District Ranking Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getMedal = (index) => {
        switch (index) {
            case 0:
                return "🥇";
            case 1:
                return "🥈";
            case 2:
                return "🥉";
            default:
                return `#${index + 1}`;
        }
    };

    const maxPatients =
        districts.length > 0
            ? districts[0].patients
            : 1;

    if (loading) {
        return (
            <div
                style={{
                    height: "420px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#7C3AED",
                }}
            >
                Loading District Rankings...
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
            {districts.map((district, index) => {

                const percentage =
                    (district.patients / maxPatients) * 100;

                return (
                    <div
                        key={district.district_name}
                        style={{
                            background: "rgba(255,255,255,.55)",
                            backdropFilter: "blur(18px)",
                            borderRadius: "18px",
                            padding: "18px",
                            border:
                                "1px solid rgba(255,255,255,.45)",
                            boxShadow:
                                "0 8px 22px rgba(0,0,0,.08)",
                            transition: ".3s",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "28px",
                                        width: "40px",
                                    }}
                                >
                                    {getMedal(index)}
                                </div>

                                <div>
                                    <h4
                                        style={{
                                            margin: 0,
                                            color: "#4C1D95",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {district.district_name}
                                    </h4>

                                    <span
                                        style={{
                                            color: "#6B7280",
                                            fontSize: "14px",
                                        }}
                                    >
                                        Rank #{index + 1}
                                    </span>
                                </div>
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
                                    {district.patients}
                                </div>

                                <div
                                    style={{
                                        color: "#6B7280",
                                        fontSize: "13px",
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
                                marginBottom: "14px",
                            }}
                        >
                            <div
                                style={{
                                    width: `${percentage}%`,
                                    height: "100%",
                                    background:
                                        "linear-gradient(90deg,#8B5CF6,#EC4899)",
                                    borderRadius: "999px",
                                    transition: ".4s",
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
    {/* Male Card */}
    <div
        style={{
            background: "#f7c2ff",
            borderRadius: "14px",
            padding: "14px",
            textAlign: "center",
        }}
    >
        <div
            style={{
                fontSize: "13px",
                color: "#6B7280",
                marginBottom: "6px",
                fontWeight: 500,
            }}
        >
            Male
        </div>

        <div
            style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#140907",
            }}
        >
            {district.male}
        </div>
    </div>

    {/* Female Card */}
    <div
        style={{
            background: "#ffc2f0",
            borderRadius: "14px",
            padding: "14px",
            textAlign: "center",
        }}
    >
        <div
            style={{
                fontSize: "13px",
                color: "#6B7280",
                marginBottom: "6px",
                fontWeight: 500,
            }}
        >
            Female
        </div>

        <div
            style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#140907",
            }}
        >
            {district.female}
        </div>
    </div>

    {/* Avg Age Card */}
    <div
        style={{
            background: "#ffc2da",
            borderRadius: "14px",
            padding: "14px",
            textAlign: "center",
        }}
    >
        <div
            style={{
                fontSize: "13px",
                color: "#6B7280",
                marginBottom: "6px",
                fontWeight: 500,
            }}
        >
            Avg Age
        </div>

        <div
            style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#140907",
            }}
        >
            {Number(district.average_age || 0).toFixed(1)}
        </div>
    </div>
</div>

                        <div
                            style={{
                                marginTop: "14px",
                                display: "flex",
                                justifyContent: "space-between",
                                color: "#6B7280",
                                fontSize: "13px",
                            }}
                        >
                            <span>
                                {percentage.toFixed(1)}% of Top District
                            </span>

                            <span>
                                {district.patients.toLocaleString()} Records
                            </span>
                        </div>

                    </div>
                );
            })}
        </div>
    );
};

export default DistrictRanking;