import React, { useEffect, useState, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { DRIVER_REPORT_API, DRIVER_REPORT_DETAIL_API } from "../../config/api";

import Select, { components } from "react-select";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa6";

import "./DriverReport.css";
import { DRIVER_API, BOOKING_API } from "../../config/api";

export default function DriverReport() {
  const [showModal, setShowModal] = useState(false);

  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedDriver, setSelectedDriver] = useState("");
  const [driverTrips, setDriverTrips] = useState([]);
  const [tripId, setTripId] = useState(null);

  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [drivenKm, setDrivenKm] = useState("");
  const [usedBookings, setUsedBookings] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [openMonths, setOpenMonths] = useState({});
  const [visibleCount, setVisibleCount] = useState({});
  // ===============================
  // FETCH DATA
  // ===============================
  useEffect(() => {
    fetch(DRIVER_API)
      .then((r) => r.json())
      .then(setDrivers);

    fetch(BOOKING_API)
      .then((r) => r.json())
      .then(setBookings);
  }, []);

  // ===============================
  // FILTER TRIPS WHEN DRIVER CHANGES
  // ===============================
  useEffect(() => {
    if (!selectedDriver) {
      setDriverTrips([]);
      setTripId("");
      return;
    }

    const filtered = bookings.filter(
      (b) => String(b.driver?.id ?? b.driver) === String(selectedDriver),
    );

    setDriverTrips(filtered);
    setTripId("");
  }, [selectedDriver, bookings]);

  // ===============================
  // AUTO CALCULATE DRIVEN KM
  // ===============================

  const [kmError, setKmError] = useState("");

  const shown = useRef(false);

  useEffect(() => {
    if (startKm === "" || endKm === "") {
      setDrivenKm("");
      return;
    }

    const diff = Number(endKm) - Number(startKm);

    if (diff >= 0) {
      setDrivenKm(diff);
    } else {
      setDrivenKm(""); // prevents negative
    }
  }, [startKm, endKm]);

  useEffect(() => {
    if (!selectedDriver) {
      setChartData([]);
      return;
    }

    fetch(`${DRIVER_REPORT_DETAIL_API(selectedDriver)}/`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((r) => ({
          name: r.booking_code,
          route: `${r.pickup_location} → ${r.drop_location}`,
          km: r.driven_km,
          date: r.created_at,
        }));

        setChartData(formatted);

        // ⭐ store used booking ids
        setUsedBookings(data.map((r) => r.booking));
      });
  }, [selectedDriver]);

  // ===============================
  // SAVE REPORT
  // ===============================
  const saveReport = async () => {
    if (!selectedDriver) {
      toast.error("Select Driver");
      return;
    }

    if (!tripId) {
      toast.error("Select Booking");
      return;
    }

    try {
      const res = await fetch(DRIVER_REPORT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          driver: Number(selectedDriver),
          booking: Number(tripId),
          start_km: Number(startKm),
          end_km: Number(endKm),
          driven_km: Number(drivenKm),
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      const saved = await res.json();

      // ⭐ Update chart instantly
      setChartData((prev) => {
        const filtered = prev.filter((p) => p.name !== saved.booking_code);
        return [
          ...filtered,
          {
            name: saved.booking_code,
            km: saved.driven_km,
            route: `${saved.pickup_location} → ${saved.drop_location}`,
            date: saved.created_at, // ⭐ IMPORTANT
          },
        ];
      });
      setUsedBookings((prev) => [...prev, Number(tripId)]);
      toast.success("Report saved");

      // refresh chart data
      const refreshed = await fetch(
        `${DRIVER_REPORT_DETAIL_API(selectedDriver)}/`,
      ).then((r) => r.json());

      setChartData(
        refreshed.map((r) => ({
          name: r.booking_code,
          route: `${r.pickup_location} → ${r.drop_location}`,
          km: r.driven_km,
          date: r.created_at,
        })),
      );
      // ⭐ Reset form
      setShowModal(false);
      setStartKm("");
      setEndKm("");
      setDrivenKm("");
      setTripId("");
    } catch (err) {
      toast.error("Failed to save report");
    }
  };

  const driverOptions = drivers.map((d) => ({
    value: d.id,
    label: d.name,
    phone: d.contact_number,
    avatar: d.name?.charAt(0).toUpperCase(),
  }));

  const bookingOptions = driverTrips
    .filter((b) => b.status === "completed" && !usedBookings.includes(b.id))
    .map((b) => ({
      value: b.id,
      bookingId: b.booking_id,
      route: `${b.pickup_location} → ${b.drop_location}`,
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
      fontWeight: 700,
      letterSpacing: "0.4px",
      color: "#111827",
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
      borderRadius: "18px",
      padding: "8px",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999, // 🔥 above modal & cards
    }),
    option: (base, state) => ({
      ...base,
      padding: "12px 14px",
      fontSize: "12px",
      lineHeight: "1.2",
      backgroundColor: state.isFocused
        ? "#eff6ff"
        : state.isSelected
          ? "#3b82f6"
          : "#fff",
      color: "#111827",
      cursor: "pointer",
    }),
  };

  const BookingOption = (props) => {
    const { bookingId, route } = props.data;

    return (
      <components.Option {...props}>
        <div className="elite-option">
          {/* LEFT — BOOKING ID */}
          <span className="elite-id">{bookingId}</span>

          {/* RIGHT — ROUTE */}
          <span className="elite-route">{route}</span>
        </div>
      </components.Option>
    );
  };

  const BookingSingleValue = (props) => {
    return (
      <components.SingleValue {...props}>
        <strong>{props.data.bookingId}</strong>
      </components.SingleValue>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div
          style={{
            background: "white",
            padding: "12px 16px",
            borderRadius: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700 }}>{data.bookingId}</div>

          <div style={{ color: "#6b7280", marginTop: 2 }}>{data.route}</div>

          <div style={{ marginTop: 6, color: "#4f46e5" }}>{data.km} KM</div>
        </div>
      );
    }
    return null;
  };

  const toggleMonth = (month) => {
    setOpenMonths((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  const showMore = (month) => {
    setVisibleCount((prev) => ({
      ...prev,
      [month]: (prev[month] || 10) + 10,
    }));
  };

  return (
    <div className="report-container">
      {/* HEADER */}
      <div className="driver-page-header">
        <h1 className="page-title">Driver Performance</h1>

        <div className="driver-header-actions">
          <button
            className="add-driver-btn"
            onClick={() => {
              setShowModal(true);
            }}
          >
            <FaPlus className="add-icon" />
            Add Details
          </button>
        </div>
      </div>
      <div className="form-group premium-autocomplete driver-select-small">
        <label>
          Driver Name <span className="required">*</span>
        </label>
        <Select
          className="premium-select"
          options={driverOptions}
          value={driverOptions.find((opt) => opt.value === selectedDriver)}
          onChange={(opt) => setSelectedDriver(opt.value)}
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
      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <div className="modal-header">
              <h3>Add Detail Report</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-form">
                <div className="form-group premium-autocomplete">
                  <label>
                    Driver Name <span className="required">*</span>
                  </label>
                  <Select
                    className="premium-select"
                    options={driverOptions}
                    value={driverOptions.find(
                      (opt) => opt.value === selectedDriver,
                    )}
                    onChange={(opt) => setSelectedDriver(opt.value)}
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

                <div className="form-group premium-autocomplete">
                  <label>
                    Booking <span className="required">*</span>
                  </label>

                  <Select
                    className="premium-select"
                    options={bookingOptions}
                    value={
                      bookingOptions.find((opt) => opt.value === tripId) || null
                    }
                    onChange={(opt) => setTripId(opt ? opt.value : "")}
                    styles={premiumSelectStyles}
                    isSearchable
                    placeholder="Select Booking"
                    noOptionsMessage={() =>
                      selectedDriver
                        ? "No trips for this driver"
                        : "Select driver first"
                    }
                    isDisabled={!selectedDriver}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    components={{
                      Option: BookingOption,
                      SingleValue: BookingSingleValue,
                    }}
                  />
                </div>
                <div className="three-col-row">
                  <div className="form-group">
                    <label>
                      Start KM <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={startKm}
                      onChange={(e) => setStartKm(e.target.value)}
                      placeholder="Enter start KM"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      End KM <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={endKm}
                      onChange={(e) => setEndKm(e.target.value)}
                      placeholder="Enter end KM"
                    />
                  </div>

                  <div className="form-group">
                    <label>Driven KM</label>
                    <input type="number" value={drivenKm} readOnly />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn save"
                  disabled={!drivenKm || Number(drivenKm) <= 0}
                  onClick={saveReport}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CHART ================= */}
      {chartData.length > 0 && (
        <div className="chart-card">
          {Object.entries(
            chartData.reduce((acc, item) => {
              console.log("Grouping item:", item.name, item.date); // Debug log
              if (!item.date) return acc;
              const d = new Date(item.date.replace(" ", "T"));

              const key = `${d.getFullYear()}-${d.getMonth()}`;

              const month = d.toLocaleString("default", {
                month: "short",
                year: "numeric",
              });

              if (!acc[month]) acc[month] = [];
              acc[month].push(item);
              return acc;
            }, {}),
          ).map(([month, bookings]) => {
            const limit = visibleCount[month] || 10;
            const visibleBookings = bookings.slice(0, limit);

            return (
              <div key={month} style={{ marginBottom: 26 }}>
                {/* HEADER */}
                <div
                  onClick={() => toggleMonth(month)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    background: "#f1f5f9",
                    padding: "12px 16px",
                    borderRadius: 12,
                    fontWeight: 700,
                  }}
                >
                  <span>{month}</span>

                  <span
                    style={{
                      background: "#e0e7ff",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {bookings.length} Bookings
                  </span>
                </div>

                {/* LIST */}
                {openMonths[month] && (
                  <div style={{ marginTop: 12 }}>
                    {visibleBookings.map((b) => (
                      <div
                        key={b.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          marginBottom: 10,
                          padding: "10px 14px",
                          borderRadius: 12,
                          background: "#f9fafb",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                          transition: "0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#eef2ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#f9fafb")
                        }
                      >
                        {/* Dot */}
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg,#6366f1,#9333ea)",
                          }}
                        />

                        {/* Booking ID */}
                        <div style={{ fontWeight: 600 }}>{b.name}</div>

                        {/* KM */}
                        <div style={{ marginLeft: "auto", fontWeight: 700 }}>
                          {b.km} km
                        </div>
                      </div>
                    ))}

                    {/* LOAD MORE */}
                    {bookings.length > limit && (
                      <div
                        onClick={() => showMore(month)}
                        style={{
                          textAlign: "center",
                          marginTop: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                          color: "#4f46e5",
                        }}
                      >
                        View more…
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {kmError && <div className="km-error">{kmError}</div>}
    </div>
  );
}
