import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function MainLayout() {
  return (
    <div className="birthdeath-layout">
      <Sidebar />
      <div className="birthdeath-main">
        <Navbar />
        <main className="birthdeath-content"><Outlet /></main>
      </div>
    </div>
  );
}

export default MainLayout;
