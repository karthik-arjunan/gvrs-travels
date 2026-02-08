import React, { useEffect, useState } from "react";
import { FaCar, FaRupeeSign, FaCalendarCheck } from "react-icons/fa";
import "./dashboard.css";
import RevenueChart from "../../components/RevenueChart";
import BookingCalendar from "../../components/BookingCalendar";
import { BOOKING_API, VEHICLE_API } from "../../config/api";
import { useCountUp } from "../BookingsList/BookingsList";

const Dashboard = () => {
  const [totalBookings, setTotalBookings] = useState(0);
  const animatedTotal = useCountUp(totalBookings);
  const [vehicleCount, setVehicleCount] = useState(0);
  const animatedVehicles = useCountUp(vehicleCount);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const animatedEarnings = useCountUp(totalEarnings);
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [bookingRes, vehicleRes] = await Promise.all([
          fetch(BOOKING_API),
          fetch(VEHICLE_API),
        ]);

        const bookings = await bookingRes.json();
        const vehicles = await vehicleRes.json();

        setTotalBookings(bookings.length);
        setVehicleCount(vehicles.length);

        // ⭐ SUM AMOUNT
      const sum = bookings
        .filter((b) => ["confirmed", "completed","cancelled"].includes(b.status))
        .reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);

        setTotalEarnings(sum);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="dashboard-content">
      <h1 className="page-title">Dashboard</h1>

      {/* STATS CARDS */}
      <div className="kpi-grid">
        {/* BOOKINGS */}
        <div className="kpi-card elite blue">
          <div className="card-glow"></div>

          <div className="kpi-icon blue">
            <FaCalendarCheck />
          </div>

          <div className="kpi-text">
            <p className="kpi-label">Total Bookings</p>
            <p className="kpi-value">{animatedTotal}</p>
          </div>
        </div>

        {/* VEHICLES */}

        <div className="kpi-card elite green">
          <div className="card-glow"></div>

          <div className="kpi-icon green">
            <FaCar />
          </div>

          <div className="kpi-text">
            <p className="kpi-label">Vehicles</p>
            <p className="kpi-value">{animatedVehicles}</p>
          </div>
        </div>

        {/* EARNINGS */}

        <div className="kpi-card elite orange">
          <div className="card-glow"></div>

          <div className="kpi-icon orange">
            <FaRupeeSign />
          </div>

          <div className="kpi-text">
            <p className="kpi-label">Total Earnings</p>
            <p className="kpi-value">₹{animatedEarnings}</p>
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
            <li>
              Chennai → Bangalore <span>35%</span>
            </li>
            <li>
              Hyderabad → Goa <span>28%</span>
            </li>
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
