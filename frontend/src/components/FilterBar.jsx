import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/filter-bar.css";

function FilterBar({
  filters = {
    district: "",
    month: "",
    gender: "",
    search: "",
  },
  onFilterChange = () => {},
  defaultDistrict = "",
  hideDistrictFilter = false,
}) {

  const safeFilters = {
    district: "",
    month: "",
    gender: "",
    search: "",
    ...filters,
  };

  const [options, setOptions] = useState({
    districts: [],
    months: [],
    genders: [],
  });

  // Load dropdown options
  useEffect(() => {
    API.get("filters/")
      .then((res) => {
        setOptions(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {

    const { name, value } = e.target;

    onFilterChange({
      ...safeFilters,
      [name]: value,
    });

  };

  const resetFilters = () => {

    onFilterChange({
      district: defaultDistrict,
      month: "",
      gender: "",
      search: "",
    });

  };

  return (

    <div className="filter-container">

      {!hideDistrictFilter && (

        <select
          name="district"
          value={safeFilters.district}
          onChange={handleChange}
        >

          <option value="">All Districts</option>

          {options.districts.map((district) => (

            <option
              key={district}
              value={district}
            >
              {district}
            </option>

          ))}

        </select>

      )}

      <select
        name="month"
        value={safeFilters.month}
        onChange={handleChange}
      >

        <option value="">All Months</option>

        {options.months.map((month) => (

          <option
            key={month}
            value={month}
          >
            {month}
          </option>

        ))}

      </select>

      <select
        name="gender"
        value={safeFilters.gender}
        onChange={handleChange}
      >

        <option value="">All Genders</option>

        {options.genders.map((gender) => (

          <option
            key={gender}
            value={gender}
          >
            {gender}
          </option>

        ))}

      </select>

      <input
        type="text"
        name="search"
        placeholder="Search Facility, District or Patient ID"
        value={safeFilters.search}
        onChange={handleChange}
      />

      <button
        type="button"
        onClick={resetFilters}
      >
        Reset
      </button>

    </div>

  );

}

export default FilterBar;