import React, { useState } from "react";
import "./Bookings.css";
import { FaCar, FaShuttleVan } from "react-icons/fa";

const Bookings = ({ onClose }) => {
  const [open, setOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [RegisterNumber, setRegisterNumber] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [dropDate, setDropDate] = useState("");
  const [amount, setAmount] = useState("");

  const sendWhatsAppMessage = (phone, message) => {
    if (!customerPhone || !driverPhone) return;

    const formattedPhone = phone.replace(/\D/g, ""); // remove spaces/symbols
    const url = `https://wa.me/91${formattedPhone}?text=${encodeURIComponent(
      message,
    )}`;

    window.open(url, "_blank");
  };

  const generateBookingId = () => {
    const year = new Date().getFullYear(); // 2026

    const key = `gvrs_booking_counter_${year}`;
    let counter = localStorage.getItem(key);

    counter = counter ? parseInt(counter, 10) + 1 : 1;
    localStorage.setItem(key, counter);

    return `GVRS-${year}-${String(counter).padStart(3, "0")}`;
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";

    const date = new Date(dateTimeStr);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}/${month}/${year} ${hours}.${minutes}${ampm}`;
  };

  const handleCreateBooking = () => {
    // Optional validation
    if (
      !customerName ||
      !customerPhone ||
      !pickup ||
      !drop ||
      !driverName ||
      !driverPhone ||
      !RegisterNumber
    ) {
      alert("Please fill all required fields");
      return;
    }

    const bookingId = generateBookingId();
    const formattedPickup = formatDateTime(pickupDateTime);

    /* =========================
        CUSTOMER MESSAGE
      ========================= */
    const customerMessage = `
    ✅ *Booking Confirmed – GVRS Travels*

    📘 *Booking ID:* ${bookingId}

    👤 *Customer Details*
    Name: ${customerName}
    Contact: ${customerPhone}
    🚗 *Trip Details*
    Pickup Location: ${pickup}
    Pickup Date & Time: ${formattedPickup}
    Vehicle No.: ${RegisterNumber}
    🧑‍✈️ *Driver Details*
    Name: ${driverName}
    Contact: ${driverPhone}

    *GVRS Travels* 🚘
    +919790255173`;

    /* =========================
        DRIVER MESSAGE
      ========================= */
    const driverMessage = `
    🚘 *New Trip Assigned – GVRS Travels*

    📘 *Booking ID:* ${bookingId}

    👤 *Customer Details*
    Name: ${customerName}
    Contact: ${customerPhone}

    📍 *Trip Route*
    Pickup: ${pickup}
    Drop: ${drop}

    Please reach the pickup location on time.
    — *GVRS Travels*
      `;

    // Open WhatsApp tabs
    sendWhatsAppMessage(customerPhone, customerMessage);
    // sendWhatsAppMessage(driverPhone, driverMessage);
    alert(`Booking Created Successfully!\nBooking ID: ${bookingId}`);
    // onClose();
  };

  // const handleCreateBooking = async () => {
  //   try {
  //     const payload = {
  //       customerName,
  //       customerPhone,
  //       pickup,
  //       drop,
  //       driverName,
  //       driverPhone,
  //       RegisterNumber,
  //     };

  //     const res = await fetch("http://localhost:8080/api/create-booking/", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) throw new Error("Server error");

  //     const data = await res.json();

  //     alert(`Booking Created Successfully!\nBooking ID: ${data.bookingId}`);
  //     // onClose();
  //   } catch (err) {
  //     console.error(err);
  //     alert("Backend not reachable or error occurred");
  //   }
  // };

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
            />
          </div>

          <div className="form-group">
            <label>Pickup Location</label>
            <input
              type="text"
              placeholder="Enter pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Drop Location</label>
            <input
              type="text"
              placeholder="Enter drop location"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
            />
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
          <div className="form-group">
            <label>Pickup Date & Time</label>
            <input
              type="datetime-local"
              value={pickupDateTime}
              onChange={(e) => setPickupDateTime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Drop Date</label>
            <input
              type="date"
              value={dropDate}
              onChange={(e) => setDropDate(e.target.value)}
            />
          </div>
          {/* VEHICLE TYPE */}
          {/* LAST ROW – 3 FIELDS */}
          <div className="form-row-3">
            {/* Pickup Date & Time */}
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
              <label>Vehicle Number</label>
              <input
                type="text"
                value={RegisterNumber}
                placeholder="Vehicle No."
                onChange={(e) =>
                  setRegisterNumber(e.target.value.toUpperCase())
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount</label>
              <div className="amount-input-wrapper">
                <span className="currency">₹</span>
                <input
                  type="number"
                  className="form-input amount-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn cancel" onClick={onClose}>
              Cancel
            </button>
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
