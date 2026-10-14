import "../styles/navbar.css";

import { Link } from "react-router-dom";
import {
  FaBell,
  FaSearch,
  FaUserCircle,
  FaHome,
} from "react-icons/fa";

function Navbar() {

  const today = new Date().toLocaleDateString();

  return (

    <nav className="navbar-custom">

      <div className="search-box">

        <FaSearch />

        <input
          type="text"
          placeholder="Search District..."
        />

      </div>

      <div className="navbar-right">

        <Link to="/" className="date-box portal-home-link" title="Back to portal">
          <FaHome style={{ marginRight: 8 }} />
          Portal Home
        </Link>

        <div className="date-box">

          {today}

        </div>

        <FaBell className="nav-icon" />

        <FaUserCircle className="profile" />

      </div>

    </nav>

  );

}

export default Navbar;