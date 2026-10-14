import { FaUserCircle } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const links = [
  ["/birth-death", "Dashboard"],
  ["/birth-death/births", "Birth Statistics"],
  ["/birth-death/deaths", "Death Statistics"],
  ["/birth-death/districts", "District Analysis"],
  ["/birth-death/gram-panchayats", "Gram Panchayat"],
  ["/birth-death/municipalities", "Municipality"],
  ["/birth-death/corporations", "Corporation"],
];

function Sidebar() {
  return (
    <aside className="bd-sidebar">
      <div className="bd-sidebar-background" />
      <div className="bd-sidebar-overlay" />
      <div className="bd-sidebar-content">
        <div>
          <div className="bd-sidebar-header">
            <h2>Birth &amp; Death</h2>
            <p>Analytics Dashboard</p>
          </div>
          <div className="bd-profile-card">
            <div className="bd-profile-avatar"><FaUserCircle /></div>
            <div className="bd-profile-details"><h5>Administrator</h5><p>Government User</p></div>
          </div>
          <ul className="bd-sidebar-menu">
            {links.map(([to, label]) => (
              <li key={to}>
                <NavLink to={to} end={to === "/birth-death"} className={({ isActive }) => `bd-sidebar-link ${isActive ? "active" : ""}`}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="bd-sidebar-footer">© Government of Telangana</div>
      </div>
    </aside>
  );
}

export default Sidebar;
