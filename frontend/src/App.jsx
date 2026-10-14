import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import HealthDashboard from "./pages/HealthDashboard";
import BirthDeathApp from "./birthdeath/App";
import Analytics from "./pages/Analytics";
import DistrictAnalysis from "./pages/DistrictAnalysis";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import { getCurrentUser, signOut } from "./services/auth";

const RainfallDashboard = lazy(() => import("./rainfall/App"));
const AgricultureApp = lazy(() => import("./agriculture/App"));
const LiteracyApp = lazy(() => import("./literacy/App"));
const EducationDashboard = lazy(() => import("./education-ev/App").then((module) => ({ default: module.EducationDashboard })));
const EVDashboard = lazy(() => import("./education-ev/App").then((module) => ({ default: module.EVDashboard })));

function LogoutButton({ onLoggedOut }) {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    setBusy(true);
    try {
      await signOut();
      onLoggedOut();
      navigate("/login", { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return <button className="portal-logout" type="button" onClick={logout} disabled={busy}>{busy ? "Signing out…" : "Log out"}</button>;
}

function RequireAuth({ status, onLoggedOut, children }) {
  const location = useLocation();

  if (status === "checking") {
    return <div className="auth-loading" aria-live="polite">Checking your secure session…</div>;
  }

  if (status === "signed-out") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <><LogoutButton onLoggedOut={onLoggedOut} />{children}</>;
}

function App() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    getCurrentUser()
      .then((user) => setStatus(user ? "signed-in" : "signed-out"))
      .catch(() => setStatus("signed-out"));
  }, []);

  const protectedRoute = (page) => <RequireAuth status={status} onLoggedOut={() => setStatus("signed-out")}>{page}</RequireAuth>;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={status === "signed-in" ? <Navigate to="/landing" replace /> : <Auth onAuthenticated={() => setStatus("signed-in")} />} />
      <Route path="/landing" element={protectedRoute(<Home />)} />

      <Route path="/birth-death/*" element={protectedRoute(<BirthDeathApp />)} />

      <Route
        path="/agriculture/*"
        element={protectedRoute(<Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading Agriculture Dashboard...</div>}><AgricultureApp /></Suspense>)}
      />
      <Route
        path="/literacy/*"
        element={protectedRoute(<Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading Literacy Dashboard...</div>}><LiteracyApp /></Suspense>)}
      />
      <Route
        path="/education/*"
        element={protectedRoute(<Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading Education Dashboard...</div>}><EducationDashboard /></Suspense>)}
      />
      <Route
        path="/ev/*"
        element={protectedRoute(<Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading EV Stations Dashboard...</div>}><EVDashboard /></Suspense>)}
      />

      <Route path="/health-dashboard" element={protectedRoute(<HealthDashboard />)} />
      <Route
        path="/rainfall-dashboard/*"
        element={protectedRoute(
          <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading Rainfall Dashboard...</div>}>
            <RainfallDashboard />
          </Suspense>
        )}
      />

      {/* Other pages */}
      <Route path="/analytics" element={protectedRoute(<Analytics />)} />
      <Route path="/district-analysis" element={protectedRoute(<DistrictAnalysis />)} />
      <Route path="/district-analysis/:district" element={protectedRoute(<DistrictAnalysis />)} />
      <Route path="/settings" element={protectedRoute(<Settings />)} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
