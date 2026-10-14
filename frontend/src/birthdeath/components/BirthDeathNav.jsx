import { NavLink } from "react-router-dom";
import "../styles/birthdeath-navigation.css";

const links = [
  ["/birth-death", "Dashboard"],
  ["/birth-death/births", "Birth Statistics"],
  ["/birth-death/deaths", "Death Statistics"],
  ["/birth-death/districts", "District Analysis"],
  ["/birth-death/gram-panchayats", "Gram Panchayat"],
  ["/birth-death/municipalities", "Municipality"],
  ["/birth-death/corporations", "Corporation"],
];

function BirthDeathNav() {
  return (
    <nav className="bd-page-nav">
      {links.map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/birth-death"}
          className={({ isActive }) =>
            `bd-page-nav-link ${isActive ? "active" : ""}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default BirthDeathNav;
