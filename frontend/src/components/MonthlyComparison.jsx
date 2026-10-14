import React, { useEffect, useState } from "react";
import API from "../services/api";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const MonthlyComparison = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Theme colors
    const styles = getComputedStyle(document.documentElement);

    const chart1 = styles.getPropertyValue("--chart-1").trim();
    const chart2 = styles.getPropertyValue("--chart-2").trim();
    const chart3 = styles.getPropertyValue("--chart-3").trim();

    useEffect(() => {
        loadChart();
    }, []);

    const loadChart = async () => {

        try {

            const res = await API.get("charts/monthly/");

            const formatted = res.data.map((item) => ({
                month: item.month,
                patients: item.count,
            }));

            setData(formatted);

        } catch (err) {

            console.error("Monthly Chart Error", err);

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div
                style={{
                    height: 420,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: 18,
                }}
            >
                Loading Monthly Comparison...
            </div>

        );

    }

    return (

        <div
            style={{
                width: "100%",
                height: 450,
            }}
        >

            <ResponsiveContainer width="100%" height="100%">

                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 15,
                        bottom: 55,
                    }}
                >

                    {/* Gradient Definitions */}

                    <defs>

    {/* Light → Dark */}

    <linearGradient
        id="pinkLightDark"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
    >
        <stop offset="0%" stopColor="#E889B2" />
        <stop offset="40%" stopColor="#E873A7" />
        <stop offset="70%" stopColor="#E8649C" />
        <stop offset="100%" stopColor="#E85695" />
    </linearGradient>

    {/* Dark → Light */}

    <linearGradient
        id="pinkDarkLight"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
    >
        <stop offset="0%" stopColor="#E85695" />
        <stop offset="30%" stopColor="#E8649C" />
        <stop offset="60%" stopColor="#E873A7" />
        <stop offset="100%" stopColor="#E889B2" />
    </linearGradient>

</defs>

                    <CartesianGrid
                        strokeDasharray="5 5"
                        stroke="#E2E8F0"
                        vertical={false}
                    />

                    <XAxis
    dataKey="month"
    interval={0}
    angle={-45}
    textAnchor="end"
    height={80}
    tick={{
        fontSize: 12,
        fill: "#7E22CE",
        fontWeight: 600,
    }}
    axisLine={false}
    tickLine={false}
/>
                    <YAxis
                        tick={{
                            fill: "#64748B",
                            fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        cursor={{
                            fill: "rgba(99,102,241,.08)",
                        }}
                        contentStyle={{
                            borderRadius: 14,
                            border: "none",
                            boxShadow:
                                "0 10px 30px rgba(0,0,0,.15)",
                        }}
                    />

                   <Bar
    dataKey="patients"
    name="Patients"
    radius={[12, 12, 0, 0]}
    barSize={40}
    animationDuration={1200}
    style={{
        filter: "drop-shadow(0px 4px 10px rgba(232, 86, 149, 0.25))",
    }}
>
    {data.map((entry, index) => (
        <Cell
            key={`cell-${index}`}
            fill={
                index % 2 === 0
                    ? "url(#pinkLightDark)"
                    : "url(#pinkDarkLight)"
            }
        />
    ))}
</Bar>

                </BarChart>

            </ResponsiveContainer>

            {/* Summary Cards */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "18px",
                    marginTop: "22px",
                }}
            >

                <div
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "18px",
                        padding: "20px",
                        textAlign: "center",
                        boxShadow: "var(--shadow-sm)",
                    }}
                >

                    <h4
                        style={{
                            margin: 0,
                            color: "var(--primary)",
                        }}
                    >
                        📅 Total Months
                    </h4>

                    <h2
                        style={{
                            marginTop: 10,
                            color: "var(--text-title)",
                        }}
                    >
                        {data.length}
                    </h2>

                </div>

                <div
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "18px",
                        padding: "20px",
                        textAlign: "center",
                        boxShadow: "var(--shadow-sm)",
                    }}
                >

                    <h4
                        style={{
                            margin: 0,
                            color: "var(--success)",
                        }}
                    >
                        📈 Peak Month
                    </h4>

                    <h2
                        style={{
                            marginTop: 10,
                            color: "var(--text-title)",
                        }}
                    >
                        {data.length
                            ? data.reduce((a, b) =>
                                  a.patients > b.patients ? a : b
                              ).month
                            : "-"}
                    </h2>

                </div>

                <div
                    style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderRadius: "18px",
                        padding: "20px",
                        textAlign: "center",
                        boxShadow: "var(--shadow-sm)",
                    }}
                >

                    <h4
                        style={{
                            margin: 0,
                            color: "var(--warning)",
                        }}
                    >
                        👥 Total Patients
                    </h4>

                    <h2
                        style={{
                            marginTop: 10,
                            color: "var(--text-title)",
                        }}
                    >
                        {data
                            .reduce(
                                (sum, item) => sum + item.patients,
                                0
                            )
                            .toLocaleString()}
                    </h2>

                </div>

            </div>

        </div>

    );

};

export default MonthlyComparison;