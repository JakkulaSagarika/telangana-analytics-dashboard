import "../styles/kpi-card.css";

function KPICard({
    title,
    value,
    color,
    onClick,
}) {
    return (
        <div
            className="kpi-card"
            style={{
                borderTop: `6px solid ${color}`,
                cursor: onClick ? "pointer" : "default",
            }}
            onClick={onClick}
        >
            <h4>{title}</h4>

            <h2>{value}</h2>
        </div>
    );
}

export default KPICard;