import React, { useState, useEffect, useRef } from "react";
import "./Bookings.css";
import { FaCar, FaShuttleVan } from "react-icons/fa";
import { DRIVER_API, VEHICLE_API } from "../../config/api";
import Select, { components } from "react-select";

const Bookings = ({ onClose }) => {
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

  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const vehicleOptions = availableVehicles.map((v) => ({
    value: v.vehicle_number,
    label: v.vehicle_number,
  }));
  const statusOptions = [
    { value: "pending", label: "Pending", icon: "⏳" },
    { value: "confirmed", label: "Confirmed", icon: "✅" },
    { value: "completed", label: "Completed", icon: "✔️" },
    { value: "cancelled", label: "Cancelled", icon: "❌" },
  ];

  const StatusOption = (props) => (
    <components.Option {...props}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
      >
        <span style={{ fontSize: 16 }}>{props.data.icon}</span>
        <span>{props.data.label}</span>
      </div>
    </components.Option>
  );

  const StatusSingleValue = (props) => (
    <components.SingleValue {...props}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 4 }}
      >
        <span style={{ fontSize: 16 }}>{props.data.icon}</span>
        <span>{props.data.label}</span>
      </div>
    </components.SingleValue>
  );

  /* =========================
     FETCH DRIVERS + VEHICLES
  ========================= */
  useEffect(() => {
    fetch(DRIVER_API)
      .then((res) => res.json())
      .then((data) => setDrivers(data));

    fetch(VEHICLE_API)
      .then((res) => res.json())
      .then((data) => setVehicles(data));
  }, []);

  /* =========================
     DRIVER AUTOSUGGEST
  ========================= */
  const handleDriverChange = (value) => {
    setDriverName(value);

    if (!value.trim()) {
      setDriverPhone(""); // 👈 clear driver phone
      return;
    }

    const matches = drivers.filter((d) =>
      d.name.toLowerCase().includes(value.toLowerCase()),
    );

    setFilteredDrivers(matches);
  };

  const selectDriver = (driver) => {
    setDriverName(driver.name);
    setDriverPhone(driver.contact_number);
    setFilteredDrivers([]);
  };

  /* =========================
     VEHICLE TYPE FILTER
  ========================= */
  const handleVehicleTypeSelect = (type) => {
    setVehicleType(type);

    const filtered = vehicles.filter(
      (v) => v.vehicle_type === type && v.vehicle_status === "available",
    );

    setAvailableVehicles(filtered);
    setRegisterNumber("");
  };

  /* =========================
     CREATE BOOKING
  ========================= */
  const handleCreateBooking = () => {
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

    alert("Booking Created Successfully!");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setFilteredDrivers([]); // close dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const premiumSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "48px",
      borderRadius: "12px",
      borderColor: state.isFocused ? "#3b82f6" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
      padding: "0 8px",
      fontSize: "14px",
      transition: "0.2s ease",
      cursor: "pointer",
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 4px",
    }),

    input: (base) => ({
      ...base,
      border: "none",
      outline: "none",
      boxShadow: "none",
      padding: 0,
      margin: 0,
    }),

    singleValue: (base) => ({
      ...base,
      margin: 0,
    }),

    placeholder: (base) => ({
      ...base,
      color: "#9ca3af",
    }),

    indicatorsContainer: (base) => ({
      ...base,
      paddingRight: "6px",
    }),

    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? "#3b82f6" : "#9ca3af",
      transition: "0.2s ease",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    menu: (base) => ({
      ...base,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
      zIndex: 9999,
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999, // 🔥 above modal & cards
    }),
    option: (base, state) => ({
      ...base,
      padding: "12px 14px",
      backgroundColor: state.isFocused
        ? "#eff6ff"
        : state.isSelected
          ? "#3b82f6"
          : "#fff",
      color: state.isSelected ? "#fff" : "#111827",
      cursor: "pointer",
    }),
  };
  return (
    <div className="booking-page">
      <div className="modal-header">
        <h3>Create Booking</h3>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="booking-card">
        <div className="booking-form">
          {/* CUSTOMER */}
          <div className="form-group">
            <label>
              Customer Name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div className="form-group">
            <label>
              Customer Contact Number <span className="required">*</span>
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter contact number"
            />
          </div>

          <div className="form-group">
            <label>
              Pickup Location <span className="required">*</span>
            </label>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Enter pickup location"
            />
          </div>

          <div className="form-group">
            <label>
              Drop Location <span className="required">*</span>
            </label>
            <input
              type="text"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              placeholder="Enter drop location"
            />
          </div>

          {/* DRIVER AUTOSUGGEST */}
          <div className="form-group premium-autocomplete">
            <label>
              Driver Name <span className="required">*</span>
            </label>
            <input
              type="text"
              ref={inputRef}
              placeholder="Enter driver name"
              value={driverName}
              onChange={(e) => handleDriverChange(e.target.value)}
              autoComplete="off"
            />

            {filteredDrivers.length > 0 && (
              <div className="premium-dropdown" ref={dropdownRef}>
                {filteredDrivers.map((d) => (
                  <div
                    key={d.id}
                    className="premium-option"
                    onClick={() => selectDriver(d)}
                  >
                    <div className="option-avatar">
                      {d.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="option-info">
                      <span className="option-name">{d.name}</span>
                      <span className="option-phone">{d.contact_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>
              Driver Contact Number <span className="required">*</span>
            </label>
            <input
              type="text"
              value={driverPhone}
              readOnly
              placeholder="Auto-filled"
            />
          </div>

          {/* VEHICLE TYPE */}
          <div className="form-group">
            <label>
              Vehicle Type <span className="required">*</span>
            </label>

            <div className="vehicle-type-selector">
              <button
                type="button"
                className={`type-pill ${vehicleType === "car" ? "active" : ""}`}
                onClick={() => handleVehicleTypeSelect("car")}
              >
                <FaCar /> Car
              </button>

              <button
                type="button"
                className={`type-pill ${vehicleType === "van" ? "active" : ""}`}
                onClick={() => handleVehicleTypeSelect("van")}
              >
                <FaShuttleVan /> Van
              </button>

              <button
                type="button"
                className={`type-pill ${vehicleType === "bus" ? "active" : ""}`}
                onClick={() => handleVehicleTypeSelect("bus")}
              >
                🚌 Bus
              </button>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>
                Vehicle Number <span className="required">*</span>
              </label>

              <Select
                className="premium-select"
                options={vehicleOptions}
                value={
                  vehicleOptions.find((opt) => opt.value === RegisterNumber) ||
                  null
                }
                onChange={(selected) =>
                  setRegisterNumber(selected ? selected.value : "")
                }
                placeholder="vehicle number"
                styles={premiumSelectStyles}
                isSearchable
                isDisabled={!vehicleType}
                /* 🔥 IMPORTANT FIX */
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            <div className="form-group">
              <label>
                Amount <span className="required">*</span>
              </label>
              <div className="amount-input-wrapper">
                <span className="currency">₹</span>
                <input
                  type="number"
                  className="form-input amount-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="three-col-row">
            <div className="form-group">
              <label>Pickup Date & Time</label>
              <input type="datetime-local" />
            </div>

            <div className="form-group">
              <label>Drop Date</label>
              <input type="date" />
            </div>

            <div className="form-group">
              <label>Status</label>

              <Select
                className="premium-select"
                options={statusOptions}
                value={
                  statusOptions.find((opt) => opt.value === status) || null
                }
                onChange={(selected) =>
                  setStatus(selected ? selected.value : "")
                }
                placeholder="Select status"
                styles={premiumSelectStyles}
                isSearchable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                components={{
                  Option: StatusOption,
                  SingleValue: StatusSingleValue,
                }}
              />
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
