import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardHeader from "../components/DashboardHeader";

function Settings() {
  return (
    <div className="dashboard">
      <Sidebar />

      <div
        className="main-content"
        style={{
          background:
            "linear-gradient(135deg,#FFF9FC 0%,#FCF5FF 50%,#F8F2FF 100%)",
          minHeight: "100vh",
        }}
      >
        <Navbar />

        <DashboardHeader
          title="Settings"
          subtitle="Dashboard Preferences"
        />

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #F2E6FA",
            borderRadius: "24px",
            padding: "35px",
            boxShadow: "0 12px 30px rgba(162,78,212,.08)",
          }}
        >
          {/* Theme */}

          <h2
            style={{
              color: "#2F2F2F",
              fontWeight: "700",
              marginBottom: "25px",
            }}
          >
            🎨 Theme
          </h2>

          <button
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              marginBottom: "15px",
              background:
                "linear-gradient(90deg,#FF8A65,#A24ED4)",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            ☀ Light Mode
          </button>

          <button
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              marginBottom: "35px",
              background: "#2F2A40",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🌙 Dark Mode
          </button>

          <hr
            style={{
              borderColor: "#EFE2FA",
              marginBottom: "35px",
            }}
          />

          {/* Export */}

          <h2
            style={{
              color: "#2F2F2F",
              fontWeight: "700",
              marginBottom: "25px",
            }}
          >
            📄 Export Reports
          </h2>

          <button
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              marginBottom: "15px",
              background:
                "linear-gradient(90deg,#FF8A65,#A24ED4)",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
              transition: ".3s",
            }}
          >
            📊 Export Excel
          </button>

          <button
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              border: "none",
              background:
                "linear-gradient(90deg,#A24ED4,#9443CC)",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📑 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;