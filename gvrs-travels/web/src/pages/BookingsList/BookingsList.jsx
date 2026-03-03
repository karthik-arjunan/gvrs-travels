import React, { useState, useMemo, useEffect } from "react";
import "./BookingsList.css";
import Bookings from "../CreateBookings/CreateBookings";
import { toast } from "react-toastify";
import { BOOKING_API } from "../../config/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFileExport } from "react-icons/fa";
import {
  FaPlaneDeparture,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPlus,
  FaWhatsapp,
  FaTrash,
  FaCalendarCheck,
} from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import LogoLoader from "../LogoLoader/LogoLoader";

const ITEMS_PER_PAGE = 6;
export const useCountUp = (end, duration = 800) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setValue(end);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return value;
};
const BookingsList = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  const summary = useMemo(() => {
    return [
      {
        label: "Total Trips",
        count: bookings.length,
        icon: <FaPlaneDeparture />,
        type: "total",
      },
      {
        label: "Confirmed",
        count: bookings.filter((b) => b.status === "confirmed").length,
        icon: <FaCheckCircle />,
        type: "confirmed",
      },
      {
        label: "Pending",
        count: bookings.filter((b) => b.status === "pending").length,
        icon: <FaClock />,
        type: "pending",
      },
      {
        label: "Cancelled",
        count: bookings.filter((b) => b.status === "cancelled").length,
        icon: <FaTimesCircle />,
        type: "cancelled",
      },
    ];
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return activeTab === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeTab);
  }, [activeTab, bookings]);

  useEffect(() => setCurrentPage(1), [activeTab]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await fetch(BOOKING_API);
      const data = await res.json();

      setBookings(data);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);
  // ⭐ Custom Date Formatter
  const formatPickup = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${day}/${month}/${year} ${time}`;
  };
  /* =========================
     WHATSAPP MESSAGE
  ========================= */
  const sendWhatsAppToDriver = (driverPhone, booking) => {
    if (!driverPhone) return;

    const message = `✨ *GVRS TRAVELS — Trip Confirmed*
━━━━━━━━━━━━━━━━━
🆔 *Booking ID:* ${booking.booking_id}
👤 *Customer:* ${booking.customer_name}
📞 *Customer Contact:* ${booking.customer_phone || "-"}

📍 *Route:*
${booking.pickup_location} ➜ ${booking.drop_location}

