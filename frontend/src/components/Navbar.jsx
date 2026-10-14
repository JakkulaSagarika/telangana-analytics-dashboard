import { FaHeartbeat } from "react-icons/fa";
import "../styles/navbar.css";

function Navbar() {
  return (
    <header className="navbar">

      <div className="navbar-left">

        <div className="logo-circle">
          <FaHeartbeat />
        </div>

        <div>
          <h2>Telangana Analytics Portal</h2>
          <p>Health Analytics Dashboard</p>
        </div>

      </div>

      <div className="navbar-right">

        <span className="today">
          {new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>

        <div className="profile">
          SK
        </div>

      </div>

    </header>
  );
}

export default Navbar;