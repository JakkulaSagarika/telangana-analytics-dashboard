import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts";

function TopBottomDeathChart({ districts }) {

    const sorted = [...districts].sort(
        (a, b) => b.deaths - a.deaths
    );

    const top5 = sorted.slice(0, 5);

    const bottom5 = [...sorted]
        .reverse()
        .slice(0, 5);

    const Card = ({ title, data, color }) => (

        <div className="chart-card">

            <h4 className="chart-title">
                {title}
            </h4>

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <BarChart
                    data={data}
                    layout="vertical"
                >

                    <CartesianGrid
                        strokeDasharray="3 3"
                    />

                    <XAxis type="number" />

                    <YAxis
                        dataKey="district"
                        type="category"
                        width={90}
                    />

                    <Tooltip />

                    <Bar
                        dataKey="deaths"
                        fill={color}
                        radius={[0, 10, 10, 0]}
                    />

                </BarChart>

            </ResponsiveContainer>

        </div>

    );

    return (

        <div className="row g-4">

            <div className="col-lg-6">

                <Card
                    title="Top 5 Districts"
                    data={top5}
                    color="#6C4DFF"
                />

            </div>

            <div className="col-lg-6">

                <Card
                    title="Bottom 5 Districts"
                    data={bottom5}
                    color="#B39DFF"
                />

            </div>

        </div>

    );

}

export default TopBottomDeathChart;