🗓 *Pickup Date & Time:*
${formatPickup(booking.pickup_datetime)}
━━━━━━━━━━━━━━━━━
⏰ Please be ready and reach pickup on time.
*GVRS Travels-Team *
📞 Support - +91 9790255173`;
    const cleanPhone = driverPhone.replace(/\D/g, "");
    const url = `https://api.whatsapp.com/send/?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const openCreate = () => {
    setEditingBooking(null);
    setShowModal(true);
  };

  const openEdit = (booking) => {
    setEditingBooking(booking);
    setShowModal(true);
  };

  const formatTripDate = (pickup, drop) => {
    if (!pickup) return "";

    const p = new Date(pickup);
    const d = drop ? new Date(drop) : null;

    const formatShort = (date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });

    const formatFull = (date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

    // Only pickup
    if (!d) return formatFull(p);

    // Same year → show compact premium style
    if (p.getFullYear() === d.getFullYear()) {
      return `${formatShort(p)} – ${formatFull(d)}`;
    }

    // Different year (rare case)
    return `${formatFull(p)} – ${formatFull(d)}`;
  };

  const getVisiblePages = () => {
    const range = 2; // how many around current
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    let pages = [];

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleExport = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const exportData = bookings.map((b) => ({
      "Booking ID": b.booking_id,
      "Pickup Location": b.pickup_location,
      "Drop Location": b.drop_location,
      "Vehicle Type": b.vehicle_type,
      "Vehicle Number": b.vehicle_number,
      Time: b.pickup_datetime,
      Amount: b.amount,
      Status: b.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, "Bookings_Report.xlsx");
  };

  return (
    <div className="booking-page">
      {/* HEADER */}
      <div className="booking-header-row">
        <h1 className="page-title">My Bookings</h1>

        <div className="header-actions">
          <div className="export-wrapper" onClick={handleExport}>
            <FaFileExport className="export-icon" />
            <span className="export-text">Export</span>
          </div>

          <button className="add-booking-btn" onClick={openCreate}>
            <FaPlus /> Add Booking
          </button>
        </div>
      </div>
      {loading && <LogoLoader />}
      {/* SUMMARY */}
      <div className="summary-grid">
        {/* {summary.map((item, i) => (
          <div key={i} className={`summary-card ${item.type}`}>
            <div className="summary-icon">{item.icon}</div>
            <div>
              <h2>{item.count}</h2>
              <p>{item.label}</p>
            </div>
          </div>
        ))} */}
        {summary.map((item, i) => {
          const animated = useCountUp(item.count);

          return (
            <div key={i} className={`summary-card ${item.type}`}>
              <div className="summary-icon">{item.icon}</div>

              <div>
                <h2>{animated}</h2>
                <p>{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
      {/* TABS */}

      <div className="tabs-pagination-row">
        {/* LEFT — Tabs */}
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

        {/* RIGHT — Pagination */}
        {totalPages > 1 && (
          <div className="card-pagination">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            {getVisiblePages().map((p) => (
              <button
                key={p}
                className={currentPage === p ? "active" : ""}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {/* BOOKINGS GRID */}
      <div className="booking-list">
        {paginatedBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No bookings found</h3>
            <p>No {activeTab} bookings available</p>
          </div>
        ) : (
          paginatedBookings.map((booking) => (
            <div
              key={booking.id}
              className={`bookings-card ${booking.status} ${
                ["confirmed"].includes(booking.status) ? "has-whatsapp" : ""
              }`}
            >
              <div className="booking-title-row">
                <h3 className="booking-title">
                  {booking.pickup_location} → {booking.drop_location}
                </h3>

                <div className="booking-actions">
                  <span className="action-icons">
                    {["confirmed"].includes(booking.status) && (
                      <button
                        className="whatsapp-pill"
                        onClick={() =>
                          sendWhatsAppToDriver(booking.contact_number, booking)
                        }
                      >
                        <FaWhatsapp />
                      </button>
                    )}

                    <button
                      className="icon-btn edit"
                      onClick={() => openEdit(booking)}
                    >
                      <MdEdit />
                    </button>

                    {/* <button className="icon-btn delete">
                      <FaTrash />
                    </button> */}
                  </span>
                </div>
              </div>

              <div className="booking-info">
                <div>
                  <span className="label">Vehicle Type</span>
                  <span className="value">
                    {booking.vehicle_type
                      ? booking.vehicle_type.charAt(0).toUpperCase() +
                        booking.vehicle_type.slice(1)
                      : "-"}
                  </span>
                </div>
                <div>
                  <span className="label">Vehicle Number</span>
                  <span className="value">{booking.vehicle_number}</span>
                </div>
                <div>
                  <span className="label">Time</span>
                  <span className="value">
                    {new Date(booking.pickup_datetime).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="booking-date">
                <span>
                  <FaCalendarCheck />
                  {formatTripDate(booking.pickup_datetime, booking.drop_date)}
                </span>

                <span className={`booking-status ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-footer">
                <div className="booking-id-block">
                  <span className="label">Booking ID</span>
                  <span className="value">{booking.booking_id}</span>
                </div>

                <div className="price">₹{booking.amount}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <Bookings
              onClose={() => setShowModal(false)}
              editingBooking={editingBooking}
              refreshBookings={fetchBookings}
            />
          </div>
        </div>
      )}
      {/* PAGINATION */}
      {/* {totalPages > 1 && (
        <div className="pagination-wrapper">
          <button
            className="pg-btn nav"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ‹
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;

            return (
              <button
                key={page}
                className={`pg-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          })}

          <button
            className="pg-btn nav"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      )} */}
    </div>
  );
};

export default BookingsList;
