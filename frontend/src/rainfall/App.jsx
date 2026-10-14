import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import MainLayout from "./layouts/MainLayout";
import { RainfallProvider } from "./context/RainfallContext";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const DistrictAnalysis = lazy(() => import("./pages/DistrictAnalysis"));
const MandalAnalysis = lazy(() => import("./pages/MandalAnalysis"));
const RainfallTrends = lazy(() => import("./pages/RainfallTrends"));
const HumidityAnalysis = lazy(() => import("./pages/HumidityAnalysis"));
const YearComparison = lazy(() => import("./pages/YearComparison"));

function App() {
  return (
    <RainfallProvider>
      <MainLayout>
        <Suspense
          fallback={
            <div style={{ padding: "2rem", textAlign: "center" }}>
              Loading page...
            </div>
          }
        >
          <Routes>

            {/* Main Dashboard */}
            <Route index element={<Dashboard />} />

            {/* District Analysis */}
            <Route
              path="district-analysis"
              element={<DistrictAnalysis />}
            />

            {/* Mandal Analysis */}
            <Route
              path="mandal-analysis"
              element={<MandalAnalysis />}
            />

            {/* Rainfall Trends */}
            <Route
              path="rainfall-trends"
              element={<RainfallTrends />}
            />

            {/* Humidity Analysis */}
            <Route
              path="humidity-analysis"
              element={<HumidityAnalysis />}
            />

            <Route
              path="year-comparison"
              element={<YearComparison />}
            />

          </Routes>
        </Suspense>

      </MainLayout>
    </RainfallProvider>
  );
}

export default App;
