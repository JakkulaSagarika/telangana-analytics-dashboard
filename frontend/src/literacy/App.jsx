import { Routes, Route } from "react-router-dom";
import LiteracyDashboard from "./pages/LiteracyDashboard";

export default function App() {
  return (
    <Routes>
      <Route index element={<LiteracyDashboard />} />
    </Routes>
  );
}