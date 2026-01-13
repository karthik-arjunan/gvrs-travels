import React, { useState } from "react";
import "./Bookings.css";
import { FaCar, FaShuttleVan } from "react-icons/fa";

const Bookings = () => {
  const [open, setOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  const generateBookingId = () => {
    const year = new Date().getFullYear(); // 2026

    const key = `gvrs_booking_counter_${year}`;
    let counter = localStorage.getItem(key);

    counter = counter ? parseInt(counter, 10) + 1 : 1;
    localStorage.setItem(key, counter);

    return `GVRS-${year}-${String(counter).padStart(3, "0")}`;
  };

  const sendWhatsAppMessage = (phone, message) => {
    const COMPANY_WHATSAPP_NUMBER = "919677504660"; // remove spaces & symbols
    const url = `https://wa.me/91${COMPANY_WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  const handleCreateBooking = () => {
    if (
      !customerName ||
      !customerPhone ||
      !pickup ||
      !drop ||
      !driverName ||
      !driverPhone
    ) {
      alert("Please fill all required fields");
      return;
    }

    const bookingId = generateBookingId();

    /* CUSTOMER MESSAGE */
    const customerMessage = `
    ✅ *Booking Confirmed*
    📘 *Booking ID:* ${bookingId}

    👤 *Customer*
    Name: ${customerName}

    🚗 *Trip*
    Pickup: ${pickup}
    Drop: ${drop}

    🧑‍✈️ *Driver*
    Name: ${driverName}
    Contact: ${driverPhone}

    Thank you for choosing *GVRS Travels* 🚘
    Safe journey!
      `;

    /* DRIVER MESSAGE */
    const driverMessage = `
    🚘 *New Trip Assigned*

    📘 *Booking ID:* ${bookingId}

    👤 *Customer*
    Name: ${customerName}
    Contact: ${customerPhone}

    📍 *Trip*
    Pickup: ${pickup}
    Drop: ${drop}

    Please reach pickup location on time.
    — *GVRS Travels*  
    `;

    // Send WhatsApp
    sendWhatsAppMessage(customerPhone, customerMessage);
    sendWhatsAppMessage(driverPhone, driverMessage);

    alert(`Booking Created Successfully!\nBooking ID: ${bookingId}`);
  };

  return (
    <div className="booking-page">
      <h1 className="page-title">Create Booking</h1>

      <div className="booking-card">
        <div className="booking-form">
          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />{" "}
          </div>

          <div className="form-group">
            <label>Customer Contact Number</label>
            <input
              type="text"
              placeholder="Enter contact number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />{" "}
          </div>

          <div className="form-group">
            <label>Pickup Location</label>
            <input type="text" placeholder="Enter pickup location" />
          </div>

          <div className="form-group">
            <label>Drop Location</label>
            <input type="text" placeholder="Enter drop location" />
          </div>

          {/* DRIVER NAME */}
          <div className="form-group">
            <label>Driver Name</label>
            <input
              type="text"
              placeholder="Enter driver name"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
            />
          </div>
          {/* DRIVER NUMBER */}
          <div className="form-group">
            <label>Driver Contact Number</label>
            <input
              type="text"
              placeholder="Enter driver contact number"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
            />{" "}
          </div>
          {/* VEHICLE TYPE */}
          {/* LAST ROW – 3 FIELDS */}
          <div className="form-row-3">
            <div className="form-group">
              <label>Type</label>

              <div className={`vehicle-dropdown ${open ? "open" : ""}`}>
                <div className="vehicle-select" onClick={() => setOpen(!open)}>
                  {vehicleType ? (
                    <span className="vehicle-selected">
                      {vehicleType === "car" && (
                        <>
                          <FaCar className="vehicle-icon" /> Car
                        </>
                      )}
                      {vehicleType === "van" && (
                        <>
                          <FaShuttleVan className="vehicle-icon" /> Van
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="placeholder">Select vehicle type</span>
                  )}

                  <span className="arrow">▾</span>
                </div>

                {open && (
                  <div className="vehicle-options">
                    <div
                      className="vehicle-option"
                      onClick={() => {
                        setVehicleType("car");
                        setOpen(false);
                      }}
                    >
                      <FaCar className="vehicle-icon" />
                      <span>Car</span>
                    </div>

                    <div
                      className="vehicle-option"
                      onClick={() => {
                        setVehicleType("van");
                        setOpen(false);
                      }}
                    >
                      <FaShuttleVan className="vehicle-icon" />
                      <span>Van</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Member Count</label>
              <input type="number" placeholder="Enter member count" />
            </div>
            <div className="form-group">
              <label>Registration Number</label>
              <input type="text" placeholder="Register Number" />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn cancel">Cancel</button>
            <button className="btn save" onClick={handleCreateBooking}>
              Create Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
