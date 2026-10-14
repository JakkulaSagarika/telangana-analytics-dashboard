import React, { useEffect, useState } from "react";
import API from "../services/api";

const PatientTable = () => {

    const [patients, setPatients] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    useEffect(() => {

        loadPatients();

    }, []);

    const loadPatients = async () => {

        try {

            const res = await API.get("records/");

            setPatients(res.data);

        } catch (err) {

            console.error("Patient Table Error:", err);

        } finally {

            setLoading(false);

        }

    };

    const filteredPatients = patients.filter((patient) => {

        const keyword = search.toLowerCase();

        return (

            patient.unique_id?.toLowerCase().includes(keyword) ||

            patient.district_name?.toLowerCase().includes(keyword) ||

            patient.facility_name?.toLowerCase().includes(keyword)

        );

    });

    if (loading) {

        return (

            <div
                style={{
                    height: 350,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#7C3AED",
                    fontWeight: 600,
                    fontSize: 18,
                }}
            >
                Loading Patient Records...
            </div>

        );

    }

    return (

        <div>

            <input
                type="text"
                placeholder="🔍 Search by ID, District or Facility..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    width: "100%",
                    padding: "14px",
                    marginBottom: "18px",
                    borderRadius: "12px",
                    border: "1px solid #DDD",
                    outline: "none",
                    fontSize: "15px",
                }}
            />

            <div
                style={{
                    overflowX: "auto",
                    maxHeight: "550px",
                    overflowY: "auto",
                    borderRadius: "18px",
                }}
            >

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "1200px",
                    }}
                >

                    <thead>

                        <tr
                            style={{
                                background: "#7C3AED",
                                color: "#fff",
                                position: "sticky",
                                top: 0,
                            }}
                        >

                            <th style={thStyle}>Patient ID</th>

                            <th style={thStyle}>District</th>

                            <th style={thStyle}>Facility</th>

                            <th style={thStyle}>Gender</th>

                            <th style={thStyle}>Age</th>

                            <th style={thStyle}>RBC</th>

                            <th style={thStyle}>WBC</th>

                            <th style={thStyle}>Platelets</th>

                            <th style={thStyle}>Month</th>

                        </tr>

                    </thead>

                    <tbody>

                        {filteredPatients.map((patient, index) => (

                            <tr
                                key={index}
                                style={{
                                    background:
                                        index % 2 === 0
                                            ? "#FFFFFF"
                                            : "#F9FAFB",
                                }}
                            >

                                <td style={tdStyle}>{patient.unique_id}</td>

                                <td style={tdStyle}>{patient.district_name}</td>

                                <td style={tdStyle}>{patient.facility_name}</td>

                                <td style={tdStyle}>{patient.gender}</td>

                                <td style={tdStyle}>{patient.age}</td>

                                <td style={tdStyle}>
                                    {patient.red_blood_cells}
                                </td>

                                <td style={tdStyle}>
                                    {patient.white_blood_cells}
                                </td>

                                <td style={tdStyle}>
                                    {patient.thrombocytes}
                                </td>

                                <td style={tdStyle}>{patient.month}</td>

                            </tr>

                        ))}
                                            </tbody>

                </table>

            </div>

            <div
                style={{
                    marginTop: "18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#6B7280",
                    fontSize: "14px",
                    fontWeight: 500,
                }}
            >
                <span>
                    Showing {filteredPatients.length.toLocaleString()} of{" "}
                    {patients.length.toLocaleString()} Records
                </span>

                <span>
                    Total Patients:{" "}
                    <strong style={{ color: "#7C3AED" }}>
                        {patients.length.toLocaleString()}
                    </strong>
                </span>
            </div>

        </div>

    );

};

const thStyle = {
    padding: "14px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
};

const tdStyle = {
    padding: "12px 14px",
    borderBottom: "1px solid #E5E7EB",
    fontSize: "14px",
    color: "#374151",
    whiteSpace: "nowrap",
};

export default PatientTable;