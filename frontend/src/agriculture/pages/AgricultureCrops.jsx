import React from "react";
import { useNavigate } from "react-router-dom";

function AgricultureCrops() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f4ec",
        padding: "30px 45px",
        color: "#174d3a",
      }}
    >
      <button
        onClick={() => navigate("/agriculture")}
        style={{
          border: "none",
          background: "transparent",
          color: "#174d3a",
          fontSize: "18px",
          fontWeight: "700",
          cursor: "pointer",
          marginBottom: "30px",
        }}
      >
        ← Back to Agriculture Dashboard
      </button>

      <h1
        style={{
          textAlign: "center",
          fontSize: "42px",
          marginBottom: "10px",
        }}
      >
        Crop Categories
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "20px",
          color: "#438b6b",
          marginBottom: "35px",
        }}
      >
        Horticulture crops covered in the agriculture dataset
      </p>

      <div
        style={{
          background: "#fffdf8",
          border: "1px solid #d5e3d4",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 8px 25px rgba(30,80,55,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "25px" }}>
          🌱 Crop Categories
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "15px",
          }}
        >
          {[
            "Mango",
            "Red Chillies",
            "Turmeric",
            "Total Fruits",
            "Total Spices",
            "Grand Total Of Horticulture Crops",
          ].map((crop, index) => (
            <div
              key={index}
              style={{
                padding: "20px",
                background: "#e1ecdf",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "17px",
                color: "#174d3a",
              }}
            >
              🌿 {crop}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AgricultureCrops;