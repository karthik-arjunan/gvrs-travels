import React, { useState } from "react";
import "./login.css";  // ✅ Keep your CSS
import logo from "../../assets/logo.png";
import illustration from "../../assets/family.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin@123") {
      localStorage.setItem("token", "valid-admin-token");
      setError("");
      window.location.href = "/dashboard";  // ✅ Works perfectly!
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* LEFT SIDE - Your existing form */}
        <div className="login-left">
          <img src={logo} alt="GV Travels" className="login-logo" />
          <h2 className="login-title">Login</h2>
          <form onSubmit={handleSubmit}>
            <label>UserName</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
          <p className="login-footer">© 2026 GVRS Travels</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <img src={illustration} alt="Travel Illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;
