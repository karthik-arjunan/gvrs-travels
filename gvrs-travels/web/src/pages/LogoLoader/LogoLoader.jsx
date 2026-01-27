import "./LogoLoader.css";
import logo from "../../assets/logo.png";

const LogoLoader = () => {
  return (
    <div className="loader-wrapper">
      <div className="logo-loader">
        <img src={logo} alt="logo" className="logo-base" />
        <div className="logo-fill"></div>
      </div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default LogoLoader;
