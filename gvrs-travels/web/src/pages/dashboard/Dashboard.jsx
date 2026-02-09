import React, { useEffect, useState, useRef } from "react";
import { FaCar, FaRupeeSign, FaCalendarCheck } from "react-icons/fa";
import "./dashboard.css";
import RevenueChart from "../../components/RevenueChart";
import BookingCalendar from "../../components/BookingCalendar";
import { BOOKING_API, VEHICLE_API } from "../../config/api";
import { useCountUp } from "../BookingsList/BookingsList";
import KpiMiniBar from "../../components/KpiMiniBar";
import VehicleUsageMiniBar from "../../components/VehicleUsageMiniBar";
import EarningsMiniChart from "../../components/EarningsMiniChart";

const Dashboard = () => {
  const [totalBookings, setTotalBookings] = useState(0);
  const animatedTotal = useCountUp(totalBookings);
  const [vehicleCount, setVehicleCount] = useState(0);
  const animatedVehicles = useCountUp(vehicleCount);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const animatedEarnings = useCountUp(totalEarnings);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const prevIdsRef = useRef([]);
  const [highlighted, setHighlighted] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [growth, setGrowth] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [bookingRes, vehicleRes] = await Promise.all([
          fetch(BOOKING_API),
          fetch(VEHICLE_API),
        ]);

        const bookingData = await bookingRes.json();
        const vehicles = await vehicleRes.json();

        // ⭐ SUM AMOUNT
        const sum = bookingData
          .filter((b) =>
            ["confirmed", "completed", "cancelled"].includes(b.status),
          )
          .reduce((acc, b) => acc + parseFloat(b.amount || 0), 0);

        setTotalEarnings(sum);
        setBookings(bookingData);
        setTotalBookings(bookingData.length);
        setVehicleCount(vehicles.length);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const loadUpcomingTrips = async () => {
      try {
        const res = await fetch(BOOKING_API);
        const data = await res.json();

        const now = new Date();
        const statusPriority = {
          confirmed: 0,
          pending: 1,
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const getDateOnly = (dt) => {
          const d = new Date(dt);
          return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };

        const upcoming = data
          // ✅ future dates ONLY (ignore time)
          .filter((b) => {
            const tripDate = getDateOnly(b.pickup_datetime);
            return tripDate >= today;
          })

          // ✅ remove cancelled
          .filter((b) => ["confirmed", "pending"].includes(b.status))

          // ✅ sort
          .sort((a, b) => {
            const statusDiff =
              statusPriority[a.status] - statusPriority[b.status];
            if (statusDiff !== 0) return statusDiff;

            return (
              getDateOnly(a.pickup_datetime) - getDateOnly(b.pickup_datetime)
            );
          })

          .slice(0, 5);

        setUpcomingTrips(upcoming);
      } catch (err) {
        console.error("Upcoming trips load failed", err);
      }
    };

    loadUpcomingTrips();
  }, []);

  useEffect(() => {
    fetch(BOOKING_API)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const sorted = [...data]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5); // show last 5

        setRecentBookings(sorted);
      })
      .catch((err) => console.error("Recent Activity Error:", err));
  }, []);

  useEffect(() => {
    if (!bookings.length) return;

    const now = new Date();

    const current = bookings.filter((b) => {
      const d = new Date(b.created_at);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1);

    const previous = bookings.filter((b) => {
      const d = new Date(b.created_at);
      return (
        d.getMonth() === prevDate.getMonth() &&
        d.getFullYear() === prevDate.getFullYear()
      );
    }).length;

    let percent = 0;

    if (previous > 0) {
      percent = ((current - previous) / previous) * 100;
    }

    setGrowth(percent.toFixed(1));
  }, [bookings]);

  const loadRecentBookings = () => {
    setLoadingRecent(true);

    fetch(BOOKING_API)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const sorted = [...data]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        // ⭐ Detect new IDs
        const newIds = sorted
          .map((b) => b.id)
          .filter((id) => !prevIdsRef.current.includes(id));

        if (newIds.length) {
          setHighlighted(newIds);

          // remove highlight after animation
          setTimeout(() => setHighlighted([]), 3000);
        }

        prevIdsRef.current = sorted.map((b) => b.id);

        setRecentBookings(sorted);
        setLoadingRecent(false);
      })
      .catch(() => setLoadingRecent(false));
  };

  useEffect(() => {
    loadRecentBookings();

    // ⭐ Live refresh every 10 seconds
    const interval = setInterval(loadRecentBookings, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatShortDate = (dateStr) => {
    const d = new Date(dateStr);

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const getRelativeTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = [
      { label: "day", sec: 86400 },
      { label: "hour", sec: 3600 },
      { label: "min", sec: 60 },
    ];

    for (let i of intervals) {
      const count = Math.floor(seconds / i.sec);
      if (count > 0) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
    }

    return "Just now";
  };

  return (
    <div className="dashboard-content">
      <h1 className="page-title">Dashboard</h1>

      {/* STATS CARDS */}
      <div className="kpi-grid">
        {/* BOOKINGS */}
        <div className="kpi-card elite blue">
          <div className="card-glow"></div>

          <div className="kpi-left">
            <div className="kpi-icon blue">
              <FaCalendarCheck />
            </div>

            <div className="kpi-text">
              <p className="kpi-label">Total Bookings</p>

              <div className="kpi-row">
                <p className="kpi-value">{animatedTotal}</p>

                <div className="trend-pill up">↗ {growth}%</div>
              </div>
            </div>
          </div>

          {/* ⭐ RIGHT SIDE GRAPH */}
          <div className="kpi-graph">
            <KpiMiniBar />
          </div>
        </div>

        {/* VEHICLES */}

        <div className="kpi-card elite green">
          <div className="card-glow"></div>

          <div className="kpi-left">
            <div className="kpi-icon green">
              <FaCar />
            </div>

            <div className="kpi-text">
              <p className="kpi-label">Vehicles</p>

              <div className="kpi-row">
                <p className="kpi-value">{animatedVehicles}</p>
              </div>
            </div>
          </div>
          {/* ⭐ RIGHT SIDE GRAPH */}
          <div className="kpi-graph">
            <VehicleUsageMiniBar />
          </div>
        </div>

        {/* EARNINGS */}

        <div className="kpi-card elite orange">
          <div className="card-glow"></div>

          <div className="kpi-left">
            <div className="kpi-icon orange">
              <FaRupeeSign />
            </div>

            <div className="kpi-text">
              <p className="kpi-label">Total Earnings</p>
              <p className="kpi-value">₹{animatedEarnings}</p>
            </div>
          </div>

          <div className="kpi-graph">
            <EarningsMiniChart />
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

        <div className="recent-card">
          <h3 className="recent-title">Recent Activity</h3>

          {recentBookings.map((b) => (
            <div
              key={b.id}
              className={`elite-card status-activity-${b.status}`}
            >
              {/* Avatar */}
              <div className="elite-avatar">{(b.driver_name || "D")[0]}</div>

              {/* Content */}
              <div className="elite-content">
                <div className="elite-route">
                  {b.pickup_location} → {b.drop_location}
                </div>

                <div className="elite-meta">
                  {getRelativeTime(b.created_at)}
                </div>
              </div>

              {/* Right Accent Dot */}
              <div className="elite-dot" />
            </div>
          ))}
        </div>

        <div className="upcoming-card premium">
          <h3>Upcoming Trips</h3>

          {upcomingTrips.map((trip) => (
            <div
              key={trip.id}
              className={`trip-row premium trip-card ${trip.status}`}
            >
              {/* <div key={trip.id} className="trip-row premium "> */}
              <div className="trip-left-accent" />

              <div className="route">
                <span className="from">{trip.pickup_location}</span>
                <span className="arrow">→</span>
                <span className="to">{trip.drop_location}</span>
              </div>

              <div className="trip-date">
                {formatShortDate(trip.pickup_datetime)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
