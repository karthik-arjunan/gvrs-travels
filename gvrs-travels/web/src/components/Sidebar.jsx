import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaUserTie,
  FaChartBar,
  FaCog,
  FaCar,
} from "react-icons/fa";
import "../pages/dashboard/dashboard.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className="nav-link">
            <FaTachometerAlt /> <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/bookingsList" className="nav-link">
            <FaClipboardList /> <span>Bookings</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/vehicles" className="nav-link">
            <FaCar /> <span>Vehicles</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/driverdetails" className="nav-link">
            <FaUserTie /> <span>Drivers</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/reports" className="nav-link">
            <FaChartBar /> <span>Reports</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className="nav-link">
            <FaCog /> <span>Settings</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
