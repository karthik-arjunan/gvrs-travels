import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const BookingCalendar = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [formData, setFormData] = useState({
    driver: "",
    pickup: "",
    drop: "",
  });

  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Chennai → Bangalore",
      start: "2026-02-08T10:30:00",
      end: "2026-02-08T14:30:00",
      extendedProps: {
        driver: "Ramesh",
        pickup: "Chennai",
        drop: "Bangalore",
      },
    },
    {
      id: "2",
      title: "Hyderabad → Goa",
      start: "2026-02-11T09:00:00",
      end: "2026-02-11T18:00:00",
      extendedProps: {
        driver: "Suresh",
        pickup: "Hyderabad",
        drop: "Goa",
      },
    },
  ]);

  const [errors, setErrors] = useState({
    driver: "",
    pickup: "",
    drop: "",
  });

  /* DATE CLICK → CREATE BOOKING */
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr); // YYYY-MM-DD
    setSelectedEventId(null);
    setFormData({ driver: "", pickup: "", drop: "" });
    setShowModal(true);
  };

  /* EVENT CLICK → EDIT BOOKING */
  const handleEventClick = (info) => {
    const event = info.event;

    setSelectedEventId(event.id);
    setSelectedDate(event.startStr);

    setFormData({
      driver: event.extendedProps.driver || "",
      pickup: event.extendedProps.pickup || "",
      drop: event.extendedProps.drop || "",
    });

    setShowModal(true);
  };

  /* INPUT CHANGE */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [name]: "" }); // clear error

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
            : event
        )
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
        <div className="modal-overlay">
          <div className="modal booking-modal">
            <div className="driver-modal-header">
              <h3> {selectedEventId ? "Edit Booking" : "Create Booking"}</h3>
            </div>
            {/* <h3 className="modal-title">
              {selectedEventId ? "Edit Booking" : "Create Booking"}
            </h3> */}

            <p className="modal-date">
              📅 {new Date(selectedDate).toDateString()}
            </p>

            <div className="form-group">
              <label>Driver Name</label>
              <input
                type="text"
                name="driver"
                placeholder="Enter driver name"
                value={formData.driver}
                onChange={handleChange}
              />
              {errors.driver && (
                <span className="error-text">{errors.driver}</span>
              )}
            </div>

            <div className="form-group">
              <label>Pickup Location</label>
              <input
                type="text"
                name="pickup"
                placeholder="Enter pickup location"
                value={formData.pickup}
                onChange={handleChange}
              />
              {errors.pickup && (
                <span className="error-text">{errors.pickup}</span>
              )}
            </div>

            <div className="form-group">
              <label>Drop Location</label>
              <input
                type="text"
                name="drop"
                placeholder="Enter drop location"
                value={formData.drop}
                onChange={handleChange}
              />
              {errors.drop && <span className="error-text">{errors.drop}</span>}
            </div>

            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn save" onClick={handleSave}>
                Save Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingCalendar;
