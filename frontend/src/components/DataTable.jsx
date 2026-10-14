import { useEffect, useState } from "react";
import API from "../services/api";

function DataTable({ filters }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    loadTable();
  }, [filters]);

  const loadTable = async () => {
    try {
      const res = await API.get("filter-data/", {
        params: filters,
      });

      setRecords(res.data.records);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="table-responsive mt-4"
      style={{
        background: "rgba(255,255,255,0.35)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        border: "1px solid rgba(255,255,255,0.45)",
      }}
    >
      <table
        className="table align-middle mb-0"
        style={{
          borderCollapse: "separate",
          borderSpacing: "0 10px",
        }}
      >
        <thead>
          <tr
            style={{
              background:
                "linear-gradient(90deg,#FF9F68,#FF5D8F,#C084FC)",
              color: "#fff",
            }}
          >
            <th
              style={{
                border: "none",
                borderTopLeftRadius: "12px",
                borderBottomLeftRadius: "12px",
                padding: "14px",
              }}
            >
              District
            </th>

            <th style={{ border: "none", padding: "14px" }}>
              Facility
            </th>

            <th style={{ border: "none", padding: "14px" }}>
              Month
            </th>

            <th style={{ border: "none", padding: "14px" }}>
              Gender
            </th>

            <th
              style={{
                border: "none",
                borderTopRightRadius: "12px",
                borderBottomRightRadius: "12px",
                padding: "14px",
              }}
            >
              Age
            </th>
          </tr>
        </thead>

        <tbody>
          {records.length > 0 ? (
            records.map((row) => (
              <tr
                key={row.id}
                style={{
                  background: "rgba(255,255,255,0.75)",
                  transition: "0.3s",
                }}
              >
                <td
                  style={{
                    border: "none",
                    borderTopLeftRadius: "10px",
                    borderBottomLeftRadius: "10px",
                    fontWeight: "600",
                    color: "#444",
                  }}
                >
                  {row.district_name}
                </td>

                <td style={{ border: "none" }}>
                  {row.facility_name}
                </td>

                <td style={{ border: "none" }}>
                  {row.month}
                </td>

                <td style={{ border: "none" }}>
                  <span
                    className={`badge ${
                      row.gender === "Male"
                        ? "bg-primary"
                        : row.gender === "Female"
                        ? "bg-danger"
                        : "bg-secondary"
                    }`}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "20px",
                    }}
                  >
                    {row.gender}
                  </span>
                </td>

                <td
                  style={{
                    border: "none",
                    borderTopRightRadius: "10px",
                    borderBottomRightRadius: "10px",
                    fontWeight: "600",
                  }}
                >
                  {row.age}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="text-center py-4 text-muted"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;