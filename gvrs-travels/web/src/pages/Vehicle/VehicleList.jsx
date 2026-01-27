import React, { useState, useEffect } from "react";
import "./VehicleList.css";
import { FaCar, FaShuttleVan, FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import AddVehicleModal from "../AddVehicle/AddVehicleModal";
import { VEHICLE_API } from "../../config/api";
import axios from "axios";
import LogoLoader from "../LogoLoader/LogoLoader";

const VehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     FETCH VEHICLES
  ========================= */

  const fetchVehicles = async () => {

    try {
      const res = await axios.get(VEHICLE_API);
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    // try {
    //   setLoading(true);
    //   const res = await fetch(VEHICLE_API);
    //   const data = await res.json();
    //   setVehicles(data);
    // } catch (err) {
    //   console.error("Fetch error:", err);
    //   alert("Failed to load vehicles");
    // } finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  /* =========================
     INSURANCE STATUS LOGIC
  ========================= */

  const insuranceStatus = (endDate) => {
    if (!endDate) return "safe";

    const today = new Date();
    const expiry = new Date(endDate);
    const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "expired";
    if (diffDays <= 30) return "expiring";
    return "safe";
  };

  /* =========================
     HANDLERS
  ========================= */

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const handleDeleteVehicle = async () => {
    try {
      await fetch(`${VEHICLE_API}${vehicleToDelete.id}/`, {
        method: "DELETE",
      });

      setShowDeleteModal(false);
      setVehicleToDelete(null);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="vehicle-page">
      <div className="vehicle-header">
        <h1>Vehicles</h1>
        <button className="add-vehicle-btn" onClick={() => setShowModal(true)}>
          + Add Vehicle
        </button>
      </div>

      {loading && <p className="loading">Loading vehicles...</p>}

      <div className="vehicle-grid">
        {vehicles.length === 0 ? (
          <div className="no-data-wrapper">
            <div className="no-data-card">
              <div className="no-data-icon">🚗</div>
              <h3>No Vehicles Added</h3>
              <p>
                You haven’t added any vehicles yet. Start by adding your first
                vehicle.
              </p>
            </div>
          </div>
        ) : (
          vehicles.map((v) => {
            const status = insuranceStatus(v.insurance_end_date);
            return (
              <div key={v.id} className={`vehicle-card ${v.vehicle_status}`}>
                <div className="vehicle-top-row">
                  <div className="vehicle-left">
                    {v.vehicle_type === "car" ? <FaCar /> : <FaShuttleVan />}
                    <h5>
                      {v.brand} {v.model}
                    </h5>
                  </div>

                  <div className="vehicle-actions">
                    <button
                      className="icon-btn edit"
                      onClick={() => handleEditVehicle(v)}
                      title="Edit Vehicle"
                    >
                      <MdEdit />
                    </button>

                    <button
                      className="icon-btn delete"
                      onClick={() => {
                        setVehicleToDelete(v);
                        setShowDeleteModal(true);
                      }}
                      title="Delete Vehicle"
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

                {/* INSURANCE BLOCK */}
                <div className={`insurance-box ${status}`}>
                  <div className="insurance-header">
                    Insurance Details
                    {status === "expired" && (
                      <span className="expired-badge">Expired</span>
                    )}
                    {status === "expiring" && (
                      <span className="warning-badge">Expiring Soon</span>
                    )}
                  </div>

                  <div className="insurance-grid">
                    <div>
                      <label>Company</label>
                      <p>{v.insurance_company}</p>
                    </div>

                    <div>
                      <label>Start</label>
                      <p>{v.insurance_start_date}</p>
                    </div>

                    <div>
                      <label>End</label>
                      <p>{v.insurance_end_date}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT MODAL */}
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

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>Delete Vehicle?</h3>
            <p>
              Are you sure you want to delete
              <strong> {vehicleToDelete?.brand}</strong> ?
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
