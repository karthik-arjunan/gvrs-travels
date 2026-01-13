import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../pages/dashboard/dashboard.css";

const DashboardLayout = () => {
  return (
    <div className="app-layout">
      <Header />

      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
