import React, { useState, useEffect, useRef } from "react";
import "./VehicleList.css";
import {
  FaCarSide,
  FaShuttleVan,
  FaTrash,
  FaBusAlt,
  FaShieldAlt,
  FaFileAlt,
  FaIdCard,
  FaCheckCircle,
  FaCalendarCheck,
  FaTools,
} from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import AddVehicleModal from "../AddVehicle/AddVehicleModal";
import { VEHICLE_API } from "../../config/api";
import axios from "axios";
import LogoLoader from "../LogoLoader/LogoLoader";
import { MdRemoveCircleOutline } from "react-icons/md";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
/* =========================
   EXPIRY STATUS LOGIC
========================= */
const getExpiryStatus = (endDate) => {
  if (!endDate) return "active";

  const today = new Date();
  const end = new Date(endDate);
  const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring";
  return "active";
};

/* =========================
   DATE FORMATTER
========================= */
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

const getDaysLeft = (date) => {
  if (!date) return null;
  const diff = Math.ceil((new Date(date) - new Date()) / 86400000);
  return diff;
};

const getIcon = (title) => {
  if (title.includes("Insurance")) return <FaShieldAlt />;
  if (title.includes("PUC")) return <FaFileAlt />;
  if (title.includes("FC")) return <FaCarSide />;
  if (title.includes("Permit")) return <FaIdCard />;
  return null;
};

const CertificateBox = ({ title, company, startDate, endDate }) => {
  const status = getExpiryStatus(endDate);
  const daysLeft = getDaysLeft(endDate);

  return (
    <div
      className={`premium-cert ${status}`}
      title={`${title}
      Start Date: ${formatDate(startDate)}
      End Date: ${formatDate(endDate)}
      ${company ? "Company: " + company : ""}`}
    >
      {/* ICON + TITLE */}
      <div className="cert-header">
        <div className="cert-icon">{getIcon(title)}</div>
        <div className="cert-title">{title}</div>
      </div>

      {/* COMPANY */}
      {company && (
        <div className="cert-row">
          <span>Company</span>
          <strong>{company}</strong>
        </div>
      )}

      {/* DATES */}
      <div className="cert-row">
        <span>Start Date</span>
        <strong>{formatDate(startDate)}</strong>
      </div>

      <div className="cert-row">
        <span>End Date</span>
        <strong>{formatDate(endDate)}</strong>
      </div>

      {/* COUNTDOWN BADGE */}
      {daysLeft !== null && (
        <div className="cert-footer">
          <span className={`badge ${status}`}>
            {daysLeft < 0 ? "Expired" : `${daysLeft} days left`}
          </span>

          <button className="renew-btn">Renew</button>
        </div>
      )}
    </div>
  );
};

const VehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [toastQueue, setToastQueue] = useState([]);
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const panelRef = useRef(null);
  /* ================= ALERT ENGINE ================= */

  const getAlerts = () => {
    if (!vehicles || vehicles.length === 0) return [];

    const alerts = [];

    vehicles.forEach((v) => {
      const docs = [
        { name: "Insurance", date: v.insurance_end_date },
        { name: "PUC", date: v.puc_end_date },
        { name: "FC", date: v.fc_end_date },
        { name: "Permit", date: v.permit_end_date },
      ];

      docs.forEach((doc) => {
        if (!doc.date) return;

        const today = new Date();
        const end = new Date(doc.date);
        const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

        if (diff < 0) {
          alerts.push({
            level: "expired",
            msg: `${v.vehicle_number} — ${doc.name} expired`,
          });
        } else if (diff <= 15) {
          alerts.push({
            level: "warning",
            msg: `${v.vehicle_number} — ${doc.name} expires in ${diff} days`,
          });
        }
      });
    });

    return alerts;
  };

  const alerts = getAlerts();
  const renderStatus = (status) => {
    switch (status) {
      case "available":
        return (
          <div className="status-pill available">
            <FaCheckCircle />
          </div>
        );

      case "booked":
        return (
          <div className="status-pill booked">
            <FaCalendarCheck />
          </div>
        );

      case "maintenance":
        return (
          <div className="status-pill maintenance">
            <FaTools />
          </div>
        );

      default:
        return <div className="status-pill">Unknown</div>;
    }
  };

  /* =========================
     FETCH VEHICLES
  ========================= */
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(VEHICLE_API);
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (!alerts.length) return;
    const expiredAlerts = alerts.filter((a) => a.level === "expired");
    setToastQueue(expiredAlerts.slice(0, 5)); // limit to 5
  }, [vehicles]);

  useEffect(() => {
    if (!toastQueue.length) return;

    const timer = setInterval(() => {
      setToastQueue((q) => q.slice(1));
    }, 2500);

    return () => clearInterval(timer);
  }, [toastQueue]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowAlertPanel(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);
  /* FILTER */
  const filtered = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.vehicle_number}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  /* TABLE PAGINATION */
  const last = page * itemsPerPage;
  const first = last - itemsPerPage;
  const tableData = filtered.slice(first, last);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  /* FLEET STATS */
  const stats = { car: 0, van: 0, bus: 0 };
  vehicles.forEach((v) => stats[v.vehicle_type]++);

  /* =========================
     FILTER + PAGINATION LOGIC
  ========================= */
  const filteredVehicles = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.vehicle_number}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  /* =========================
     HANDLERS
  ========================= */
  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      await fetch(`${VEHICLE_API}${vehicleToDelete.id}/`, {
        method: "DELETE",
      });
      fetchVehicles();
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeleteModal(false);
    }
  };
  const getTypeStats = (type) => {
    const base = {
      total: 0,
      available: 0,
      booked: 0,
      maintenance: 0,
    };

    vehicles.forEach((v) => {
      if (v.vehicle_type !== type) return;

      base.total++;

      if (v.vehicle_status === "available") base.available++;
      if (v.vehicle_status === "booked") base.booked++;
      if (v.vehicle_status === "maintenance") base.maintenance++;
    });

    return base;
  };

  const getAlertIcon = (msg) => {
    if (msg.includes("Insurance")) return <FaShieldAlt />;
    if (msg.includes("PUC")) return <FaFileAlt />;
    if (msg.includes("FC")) return <FaCarSide />;
    if (msg.includes("Permit")) return <FaIdCard />;
    return null;
  };

  return (
    <div className="vehicle-page">
      <div className="vehicle-header">
        <h1>Vehicles</h1>

        <div className="vehicle-header-actions">
          <div className="search-box">
            <svg viewBox="0 0 24 24">
              <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
            </svg>

            <input
              type="text"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* <div className="alert-bell">
            <IoNotificationsOutline className="bell-icon" />
            {alerts.length > 0 && (
              <span className="alert-count">{alerts.length}</span>
            )}
          </div> */}
          <div className="alert-wrapper" ref={panelRef}>
            {/* Bell */}
            <div
              className="alert-bell"
              onClick={() => setShowAlertPanel((s) => !s)}
            >
              <IoNotificationsOutline className="bell-icon" />

              {alerts.length > 0 && (
                <span className="alert-count">{alerts.length}</span>
              )}
            </div>

            {/* Dropdown Panel */}
            {showAlertPanel && (
              <div className="alert-panel">
                {alerts.length === 0 ? (
                  <div className="alert-empty">No alerts 🎉</div>
                ) : (
                  alerts.map((a, i) => (
                    <div className={`alert-item ${a.level}`} key={i}>
                      <span className="alert-doc-icon">
                        {getAlertIcon(a.msg)}
                      </span>

                      <span className="alert-text">{a.msg}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            className="add-vehicle-btn"
            onClick={() => setShowModal(true)}
          >
            + Add Vehicle
          </button>
        </div>
      </div>

      {loading && <LogoLoader />}
      {/* ================= FLEET SUMMARY ================= */}

      <div className="fleet-summary">
        {["car", "van", "bus"].map((t) => {
          const s = getTypeStats(t);

          return (
            <div className="fleet-card premium" key={t}>
              <div className={`fleet-icon ${t}`}>
                {t === "car" ? (
                  <FaCarSide />
                ) : t === "van" ? (
                  <FaShuttleVan />
                ) : (
                  <FaBusAlt />
                )}
              </div>

              <div className="fleet-content">
                <div className="fleet-title">{t.toUpperCase()}</div>

                <div className="fleet-metrics">
                  <div className="metric total">
                    <span>Total</span>
                    <strong>{s.total}</strong>
                  </div>

                  <div className="metric available">
                    <span>Available</span>
                    <strong>{s.available}</strong>
                  </div>

                  <div className="metric booked">
                    <span>Booked</span>
                    <strong>{s.booked}</strong>
                  </div>

                  <div className="metric maintenance">
                    <span>Maintenance</span>
                    <strong>{s.maintenance}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== PREMIUM TABLE ===== */}
      <table className="premium-table">
        <thead>
          <tr>
            <th>Vehicles</th>
            <th>Seats</th>
            <th colSpan={4} style={{ textAlign: "center" }}>
              Certificates
            </th>
            <th style={{ textAlign: "center" }}>Status</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tableData.map((v) => (
            <tr key={v.id}>
              <td className="veh-no">{v.vehicle_number}</td>
              <td>{v.seating_capacity}</td>

              <td>
                <CertificateBox
                  title="Insurance"
                  company={v.insurance_company}
                  startDate={v.insurance_start_date}
                  endDate={v.insurance_end_date}
                />
              </td>

              <td>
                <CertificateBox
                  title="PUC"
                  startDate={v.puc_start_date}
                  endDate={v.puc_end_date}
                />
              </td>

              <td>
                <CertificateBox
                  title="FC"
                  startDate={v.fc_start_date}
                  endDate={v.fc_end_date}
                />
              </td>

              <td>
                <CertificateBox
                  title="Permit"
                  startDate={v.permit_start_date}
                  endDate={v.permit_end_date}
                />
              </td>
              <td className="status-col">{renderStatus(v.vehicle_status)}</td>
              <td className="action-cell">
                <div>
                  <button
                    className="action-icon edit"
                    onClick={() => handleEditVehicle(v)}
                  >
                    <MdEdit />
                  </button>

                  <button
                    className="action-icon delete"
                    onClick={() => {
                      setVehicleToDelete(v);
                      setShowDeleteModal(true);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <AddVehicleModal
          onClose={() => {
            setShowModal(false);
            setEditingVehicle(null);
          }}
          editingVehicle={editingVehicle}
          onSave={fetchVehicles}
        />
      )}
      {/* PAGINATION */}
      {/* ===== TABLE CONTROLS ===== */}
      {/* ===== TABLE CONTROLS ===== */}
      {/* <div className="table-controls">
        
      </div> */}
      <div className="table-controls">
        <div className="entries-control">
          <label>Show</label>

          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setTablePage(1);
            }}
            className="entries-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <span>entries</span>
        </div>
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={page === i + 1 ? "active" : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>Delete Vehicle?</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{vehicleToDelete?.brand}</strong>?
            </p>

            <div className="confirm-actions">
              <button
                className="btn cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button className="btn danger" onClick={handleDeleteVehicle}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="toast-stack">
        {toastQueue.map((t, i) => (
          <div key={i} className="toast-alert">
            <span className="toast-icon">🚨</span>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehiclesList;
