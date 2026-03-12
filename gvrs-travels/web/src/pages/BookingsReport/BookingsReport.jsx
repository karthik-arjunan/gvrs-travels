import React, { useEffect, useState, useRef } from "react";
import { FaPlus } from "react-icons/fa6";
import { FaFileExport } from "react-icons/fa";
import "./BookingReport.css";
import {
  BOOKING_API,
  DRIVER_API,
  TRIP_FINANCE_API,
  CREATE_TRIP_FINANCE_API,
} from "../../config/api";
import Select, { components } from "react-select";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function BookingReport() {
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [tripId, setTripId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [bookingAmount, setBookingAmount] = useState("");
  const [driverSalary, setDriverSalary] = useState("");
  const [bata, setBata] = useState("");
  const [amount, setAmount] = useState();
  const [chartData, setChartData] = useState([]);
  const [dieselAmount, setDieselAmount] = useState("");
  const [usedBookingIds, setUsedBookingIds] = useState([]);
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

  const saveReport = async () => {
    if (!tripId || !selectedDriver) {
      toast.error("Select booking and driver");
      return;
    }

    try {
      const res = await fetch(CREATE_TRIP_FINANCE_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking: tripId,
          driver: selectedDriver,
          driver_salary: Number(driverSalary),
          bata: Number(bata),
          diesel_amount: Number(dieselAmount),
          balance: Number(amount),
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      toast.success("Saved successfully");
      setShowModal(false);
      fetch(TRIP_FINANCE_API)
        .then((res) => res.json())
        .then((data) => {
          setChartData(transformData(data));
        });
    } catch (err) {
      toast.error("Error saving finance data");
    }
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

  const transformData = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const month = new Date(item.created_at).toLocaleString("default", {
        month: "short",
      });

      if (!grouped[month]) {
        grouped[month] = {
          month,
          bookings: [],
        };
      }

      grouped[month].bookings.push({
        id: item.booking_id,
        salary: item.driver_salary,
        bata: item.bata,
        diesel: item.diesel_amount,
        balance: item.balance,
        amount: item.trip_amount,
      });
    });

    return Object.values(grouped);
  };

  const COLOR_LABELS = {
    amount: { label: "Trip Amount", color: "rgb(253,181,51)" }, // amber
    bata: { label: "Driver Bata", color: "rgb(139,111,53)" }, // gold brown
    salary: { label: "Driver Salary", color: "rgb(7,169,154)" }, // teal
    diesel: { label: "Diesel Amount", color: "rgb(124,58,237)" },
  };

  const [visibleKeys, setVisibleKeys] = useState({
    amount: true,
    salary: true,
    bata: true,
    diesel: true,
  });
  const toggleKey = (key) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const hovered = payload[0];
    const row = hovered.payload;

    if (!hovered?.dataKey) return null;

    const [bookingId] = hovered.dataKey.split("_");

    const trip_amount = visibleKeys.amount
      ? (row[`${bookingId}_amount`] ?? 0)
      : null;

    const salary = visibleKeys.salary
      ? (row[`${bookingId}_salary`] ?? 0)
      : null;

    const bata = visibleKeys.bata ? (row[`${bookingId}_bata`] ?? 0) : null;

    const balance = row[`${bookingId}_balance`] ?? 0;

    return (
      <div
        style={{
          background: "#fff",
          padding: "14px 16px",
          borderRadius: "14px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb",
          minWidth: 220,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>{label}</div>

        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          {bookingId}
        </div>

        {/* VALUES */}
        <div style={{ display: "grid", gap: 6 }}>
          {/* Trip Amount */}
          {visibleKeys.amount && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLOR_LABELS.amount.color,
                }}
              />
              {COLOR_LABELS.amount.label}: ₹ {trip_amount}
            </div>
          )}
          {/* Salary */}
          {visibleKeys.salary && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLOR_LABELS.salary.color,
                }}
              />
              {COLOR_LABELS.salary.label}: ₹ {salary}
            </div>
          )}

          {/* Bata */}
          {visibleKeys.bata && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLOR_LABELS.bata.color,
                }}
              />
              {COLOR_LABELS.bata.label}: ₹ {bata}
            </div>
          )}
          {/* Diesel */}
          {visibleKeys.diesel && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLOR_LABELS.diesel.color,
                }}
              />
              {COLOR_LABELS.diesel.label}: ₹ {row[`${bookingId}_diesel`] ?? 0}
            </div>
          )}
          {/* Balance → show ONLY if amount visible */}
          {visibleKeys.amount && (
            <div
              style={{
                marginTop: 6,
                paddingTop: 6,
                borderTop: "1px dashed #e5e7eb",
                fontWeight: 700,
                color: balance >= 0 ? "#16a34a" : "#dc2626",
              }}
            >
              Balance: ₹ {balance}
            </div>
          )}
        </div>
      </div>
    );
  };

  const chartFlatData = chartData.map((m) => {
    const row = {
      month: m.month,
      bookings: m.bookings, // ✅ keep this
    };

    m.bookings.forEach((b) => {
      row[`${b.id}_amount`] = b.amount;
      row[`${b.id}_salary`] = b.salary;
      row[`${b.id}_bata`] = b.bata;
      row[`${b.id}_diesel`] = b.diesel;
      row[`${b.id}_balance`] = b.balance;
    });

    return row;
  });

  const allBookingIds = [
    ...new Set(chartData.flatMap((m) => m.bookings.map((b) => b.id))),
  ];

  useEffect(() => {
    fetch(BOOKING_API)
      .then((r) => r.json())
      .then(setBookings);
    fetch(DRIVER_API)
      .then((r) => r.json())
      .then(setDrivers);
  }, []);

  useEffect(() => {
    fetch(TRIP_FINANCE_API)
      .then((res) => res.json())
      .then((data) => {
        setChartData(transformData(data));

        // ✅ Extract used booking IDs
        const usedIds = data.map((item) => item.booking);
        setUsedBookingIds(usedIds);
      });
  }, []);

  const bookingOptions = bookings
    .filter(
      (b) => b.status === "completed" && !usedBookingIds.includes(b.id), // ✅ REMOVE already used
    )
    .map((b) => ({
      value: b.id,
      bookingId: b.booking_id,
      route: `${b.pickup_location} → ${b.drop_location}`,
      driver: b.driver,
      amount: b.amount,
    }));

  const driverOptions = drivers
    .filter((d) => String(d.id) === String(selectedBooking?.driver))
    .map((d) => ({
      value: d.id,
      label: d.name,
      phone: d.contact_number,
      avatar: d.name?.charAt(0).toUpperCase(),
    }));

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

  useEffect(() => {
    const total =
      Number(bookingAmount || 0) -
      Number(driverSalary || 0) -
      Number(bata || 0) -
      Number(dieselAmount || 0);

    setAmount(total >= 0 ? total : 0);
  }, [bookingAmount, driverSalary, bata, dieselAmount]);

  const handleExport = () => {
    if (!chartData.length) {
      toast.error("No data to export");
      return;
    }

    const exportRows = [];

    chartData.forEach((monthGroup) => {
      monthGroup.bookings.forEach((b) => {
        exportRows.push({
          Month: monthGroup.month,
          "Booking ID": b.id,
          "Trip Amount": b.amount,
          "Driver Salary": b.salary,
          Bata: b.bata,
          "Diesel Amount": b.diesel,
          Balance: b.balance,
          Date: new Date(b.date).toLocaleDateString("en-GB"),
        });
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Booking_Report.xlsx");
  };
  return (
    <div className="report-page">
      {/* HEADER */}
      <div className="report-header">
        <h1 className="report-title">Bookings Reports</h1>

        <button className="add-btn" onClick={() => setShowModal(true)}>
          <FaPlus className="add-icon" />
          Add Details
        </button>
      </div>
      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <div className="modal-header">
              <h3>Add Booking Detail Report</h3>
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
                    Booking <span className="required">*</span>
                  </label>

                  <Select
                    className="premium-select"
                    options={bookingOptions}
                    value={
                      bookingOptions.find((opt) => opt.value === tripId) || null
                    }
                    onChange={(opt) => {
                      setTripId(opt?.value || null);
                      setSelectedBooking(opt || null);
                      setBookingAmount(Math.round(opt.amount || 0));
                      setSelectedDriver(opt.driver);
                    }}
                    styles={premiumSelectStyles}
                    isSearchable
                    placeholder="Select Booking"
                    noOptionsMessage={() =>
                      selectedDriver
                        ? "No trips for this driver"
                        : "Select driver first"
                    }
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    components={{
                      Option: BookingOption,
                      SingleValue: BookingSingleValue,
                    }}
                  />
                </div>

                <div className="form-group premium-autocomplete">
                  <label>
                    Driver Name <span className="required">*</span>
                  </label>
                  <Select
                    className="premium-select"
                    options={driverOptions}
                    value={driverOptions[0] || null}
                    onChange={(opt) => setSelectedDriver(opt.value)}
                    isDisabled={!selectedBooking}
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
                  <label>Booking Amount</label>
                  <input
                    type="number"
                    value={bookingAmount}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>Driver Salary</label>
                  <input
                    type="number"
                    value={driverSalary}
                    onChange={(e) => setDriverSalary(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Bata</label>
                  <input
                    type="number"
                    value={bata}
                    onChange={(e) => setBata(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Diesel Amount</label>
                  <input
                    type="number"
                    value={dieselAmount}
                    onChange={(e) => setDieselAmount(e.target.value)}
                  />
                </div>
                <div className="form-group full-width">
                  <p
                    style={{
                      fontWeight: 700,
                      marginTop: "20px",
                      padding: "14px 14px",
                      borderRadius: "10px",
                      background: amount < 1000 ? "#fee2e2" : "#dcfce7",
                      color: amount < 1000 ? "#b91c1c" : "#166534",
                      display: "inline-block",
                      textAlign: "right",
                    }}
                  >
                    Balance: ₹ {amount}
                  </p>
                  {/* <input type="number" value={amount} readOnly /> */}
                </div>
              </div>
              {/* <div className="three-col-row"></div> */}

              <div className="modal-actions">
                <button
                  className="btn cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn save" onClick={saveReport}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {chartData.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No booking reports found</h3>
          <p>No completed booking reports available</p>
        </div>
      ) : (
        <div className="chart-card">
          <div
            style={{
              display: "flex",
              gap: 22,
              marginBottom: 14,
              alignItems: "center",
            }}
          >
            {/* Trip Amount */}
            <div
              onClick={() => toggleKey("amount")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                opacity: visibleKeys.amount ? 1 : 0.35,
                transition: "0.2s",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: "rgb(253,181,51)",
                  borderRadius: 3,
                }}
              />
              Trip Amount
            </div>

            {/* Salary */}
            <div
              onClick={() => toggleKey("salary")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                opacity: visibleKeys.salary ? 1 : 0.35,
                transition: "0.2s",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: "rgb(7,169,154)",
                  borderRadius: 3,
                }}
              />
              Salary
            </div>

            {/* Bata */}
            <div
              onClick={() => toggleKey("bata")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                opacity: visibleKeys.bata ? 1 : 0.35,
                transition: "0.2s",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: "rgb(139,111,53)",
                  borderRadius: 3,
                }}
              />
              Bata
            </div>
            {/* Diesel Amount */}
            <div
              onClick={() => toggleKey("diesel")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                opacity: visibleKeys.diesel ? 1 : 0.35,
                transition: "0.2s",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: "rgb(124,58,237)",
                  borderRadius: 3,
                }}
              />
              Diesel Amount
            </div>
            <div style={{ marginLeft: "auto" }}>
              <div className="export-wrapper" onClick={handleExport}>
                <FaFileExport className="export-icon" />
                <span className="export-text">Export</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartFlatData}>
              <defs>
                {/* Salary */}
                <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(7,169,154)" />
                  <stop offset="100%" stopColor="rgb(4,110,100)" />
                </linearGradient>

                {/* Bata */}
                <linearGradient id="bataGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139,111,53)" />
                  <stop offset="100%" stopColor="rgb(80,63,30)" />
                </linearGradient>

                {/* Trip Amount */}
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(253,181,51)" />
                  <stop offset="100%" stopColor="rgb(200,130,20)" />
                </linearGradient>
                {/* Diesel Amount */}
                <linearGradient id="dieselGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(124,58,237)" />
                  <stop offset="100%" stopColor="rgb(91,33,182)" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 13, fill: "#6b7280", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                shared={false}
                cursor={{ fill: "rgba(59,130,246,0.08)" }}
              />

              {allBookingIds.map((id) => (
                <React.Fragment key={id}>
                  {visibleKeys.salary && (
                    <Bar
                      dataKey={`${id}_salary`}
                      stackId={id}
                      fill="url(#salaryGrad)"
                    />
                  )}

                  {visibleKeys.bata && (
                    <Bar
                      dataKey={`${id}_bata`}
                      stackId={id}
                      fill="url(#bataGrad)"
                    />
                  )}
                  {visibleKeys.diesel && (
                    <Bar
                      dataKey={`${id}_diesel`}
                      stackId={id}
                      fill="url(#dieselGrad)"
                    />
                  )}

                  {visibleKeys.amount && (
                    <Bar
                      dataKey={`${id}_balance`}
                      stackId={id}
                      fill="url(#balGrad)"
                    />
                  )}
                </React.Fragment>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
