import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../pages/dashboard/dashboard.css";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <img src={logo} alt="GVRS Travels" className="app-logo" />
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default Header;
