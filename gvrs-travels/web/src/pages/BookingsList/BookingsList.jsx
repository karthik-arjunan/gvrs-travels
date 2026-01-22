import React, { useState, useMemo, useEffect } from "react";
import "./BookingsList.css";
import Bookings from "../Bookings/Bookings";
import {
  FaPlaneDeparture,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPlus,
  FaWhatsapp,
} from "react-icons/fa";
import { MdEdit } from "react-icons/md";


/* =========================
   SUMMARY DATA
========================= */
const summary = [
  {
    label: "Total Trips",
    count: 15,
    icon: <FaPlaneDeparture />,
    type: "total",
  },
  { label: "Confirmed", count: 8, icon: <FaCheckCircle />, type: "confirmed" },
  { label: "Pending", count: 4, icon: <FaClock />, type: "pending" },
  { label: "Cancelled", count: 3, icon: <FaTimesCircle />, type: "cancelled" },
];

/* =========================
   BOOKINGS DATA
========================= */
const bookings = [
  {
    id: "GVRS-2026-001",
    place: "Chennai",
    country: "Trichy",
    type: "Car",
    time: "11.00AM",
    date: "Feb 15 – Feb 22, 2026",
    price: 2450,
    status: "confirmed",
  },
  {
    id: "GVRS-2026-002",
    place: "Madurai",
    country: "Chennai",
    type: "Car",
    time: "11.00AM",
    date: "Mar 10 – Mar 15, 2026",
    price: 1890,
    status: "pending",
  },
  {
    id: "GVRS-2026-003",
    place: "Trichy",
    country: "Chennai",
    type: "Van",
    time: "10.00AM",
    date: "Apr 1 – Apr 8, 2026",
    price: 1650,
    status: "confirmed",
  },
  {
    id: "GVRS-2026-004",
    place: "Salem",
    country: "Trichy",
    type: "Car",
    time: "8.00AM",
    date: "May 12 – May 18, 2026",
    price: 2100,
    status: "cancelled",
  },
  {
    id: "GVRS-2026-005",
    place: "Trichy",
    country: "Thanjavur",
    type: "Car",
    time: "5.00AM",
    date: "May 12 – May 18, 2026",
    price: 2100,
    status: "completed",
  },
  {
    id: "GVRS-2026-006",
    place: "Trichy",
    country: "Coimbatore",
    type: "Car",
    time: "11.00PM",
    date: "May 12 – May 18, 2026",
    price: 2100,
    status: "completed",
  },
];

const ITEMS_PER_PAGE = 6;

const BookingsList = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);

  const filteredBookings = useMemo(() => {
    return activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);
  }, [activeTab]);

  useEffect(() => setCurrentPage(1), [activeTab]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  /* =========================
     WHATSAPP MESSAGE
  ========================= */
  const sendWhatsAppToDriver = (driverPhone, booking) => {
    if (!driverPhone) return;

    const message = `
🚘 *Trip Confirmed – GVRS Travels*

📘 Booking ID: ${booking.id}
📍 Route: ${booking.place} → ${booking.country}
📅 Date: ${booking.date}
⏰ Time: ${booking.time}

Please be on time.
— *GVRS Travels*
`;

    window.open(
      `https://wa.me/91${driverPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const openCreate = () => {
    setEditingBooking(null);
    setShowModal(true);
  };

  const openEdit = (booking) => {
    setEditingBooking(booking);
    setShowModal(true);
  };

  return (
    <div className="booking-page">
      {/* HEADER */}
      <div className="booking-header-row">
        <h1 className="page-title">My Bookings</h1>
        <button className="add-booking-btn" onClick={openCreate}>
          <FaPlus /> Add Booking
        </button>
      </div>

      {/* SUMMARY */}
      <div className="summary-grid">
        {summary.map((item, i) => (
          <div key={i} className={`summary-card ${item.type}`}>
            <div className="summary-icon">{item.icon}</div>
            <div>
              <h2>{item.count}</h2>
              <p>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-divider" />

      {/* TABS */}
      <div className="booking-tabs">
        {["all", "confirmed", "pending", "cancelled"].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* BOOKINGS GRID */}
      <div className="booking-list">
        {paginatedBookings.map((booking) => (
          <div
            key={booking.id}
            className={`bookings-card ${
              ["confirmed", "pending"].includes(booking.status)
                ? "has-whatsapp"
                : ""
            }`}
          >
            {/* STATUS + EDIT */}
            <div className="booking-actions">
              <span className={`booking-status ${booking.status}`}>
                {booking.status}
              </span>

              {["confirmed", "pending"].includes(booking.status) && (
                <button
                  className="edit-booking-btn"
                  title="Edit Booking"
                  onClick={() => openEdit(booking)}
                >
                  <MdEdit />
                </button>
              )}
            </div>

            {/* WHATSAPP */}
            {["confirmed", "pending"].includes(booking.status) && (
              <button
                className="whatsapp-pill"
                title="Send WhatsApp to Driver"
                onClick={() =>
                  sendWhatsAppToDriver(booking.driverPhone, booking)
                }
              >
                <FaWhatsapp />
              </button>
            )}

            <h3 className="booking-title">
              {booking.place} → {booking.country}
            </h3>

            <div className="booking-info">
              <div>
                <span className="label">Vehicle</span>
                <span className="value">{booking.type}</span>
              </div>
              <div>
                <span className="label">Time</span>
                <span className="value">{booking.time}</span>
              </div>
            </div>

            <div className="booking-date">📅 {booking.date}</div>

            <div className="booking-footer">
              <div>
                <span className="label">Booking ID</span>
                <span className="value">{booking.id}</span>
              </div>
              <div className="price">₹{booking.price}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <Bookings
              onClose={() => setShowModal(false)}
              editingBooking={editingBooking}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
