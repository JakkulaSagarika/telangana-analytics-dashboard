import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaMapMarkedAlt } from "react-icons/fa";

import "../styles/table.css";
import thoranam from "../assets/images/thoranam.png";

function DistrictTable() {
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(
        "/api/birthdeath/districts/"
      );

      setDistricts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const filtered = districts.filter((item) =>
    item.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
  className="district-table-card"
  style={{
    backgroundImage: `url(${thoranam})`,
  }}
>

      <div className="district-header">

        <div>
          <h2>
            <FaMapMarkedAlt className="header-icon" />
            District Statistics
          </h2>

          <p>Birth &amp; Death Registration Summary</p>
        </div>

        <div className="search-box">

          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      <div className="table-responsive">

        <table className="district-table">

          <thead>

            <tr>
              <th>S.No</th>
              <th>District</th>
              <th>Total Births</th>
              <th>Total Deaths</th>
              <th>Male Births</th>
              <th>Female Births</th>
              <th>Male Deaths</th>
              <th>Female Deaths</th>
            </tr>

          </thead>

          <tbody>

            {filtered.length > 0 ? (

              filtered.map((item, index) => (

                <tr key={index}>

                  <td>
                    <span className="serial-badge">
                      {index + 1}
                    </span>
                  </td>

                  <td className="district-cell">
                    <div className="district-info">
                      <span className="district-name">
                        {item.district}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="stat-badge birth">
                      {Number(item.births).toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <span className="stat-badge death">
                      {Number(item.deaths).toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <span className="stat-badge male">
                      {Number(item.birth_male).toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <span className="stat-badge female">
                      {Number(item.birth_female).toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <span className="stat-badge male">
                      {Number(item.death_male).toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <span className="stat-badge female">
                      {Number(item.death_female).toLocaleString()}
                    </span>
                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td colSpan="8" className="empty-state">

                  <div className="empty-content">

                    <h4>No District Found</h4>

                    <p>
                      Try searching with another district name.
                    </p>

                  </div>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default DistrictTable;
