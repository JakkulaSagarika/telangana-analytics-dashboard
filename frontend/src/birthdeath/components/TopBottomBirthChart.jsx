import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { FaTrophy, FaArrowTrendDown } from "react-icons/fa6";
import "../styles/charts.css";

function TopBottomBirthChart({ districts }) {
  const top5 = [...districts]
    .sort((a, b) => b.births - a.births)
    .slice(0, 5);

  const bottom5 = [...districts]
    .sort((a, b) => a.births - b.births)
    .slice(0, 5);

  const topColors = [
    "#6C4DFF",
    "#7C64FF",
    "#917CFF",
    "#A998FF",
    "#C4BBFF",
  ];

  const bottomColors = [
    "#FF6B81",
    "#FF8295",
    "#FF9CAA",
    "#FFB8C0",
    "#FFD3D9",
  ];

  return (
    <div className="row mt-4">

      {/* Top 5 */}

      <div className="col-lg-6 mb-4">

        <div className="chart-card h-100">

          <div className="chart-title">

            <FaTrophy
              style={{
                color: "#F4B400",
                marginRight: "10px",
              }}
            />

            Top 5 Birth Districts

          </div>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={top5}
              layout="vertical"
              margin={{
                top: 10,
                right: 20,
                left: 30,
                bottom: 10,
              }}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                type="number"
              />

              <YAxis
                type="category"
                dataKey="district"
                width={100}
              />

              <Tooltip />

              <Bar
                dataKey="births"
                radius={[0, 12, 12, 0]}
              >

                {top5.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={topColors[index]}
                  />
                ))}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* Bottom 5 */}

      <div className="col-lg-6 mb-4">

        <div className="chart-card h-100">

          <div className="chart-title">

            <FaArrowTrendDown
              style={{
                color: "#FF5C8D",
                marginRight: "10px",
              }}
            />

            Bottom 5 Birth Districts

          </div>

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart
              data={bottom5}
              layout="vertical"
              margin={{
                top: 10,
                right: 20,
                left: 30,
                bottom: 10,
              }}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                type="number"
              />

              <YAxis
                type="category"
                dataKey="district"
                width={100}
              />

              <Tooltip />

              <Bar
                dataKey="births"
                radius={[0, 12, 12, 0]}
              >

                {bottom5.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={bottomColors[index]}
                  />
                ))}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}

export default TopBottomBirthChart;