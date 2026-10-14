import React, { useEffect, useState } from "react";
import API from "../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

const DistrictAverageAge = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("charts/district-average-age/")
      .then((res) =>
        setData(
          [...res.data].sort(
            (a, b) => b.average_age - a.average_age
          )
        )
      )
      .catch(console.error);
  }, []);

  if (!data.length)
    return (
      <div
        style={{
          height: 720,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#7C3AED",
          fontWeight: 600,
          fontSize: 18,
        }}
      >
        Loading District Average Age...
      </div>
    );

  return (
    <div
      style={{
        width: "100%",
        height: Math.max(650, data.length * 26),
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 45,
            left: 5,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ddacfa" />
              <stop offset="100%" stopColor="#faaccb" />
            </linearGradient>

            <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#faaccb" />
              <stop offset="100%" stopColor="#ddacfa" />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#E5E7EB"
            strokeDasharray="4 4"
            horizontal={false}
          />

          <XAxis
            type="number"
            domain={[0, 60]}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#666",
              fontSize: 12,
            }}
          />

          <YAxis
            type="category"
            dataKey="district_name"
            width={125}
            interval={0}
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              fill: "#666",
              fontWeight: 500,
            }}
          />

          <Tooltip
            cursor={{
              fill: "rgba(250,172,203,.12)",
            }}
            contentStyle={{
              borderRadius: 14,
              border: "none",
              boxShadow: "0 8px 20px rgba(0,0,0,.12)",
            }}
          />

          <Bar
            dataKey="average_age"
            radius={[12, 12, 12, 12]}
            barSize={24}
            animationDuration={1200}
          >
            <LabelList
              dataKey="average_age"
              position="right"
              formatter={(v) => Number(v).toFixed(1)}
              style={{
                fill: "#EC4899",
                fontSize: 11,
                fontWeight: 700,
              }}
            />

            {data.map((_, index) => (
              <Cell
                key={index}
                fill={
                  index % 2 === 0
                    ? "url(#grad1)"
                    : "url(#grad2)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistrictAverageAge;