import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../pages/dashboard/dashboard.css";
import { FiLogOut, FiChevronDown } from "react-icons/fi";
const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = "Raja Gunasekaran";
  const userRole = "Admin";
  return (
    <header className="app-header">
      <div className="header-left">
        <img src={logo} alt="GVRS Travels" className="app-logo" />
      </div>

      <div className="header-right" ref={dropdownRef}>
        <div
          className="premium-user-card"
          onClick={() => setOpenMenu(!openMenu)}
        >
          <div className="premium-avatar">
            {userName?.charAt(0).toUpperCase()}
          </div>

          <div className="premium-user-info">
            <div className="premium-user-name">{userName}</div>
            <div className="premium-user-role">{userRole}</div>
          </div>

          <FiChevronDown
            className={`dropdown-arrow ${openMenu ? "rotate" : ""}`}
          />
        </div>

        {openMenu && (
          <div className="header-dropdown">
            <div className="dropdown-item logout" onClick={handleLogout}>
              <FiLogOut className="logout-icon" />
              Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
