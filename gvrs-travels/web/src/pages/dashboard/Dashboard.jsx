import React from "react";
import {
  FaCar,
  FaRupeeSign,
  FaCalendarCheck,
} from "react-icons/fa";
import "./dashboard.css";
import RevenueChart from "../../components/RevenueChart";
import BookingCalendar from "../../components/BookingCalendar";

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <h1 className="page-title">Dashboard</h1>

      {/* STATS CARDS */}
      <div className="stats-grid">
        {/* TOTAL BOOKINGS */}
        <div className="stat-card">
          <div className="stat-icon-box blue">
            <FaCalendarCheck />
          </div>

          <div className="stat-details">
            <p className="stat-title">Total Bookings</p>
            <h2 className="stat-value">1,200</h2>
          </div>
        </div>

        {/* VEHICLES */}
        <div className="stat-card">
          <div className="stat-icon-box green">
            <FaCar />
          </div>

          <div className="stat-details">
            <p className="stat-title">Vehicles</p>
            <h2 className="stat-value">10</h2>
          </div>
        </div>

        {/* EARNINGS */}
        <div className="stat-card">
          <div className="stat-icon-box orange">
            <FaRupeeSign />
          </div>

          <div className="stat-details">
            <p className="stat-title">Total Earnings</p>
            <h2 className="stat-value">₹1,00,000</h2>
          </div>
        </div>
      </div>

      {/* CHART + CALENDAR */}
      <div className="dashboard-grid">
        <div className="card large-card">
          <h3>Revenue Overview</h3>
          <RevenueChart />

          {/* FULL CALENDAR */}
          <div className="card calendar-card">
            <h3>Booking Calendar</h3>
            <BookingCalendar />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="card">
          <h3>Recent Activity</h3>
          <ul className="destination-list">
            <li>Chennai → Bangalore <span>35%</span></li>
            <li>Hyderabad → Goa <span>28%</span></li>
          </ul>
        </div>

        <div className="card upcoming-card">
          <h3>Upcoming Trips</h3>

          <div className="trip-item">
            <div className="trip-route">
              Chennai <span className="arrow">→</span> Coimbatore
            </div>
            <div className="trip-date">12 Jan</div>
          </div>

          <div className="trip-item">
            <div className="trip-route">
              Bangalore <span className="arrow">→</span> Mysore
            </div>
            <div className="trip-date">15 Jan</div>
          </div>

          <div className="trip-item">
            <div className="trip-route">
              Madurai <span className="arrow">→</span> Trichy
            </div>
            <div className="trip-date">18 Jan</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
