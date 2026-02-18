import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaUserTie,
  FaList,
  FaChartBar,
  FaCar,
  FaChevronDown,
  FaIdBadge,
  FaChartLine,
} from "react-icons/fa";
import "../pages/dashboard/dashboard.css";
import { HiOutlinePresentationChartBar } from "react-icons/hi";
const Sidebar = () => {
  const [openDrivers, setOpenDrivers] = useState(false);
  const [openBookings, setOpenBookings] = useState(false);

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" className="nav-link">
            <FaTachometerAlt /> <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="sidebar-group">
          <div
            className="group-title"
            onClick={() => setOpenBookings((prev) => !prev)}
          >
            <div className="nav-icon">
              <FaClipboardList />
            </div>

            <span className="nav-text">Bookings</span>

            <FaChevronDown className={`chev ${openBookings ? "open" : ""}`} />
          </div>

          {openBookings && (
            <ul className={`group-submenu ${openBookings ? "open" : ""}`}>
              {/* LIST */}
              <li>
                <NavLink
                  to="/bookingsList"
                  className={({ isActive }) =>
                    `sub-link ${isActive ? "active-sub" : ""}`
                  }
                >
                  <FaList className="sub-icon" />
                  List
                </NavLink>
              </li>

              {/* REPORT */}
              <li>
                <NavLink
                  to="/bookingReport"
                  className={({ isActive }) =>
                    `sub-link ${isActive ? "active-sub" : ""}`
                  }
                >
                  <FaChartBar className="sub-icon" />
                  Reports
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        <li>
          <NavLink to="/vehiclesList" className="nav-link">
            <FaCar /> <span>Vehicles</span>
          </NavLink>
        </li>
        {/* ⭐ DRIVERS GROUP */}
        <li className="sidebar-group">
          <div
            className="group-title"
            onClick={() => setOpenDrivers((prev) => !prev)}
          >
            <div className="nav-icon">
              <FaUserTie />
            </div>

            <span className="nav-text">Drivers</span>

            <FaChevronDown className={`chev ${openDrivers ? "open" : ""}`} />
          </div>

          {openDrivers && (
            <ul className={`group-submenu ${openDrivers ? "open" : ""}`}>
              <li>
                <NavLink
                  to="/driverdetails"
                  className={({ isActive }) =>
                    `sub-link ${isActive ? "active-sub" : ""}`
                  }
                >
                  <FaIdBadge className="sub-icon" />
                  List
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/driverReport"
                  className={({ isActive }) =>
                    `sub-link ${isActive ? "active-sub" : ""}`
                  }
                >
                  <FaChartLine className="sub-icon" />
                  Reports
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        {/*<li>
          <NavLink to="/settings" className="nav-link">
            <FaCog /> <span>Settings</span>
          </NavLink>
        </li> */}
      </ul>
    </aside>
  );
};

export default Sidebar;
