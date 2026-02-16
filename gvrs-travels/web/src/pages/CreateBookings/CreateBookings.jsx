import React, { useState, useEffect, useRef } from "react";
import "./CreateBookings.css";
import { FaCar, FaShuttleVan } from "react-icons/fa";
import { DRIVER_API, VEHICLE_API, BOOKING_API } from "../../config/api";
import Select, { components } from "react-select";
import { toast } from "react-toastify";
const Bookings = ({ onClose, editingBooking, refreshBookings }) => {
  const whatsappTabRef = useRef(null);
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
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [status, setStatus] = useState("pending");
  const [driverId, setDriverId] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);
  const [originalStatus, setOriginalStatus] = useState(null);
  const vehicleOptions = availableVehicles.map((v) => ({
    value: v.id, // 🔥 vehicle ID
    label: v.vehicle_number, // display text
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
        style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}
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
      .then((data) => {
        setDrivers(data);
      });

    fetch(VEHICLE_API)
      .then((res) => res.json())
      .then((data) => setVehicles(data));
  }, []);

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

  const requiredFields = [
    customerName,
    customerPhone,
    pickup,
    drop,
    driverName,
    driverPhone,
    RegisterNumber,
    pickupDateTime,
    dropDate,
    amount,
  ];

  useEffect(() => {
    if (editingBooking) {
      setStatus(editingBooking.status);
    } else {
      setStatus("pending");
    }
  }, [editingBooking]);

  useEffect(() => {
    if (editingBooking) {
      setCustomerName(editingBooking.customer_name);
      setCustomerPhone(editingBooking.customer_phone);
      setPickup(editingBooking.pickup_location);
      setDrop(editingBooking.drop_location);
      // 🔥 Resolve DRIVER from ID
      const driverObj = drivers.find((d) => d.id === editingBooking.driver);

      if (driverObj) {
        setDriverId(driverObj.id);
        setDriverName(driverObj.name);
        setDriverPhone(driverObj.contact_number);
      }

      // 🔥 Resolve VEHICLE from ID
      const vehicleObj = vehicles.find((v) => v.id === editingBooking.vehicle);

      if (vehicleObj) {
        setVehicleType(vehicleObj.vehicle_type);
        setVehicleId(vehicleObj.id);
        setRegisterNumber(vehicleObj.vehicle_number);

        // IMPORTANT → load dropdown options
        setAvailableVehicles(
          vehicles.filter((v) => v.vehicle_type === vehicleObj.vehicle_type),
        );
      }
      setPickupDateTime(toDateTimeLocal(editingBooking.pickup_datetime));
      setDropDate(editingBooking.drop_date);
      setAmount(editingBooking.amount);
      setOriginalStatus(editingBooking.status);
    }
  }, [editingBooking, vehicles]);

  /* =========================
     CREATE BOOKING
  ========================= */
  const sendWhatsAppToCustomer = (phone, booking) => {
    if (!phone) return;

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

    const message = `
      ✨ *GVRS TRAVELS — Trip Confirmation*

      ━━━━━━━━━━━━━━━━━━━

      🆔 *Booking ID*
      ${booking.booking_id}

      👤 *Customer Name*
      ${booking.customer_name}

      🚘 *Vehicle Number *
      ${booking.vehicle_number || "-"}

      👨‍✈️ *Driver Name*
      ${booking.driver_name || "-"}

      📞 *Driver Contact*
      ${booking.driver_phone || "-"}

      📍 *Route*
      ${booking.pickup_location} ➜ ${booking.drop_location}

      🗓 *Pickup Date & Time*
      ${formatPickup(booking.pickup_datetime)}

      💰 *Fare*
      ₹ ${booking.amount}

      ━━━━━━━━━━━━━━━━━━━

      📞 Need help? Contact us anytime  
      🙏 Thank you for choosing *GVRS Travels*
      `;

    const cleanPhone = phone.replace(/\D/g, "");
    const url = `https://api.whatsapp.com/send/?phone=91${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleCreateBooking = async () => {
    if (requiredFields.some((field) => !field)) {
      toast.warning("Please fill all required fields");
      return;
    }

    const payload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      pickup_location: pickup,
      drop_location: drop,
      driver: driverId,
      vehicle: vehicleId,
      pickup_datetime: pickupDateTime,
      drop_date: dropDate,
      amount: amount,
      status: status,
    };

    try {
      const url = editingBooking
        ? `${BOOKING_API}${editingBooking.id}/`
        : BOOKING_API;

      const method = editingBooking ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();

        if (errData?.license_number) {
          toast.error(errData.license_number[0]);
        } else if (errData?.detail) {
          toast.error(errData.detail);
        } else if (errData?.non_field_errors) {
          toast.error(errData.non_field_errors[0]);
        } else {
          toast.error("Vehicle already exists or invalid data");
        }
        return;
      }

      const data = await res.json();

      toast.success(
        editingBooking
          ? "Booking updated successfully"
          : "Booking created successfully",
      );

      const driverObj = drivers.find((d) => d.id === driverId);
      const vehicleObj = vehicles.find((v) => v.id === vehicleId);

      const enrichedBooking = {
        ...data,
        driver_name: driverObj?.name,
        driver_phone: driverObj?.contact_number,
        vehicle_number: vehicleObj?.vehicle_number,
      };

      if (refreshBookings) {
        await refreshBookings();
      }

      onClose(); // close modal
      const shouldSendWhatsapp =
        (!editingBooking && status === "confirmed") || // New booking confirmed
        (editingBooking &&
          originalStatus !== "confirmed" &&
          status === "confirmed"); // Status changed to confirmed

      if (shouldSendWhatsapp) {
        setTimeout(() => {
          sendWhatsAppToCustomer(customerPhone, enrichedBooking);
        }, 1000);
      }
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Server error. Please try again!");
    }
  };

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
      color: "#111827",
      cursor: "pointer",
    }),
  };

  const driverOptions = drivers
    .filter(
      (d) =>
        d.driver_status === "available" ||
        String(d.id) === String(driverId) ||
        String(d.id) === String(editingBooking?.driver),
    )
    .map((d) => ({
      value: d.id,
      label: d.name,
      phone: d.contact_number,
      avatar: d.name.charAt(0).toUpperCase(),
    }));

  const DriverOption = (props) => {
    const { label, phone, avatar } = props.data;

    return (
      <components.Option {...props}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* LEFT — Avatar + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {avatar}
            </div>

            <span style={{ fontWeight: 600 }}>{label}</span>
          </div>

          {/* RIGHT — Phone */}
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.5px",
            }}
          >
            {phone}
          </span>
        </div>
      </components.Option>
    );
  };

  const DriverSingleValue = (props) => {
    const { label, avatar } = props.data;

    return (
      <components.SingleValue {...props}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#2563eb",
              color: "#fff",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatar}
          </div>

          {label}
        </div>
      </components.SingleValue>
    );
  };

  const getMinDateTime = () => {
    const now = new Date();

    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);

    return local.toISOString().slice(0, 16);
  };

  const toDateTimeLocal = (isoString) => {
    if (!isoString) return "";

    const d = new Date(isoString);

    const pad = (n) => String(n).padStart(2, "0");

    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  };

  /* =========================
   VALIDATE FUTURE DATETIME
========================= */
  const isPastDateTime = (dateTime) => {
    const selected = new Date(dateTime);
    const now = new Date();

    // Round both to minute precision
    selected.setSeconds(0, 0);
    now.setSeconds(0, 0);

    return selected < now;
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
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, ""); // remove non-digits
                setCustomerPhone(onlyNums);
              }}
              placeholder="Enter contact number"
              maxLength={10}
            />
          </div>

          <div className="form-group">
            <label>
              Pickup Location <span className="required">*</span>
            </label>
            <input
              type="text"
              value={pickup}
              onChange={(e) => {
                const val = e.target.value;
                const formatted = val.charAt(0).toUpperCase() + val.slice(1);
                setPickup(formatted);
              }}
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
              onChange={(e) => {
                const val = e.target.value;
                const formatted = val.charAt(0).toUpperCase() + val.slice(1);
                setDrop(formatted);
              }}
              placeholder="Enter drop location"
            />
          </div>

          {/* DRIVER AUTOSUGGEST */}
          <div className="form-group premium-autocomplete">
            <label>
              Driver Name <span className="required">*</span>
            </label>
            <Select
              className="premium-select"
              options={driverOptions}
              value={
                driverOptions.find((opt) => opt.value === driverId) || null
              }
              onChange={(selected) => {
                if (!selected) return;

                setDriverName(selected.label);
                setDriverPhone(selected.phone);
                setDriverId(selected.value);
              }}
              placeholder="Select driver"
              styles={premiumSelectStyles}
              isSearchable
              filterOption={(option, inputValue) => {
                const search = inputValue.toLowerCase();

                return (
                  option.label.toLowerCase().includes(search) || // 🔥 name search
                  option.data.phone.includes(search) // 🔥 phone search
                );
              }}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              components={{
                Option: DriverOption,
                SingleValue: DriverSingleValue,
              }}
            />
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
                  vehicleOptions.find((opt) => opt.value === vehicleId) || null
                }
                onChange={(selected) => {
                  setRegisterNumber(selected ? selected.label : "");
                  setVehicleId(selected ? selected.value : null);
                }}
                placeholder="vehicle number"
                styles={premiumSelectStyles}
                isSearchable
                isDisabled={!vehicleType}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                noOptionsMessage={() =>
                  vehicleType
                    ? `No ${vehicleType}s available`
                    : "Select vehicle type first"
                }
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
              <label>
                Pickup Date & Time <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                value={pickupDateTime}
                min={getMinDateTime()}
                onChange={(e) => {
                  const value = e.target.value;

                  if (isPastDateTime(value)) {
                    toast.error("Please select future time");
                    return;
                  }

                  setPickupDateTime(value);
                }}
              />
            </div>

            <div className="form-group">
              <label>Drop Date</label>
              <input
                type="date"
                value={dropDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDropDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <Select
                className="premium-select"
                options={statusOptions}
                value={
                  statusOptions.find((opt) => opt.value === status) || null
                }
                onChange={(selected) => setStatus(selected?.value)}
                placeholder="Select status"
                styles={premiumSelectStyles}
                isSearchable={false}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isDisabled={!editingBooking}
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
              {editingBooking ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
