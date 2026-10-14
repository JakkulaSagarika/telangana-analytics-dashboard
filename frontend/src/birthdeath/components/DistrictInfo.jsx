import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaCity,
  FaMapMarkedAlt,
  FaArrowRight,
} from "react-icons/fa";

import "../styles/districtinfo.css";

function DistrictInfo({ districtInfo }) {
  const navigate = useNavigate();

  // -------------------------------
  // Calculate Others
  // -------------------------------

  const birthOthers =
    districtInfo?.births
      ? districtInfo.births.total -
        districtInfo.births.male -
        districtInfo.births.female
      : "--";

  const deathOthers =
    districtInfo?.deaths
      ? districtInfo.deaths.total -
        districtInfo.deaths.male -
        districtInfo.deaths.female
      : "--";

  return (
    <div className="district-info-card">

      {/* Header */}

      <div className="district-header">

        <h3>
          {districtInfo?.district || "Select a District"}
        </h3>

        <p>
          Click a district on the Telangana map to view detailed statistics.
        </p>

      </div>

      {/* ================= Birth Statistics ================= */}

      <div className="stats-section">

        <h5>Birth Statistics</h5>

        <div className="stats-grid">

          <div className="stat-box">

            <span>Total</span>

            <h4>
              {districtInfo?.births?.total?.toLocaleString() ?? "--"}
            </h4>

          </div>

          <div className="stat-box">

            <span>Male</span>

            <h4>
              {districtInfo?.births?.male?.toLocaleString() ?? "--"}
            </h4>

          </div>

          <div className="stat-box">

            <span>Female</span>

            <h4>
              {districtInfo?.births?.female?.toLocaleString() ?? "--"}
            </h4>

          </div>

          <div className="stat-box">

            <span>Others</span>

            <h4>
              {birthOthers !== "--"
                ? birthOthers.toLocaleString()
                : "--"}
            </h4>

          </div>

        </div>

      </div>

      {/* ================= Death Statistics ================= */}

      <div className="stats-section">

        <h5>Death Statistics</h5>

        <div className="stats-grid">

          <div className="stat-box">

            <span>Total</span>

            <h4>
              {districtInfo?.deaths?.total?.toLocaleString() ?? "--"}
            </h4>

          </div>

          <div className="stat-box">

            <span>Male</span>

            <h4>
              {districtInfo?.deaths?.male?.toLocaleString() ?? "--"}
            </h4>

          </div>

          <div className="stat-box">

            <span>Female</span>

            <h4>
              {districtInfo?.deaths?.female?.toLocaleString() ?? "--"}
            </h4>

          </div>

          <div className="stat-box">

            <span>Others</span>

            <h4>
              {deathOthers !== "--"
                ? deathOthers.toLocaleString()
                : "--"}
            </h4>

          </div>

        </div>

      </div>

      {/* ================= Local Bodies ================= */}

      <div className="local-body-section">

        <h5>Explore Local Bodies</h5>

        <div
          className="body-card"
          onClick={() => navigate("/birth-death/gram-panchayats")}
        >

          <div className="body-left">

            <FaMapMarkedAlt />

            <div>

              <h6>Gram Panchayat</h6>

              <span>
                View Gram Panchayat Data
              </span>

            </div>

          </div>

          <FaArrowRight />

        </div>

        <div
          className="body-card"
          onClick={() => navigate("/birth-death/municipalities")}
        >

          <div className="body-left">

            <FaCity />

            <div>

              <h6>Municipality</h6>

              <span>
                View Municipality Data
              </span>

            </div>

          </div>

          <FaArrowRight />

        </div>

        <div
          className="body-card"
          onClick={() => navigate("/birth-death/corporations")}
        >

          <div className="body-left">

            <FaBuilding />

            <div>

              <h6>Corporation</h6>

              <span>
                View Corporation Data
              </span>

            </div>

          </div>

          <FaArrowRight />

        </div>

      </div>

    </div>
  );
}

export default DistrictInfo;