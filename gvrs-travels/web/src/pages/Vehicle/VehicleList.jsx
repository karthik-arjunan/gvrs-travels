import React, { useState, useEffect } from "react";
import "./VehicleList.css";
import { FaCarSide, FaShuttleVan, FaTrash, FaBusAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import AddVehicleModal from "../AddVehicle/AddVehicleModal";
import { VEHICLE_API } from "../../config/api";
import axios from "axios";
import LogoLoader from "../LogoLoader/LogoLoader";
import { MdRemoveCircleOutline } from "react-icons/md";
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

/* =========================
   REUSABLE CERTIFICATE BOX
========================= */
const CertificateBox = ({ title, company, startDate, endDate }) => {
  const status = getExpiryStatus(endDate);

  return (
    <div className={`insurance-box ${status}`}>
      <div className="insurance-header">
        {title}

        {status === "expired" && <span className="expired-badge">Expired</span>}

        {status === "expiring" && (
          <span className="warning-badge">Expiring Soon</span>
        )}
      </div>

      <div className="insurance-grid">
        {/* {company && (
          <div>
            <label>Company</label>
            <p>{company}</p>
          </div>
        )} */}
        <div className="placeholder-col">
          {company ? (
            <>
              <label>Company</label>
              <p>{company}</p>
            </>
          ) : (
            <div className="placeholder-center">
              <label>&nbsp;</label>
              <MdRemoveCircleOutline className="placeholder-icon" />
            </div>
          )}
        </div>

        <div>
          <label>Start</label>
          <p>{formatDate(startDate)}</p>
        </div>

        <div>
          <label>End</label>
          <p>{formatDate(endDate)}</p>
        </div>
      </div>
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

  /* =========================
      SEARCH & PAGINATION
  ========================= */
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 3;

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

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      start = 1;
      end = Math.min(5, totalPages);
    }

    if (currentPage >= totalPages - 2) {
      start = Math.max(1, totalPages - 4);
      end = totalPages;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };
  useEffect(() => {
    fetchVehicles();
  }, []);

  /* =========================
     FILTER + PAGINATION LOGIC
  ========================= */
  const filteredVehicles = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.vehicle_number}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const indexOfLast = currentPage * cardsPerPage;
  const indexOfFirst = indexOfLast - cardsPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredVehicles.length / cardsPerPage);

  useEffect(() => {
    setCurrentPage(1);
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

  const getVehicleIcon = (type) => {
    switch (type) {
      case "car":
        return <FaCarSide className="vehicle-icon car" />;
      case "van":
        return <FaShuttleVan className="vehicle-icon van" />;
      case "bus":
        return <FaBusAlt className="vehicle-icon bus" />;
      default:
        return <FaCarSide className="vehicle-icon car" />;
    }
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

          <button
            className="add-vehicle-btn"
            onClick={() => setShowModal(true)}
          >
            + Add Vehicle
          </button>
        </div>
      </div>

      {loading && <LogoLoader />}

      <div className="vehicle-grid">
        {currentVehicles.map((v) => (
          <div key={v.id} className={`vehicle-card ${v.vehicle_status}`}>
            <div className="vehicle-top-row">
              <div className="vehicle-left">
                {getVehicleIcon(v.vehicle_type)}
                <h5>
                  {v.brand} {v.model}
                </h5>
              </div>

              <div className="vehicle-actions">
                <button
                  className="icon-btn edit"
                  onClick={() => handleEditVehicle(v)}
                >
                  <MdEdit />
                </button>

                <button
                  className="icon-btn delete"
                  onClick={() => {
                    setVehicleToDelete(v);
                    setShowDeleteModal(true);
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>Vehicle No</label>
                <p>{v.vehicle_number}</p>
              </div>

              <div className="col right">
                <label>Seats</label>
                <p>{v.seating_capacity}</p>
              </div>
            </div>

            {/* Insurance */}
            <CertificateBox
              title="Insurance Details"
              company={v.insurance_company}
              startDate={v.insurance_start_date}
              endDate={v.insurance_end_date}
            />

            {/* PUC */}
            <CertificateBox
              title="PUC Details"
              startDate={v.puc_start_date}
              endDate={v.puc_end_date}
            />

            {/* FC */}
            <CertificateBox
              title="FC Details"
              startDate={v.fc_start_date}
              endDate={v.fc_end_date}
            />

            {/* Permit */}
            <CertificateBox
              title="Permit Details"
              startDate={v.permit_start_date}
              endDate={v.permit_end_date}
            />
          </div>
        ))}
      </div>

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
      {totalPages > 1 && (
        <div className="pagination-clean">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            title="First"
          >
            &lt;&lt;
          </button>

          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            title="Previous"
          >
            &lt;
          </button>

          <div className="page-numbers">
            {getPageNumbers()[0] > 1 && (
              <>
                <button
                  className="page-number"
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </button>
                <span className="dots">...</span>
              </>
            )}

            {getPageNumbers().map((page) => (
              <button
                key={page}
                className={`page-number ${
                  currentPage === page ? "active" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            {getPageNumbers().slice(-1)[0] < totalPages && (
              <>
                <span className="dots">...</span>
                <button
                  className="page-number"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            title="Next"
          >
            &gt;
          </button>

          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            title="Last"
          >
            &gt;&gt;
          </button>
        </div>
      )}

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
    </div>
  );
};

export default VehiclesList;
