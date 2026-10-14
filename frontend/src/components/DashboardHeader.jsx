import "../styles/dashboard-header.css";

function DashboardHeader({
  rightContent = null,
}) {
  return (
    <div className="dashboard-header">
      {rightContent}
    </div>
  );
}

export default DashboardHeader;