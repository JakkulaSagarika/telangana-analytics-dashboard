import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import BirthStatistics from "./pages/BirthStatistics";
import DeathStatistics from "./pages/DeathStatistics";
import DistrictAnalysis from "./pages/DistrictAnalysis";
import GramPanchayat from "./pages/GramPanchayat";
import Municipality from "./pages/Municipality";
import Corporation from "./pages/Corporation";

import { DistrictProvider } from "./context/DistrictContext";
import "./birthdeath-scope.css";

function BirthDeathApp() {
  return (
    <div className="birthdeath-app">
      <DistrictProvider>
        <Routes>
          <Route path="" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="births" element={<BirthStatistics />} />
            <Route path="deaths" element={<DeathStatistics />} />
            <Route path="districts" element={<DistrictAnalysis />} />
            <Route path="gram-panchayats" element={<GramPanchayat />} />
            <Route path="municipalities" element={<Municipality />} />
            <Route path="corporations" element={<Corporation />} />
          </Route>
        </Routes>
      </DistrictProvider>
    </div>
  );
}

export default BirthDeathApp;
