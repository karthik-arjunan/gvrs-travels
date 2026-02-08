import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { BOOKING_API } from "../config/api";
import {
  FaIdCard,
  FaUserTie,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaWhatsapp,
} from "react-icons/fa";
const BookingCalendar = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await fetch(BOOKING_API);
        const data = await res.json();

        // ⭐ Convert API → Calendar format
        const calendarEvents = data.map((b) => {
          let color = "#94a3b8";

          if (b.status === "confirmed") color = "#22c55e";
          if (b.status === "pending") color = "#f59e0b";
          if (b.status === "cancelled") color = "#ef4444";

          return {
            id: b.id.toString(),
            title: `${b.pickup_location} → ${b.drop_location}`,
            start: b.pickup_datetime,
            end: b.drop_date || b.pickup_datetime,
            color,
            extendedProps: b, // ⭐ store full booking
          };
        });

        setEvents(calendarEvents);
      } catch (err) {
        console.error("Calendar load failed", err);
      }
    };

    loadBookings();
  }, []);

  /* DATE CLICK → CREATE BOOKING */
  const handleDateClick = (info) => {
    const clicked = info.dateStr;

    const matches = events
      .map((e) => e.extendedProps)
      .filter((b) => b.pickup_datetime?.startsWith(clicked));

    setSelectedBookings(matches);
    setShowModal(true);
  };

  /* EVENT CLICK → EDIT BOOKING */
  const handleEventClick = (info) => {
    setSelectedBookings([info.event.extendedProps]);
    setShowModal(true);
  };

  /* INPUT CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [name]: "" }); // clear error
  };

  const formatPickupStyled = (dateStr) => {
    const d = new Date(dateStr);

    const date = d.toLocaleDateString("en-IN");
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return { date, time };
  };

  /* SAVE / UPDATE BOOKING */
  const handleSave = () => {
    let newErrors = {};

    if (!formData.driver.trim()) {
      newErrors.driver = "Enter driver name";
    }

    if (!formData.pickup.trim()) {
      newErrors.pickup = "Enter pickup location";
    }

    if (!formData.drop.trim()) {
      newErrors.drop = "Enter drop location";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (selectedEventId) {
      // UPDATE EXISTING EVENT
      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEventId
            ? {
                ...event,
                title: `${formData.pickup} → ${formData.drop}`,
                extendedProps: {
                  driver: formData.driver,
                  pickup: formData.pickup,
                  drop: formData.drop,
                },
              }
            : event,
        ),
      );
    } else {
      // CREATE NEW EVENT
      setEvents((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          title: `${formData.pickup} → ${formData.drop}`,
          start: selectedDate,
          extendedProps: {
            driver: formData.driver,
            pickup: formData.pickup,
            drop: formData.drop,
          },
        },
      ]);
    }

    setShowModal(false);
    setSelectedEventId(null);
    setFormData({ driver: "", pickup: "", drop: "" });
    setErrors({ driver: "", pickup: "", drop: "" });
  };
  const isEmpty = selectedBookings.length === 0;
  return (
    <>
      {/* CALENDAR */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        selectable
        height="auto"
      />

      {/* MODAL */}
      {showModal && (
        <div className={`modal-overlay ${isEmpty ? "mini" : ""}`}>
          <div className={`modal booking-modal ${isEmpty ? "mini" : ""}`}>
            <h3 className={isEmpty ? "mini-title" : ""}>Trip Details</h3>

            {isEmpty ? (
              <p className="mini-text">No trips for this date</p>
            ) : (
              selectedBookings.map((b) => {
                const f = formatPickupStyled(b.pickup_datetime);
                return (
                  <div key={b.id} className="trip-elite">
                    <div className="trip-elite-header">
                      <div className="route">
                        {b.pickup_location} → {b.drop_location}
                      </div>

                      <div className={`status ${b.status}`}>{b.status}</div>
                    </div>

                    <div className="timeline-bar" />

                    <div className="trip-elite-grid">
                      <div className="field">
                        <FaIdCard />
                        <div>
                          <span>Booking ID</span>
                          <strong>{b.booking_id}</strong>
                        </div>
                      </div>

                      <div className="field driver">
                        <div className="avatar">
                          {(b.driver_name || "?")[0]}
                        </div>
                        <div>
                          <span>Driver</span>
                          <strong>{b.driver_name || "-"}</strong>
                        </div>
                      </div>

                      <div className="field">
                        <FaUserTie />
                        <div>
                          <span>Customer</span>
                          <strong>{b.customer_name || "-"}</strong>
                        </div>
                      </div>

                      <div className="field">
                        <FaWhatsapp />
                        <div>
                          <span>Contact</span>
                          <strong>{b.customer_phone || "-"}</strong>
                        </div>
                      </div>

                      <div className="field">
                        <FaCalendarAlt />
                        <div>
                          <span>Pickup</span>
                          <strong>
                            {f.date} - {f.time}
                          </strong>
                        </div>
                      </div>

                      <div className="field">
                        <FaMoneyBillWave />
                        <div>
                          <span>Amount</span>
                          <strong>₹ {b.amount}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="trip-actions">
                      <button
                        className="wa-btn"
                        onClick={() =>
                          window.open(`https://wa.me/91${b.customer_phone}`)
                        }
                      >
                        <FaWhatsapp /> Message
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            <div className="modal-actions">
              <button
                className={isEmpty ? "mini-close-btn" : "mini-close-btn"}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingCalendar;
