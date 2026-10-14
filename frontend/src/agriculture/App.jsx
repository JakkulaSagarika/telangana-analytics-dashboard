import { Routes, Route } from "react-router-dom";
import AgricultureDashboard from "./pages/AgricultureDashboard";
import AgricultureDistrictDashboard from "./pages/AgricultureDistrictDashboard";
import AgricultureCrops from "./pages/AgricultureCrops";

export default function App() {
  return (
    <Routes>
      <Route index element={<AgricultureDashboard />} />
      <Route path="district/:districtName" element={<AgricultureDistrictDashboard />} />
      <Route path="crops" element={<AgricultureCrops />} />
    </Routes>
  );
}