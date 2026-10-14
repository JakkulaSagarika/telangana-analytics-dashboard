import { Link } from "react-router-dom";
import "../styles/Home.css";

import bgImage from "../assets/images/telangana-pastel-waterfront.png";

const dashboards = [
  { path: "/health-dashboard", icon: "✚", name: "Health Dashboard", description: "Explore patient records, facility activity, and health indicators across Telangana.", tone: "mint" },
  { path: "/rainfall-dashboard", icon: "☂", name: "Rainfall Dashboard", description: "Review rainfall patterns, humidity, and district and mandal trends.", tone: "sky" },
  { path: "/agriculture", icon: "❧", name: "Agriculture Dashboard", description: "Explore crop area, production, yields, and district agriculture data.", tone: "sage" },
  { path: "/literacy", icon: "▤", name: "Literacy Dashboard", description: "View literacy rates and compare district-level education indicators.", tone: "lavender" },
  { path: "/birth-death", icon: "⌂", name: "Birth & Death Dashboard", description: "Explore birth and death registrations across districts and local bodies.", tone: "peach" },
  { path: "/education", icon: "⌘", name: "Education Dashboard", description: "Explore school infrastructure, literacy, colleges, and dropout indicators.", tone: "sky" },
  { path: "/ev", icon: "ϟ", name: "EV Infrastructure Dashboard", description: "Discover charging stations, operators, and electric vehicle infrastructure.", tone: "sage" },
];

function Home() {
  return (
    <main className="home" style={{ "--home-background": `url("${bgImage}")` }}>
      <div className="home-shell">
        <header className="home-header">
          <Link className="home-brand" to="/landing" aria-label="Telangana State Insights home">
            <span className="home-brand-mark">TS</span>
            <span><strong>Telangana</strong><small>State Insights</small></span>
          </Link>
          <span className="home-government">Government of Telangana</span>
        </header>

        <section className="home-hero" aria-labelledby="home-title">
          <p className="home-eyebrow"><span /> A unified view of the state</p>
          <h1 id="home-title">Telangana State Insights</h1>
          <p className="home-hero-copy">Explore trusted data and discover the stories shaping communities across Telangana.</p>
          <a className="home-hero-link" href="#dashboards">Explore dashboards <span aria-hidden="true">↓</span></a>
          <span className="home-hero-seal" aria-hidden="true">TS</span>
        </section>

        <section id="dashboards" className="home-dashboard-section" aria-labelledby="dashboards-title">
          <div className="home-section-heading">
            <div><p className="home-eyebrow">Explore the portal</p><h2 id="dashboards-title">Insights for every sector</h2></div>
            <p>Select a dashboard to view its data and analysis.</p>
          </div>
          <div className="dashboard-grid">
            {dashboards.map((dashboard, index) => (
              <Link className={`dashboard-card ${dashboard.tone}`} to={dashboard.path} key={dashboard.path}>
                <span className="dashboard-card-top"><span className="dashboard-icon" aria-hidden="true">{dashboard.icon}</span><span className="dashboard-number">{String(index + 1).padStart(2, "0")}</span></span>
                <h3>{dashboard.name}</h3>
                <p>{dashboard.description}</p>
                <span className="dashboard-card-action">Open dashboard <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="home-footer"><span>Telangana State Insights</span><span>Data · context · progress</span></footer>
      </div>
    </main>
  );
}

export default Home;
