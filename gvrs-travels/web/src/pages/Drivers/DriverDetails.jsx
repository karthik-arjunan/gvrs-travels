import React, { useState } from "react";
import "./DriverDetails.css";
import driverImg from "../../assets/driver.png";
import { FaPhoneVolume } from "react-icons/fa6";
import { FaEye, FaPlus } from "react-icons/fa";

const DriverDetails = ({onClose}) => {
  /* =========================
     STATE
  ========================= */
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      licenseNo: "TN123456789",
      name: "Ramesh Kumar",
      dob: "15/09/1997",
      address: "123 MG Road, Chennai",
      status: "available",
      photo: null,
    },
    {
      id: 2,
      licenseNo: "TN7878798787",
      name: "Suresh Kumar",
      dob: "20/04/1995",
      address: "Anna Nagar, Chennai",
      status: "booked",
      photo: null,
    },
    {
      id: 3,
      licenseNo: "TN1289834678",
      name: "Arun Prasad",
      dob: "11/11/1993",
      address: "Velachery, Chennai",
      status: "available",
      photo: null,
    },
    {
      id: 4,
      licenseNo: "TN4567123890",
      name: "Karthik",
      dob: "05/06/1990",
      address: "Tambaram, Chennai",
      status: "booked",
      photo: null,
    },
    {
      id: 5,
      licenseNo: "TN9988776655",
      name: "Vijay",
      dob: "09/02/1998",
      address: "Porur, Chennai",
      status: "available",
      photo: null,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [newDriver, setNewDriver] = useState({
    licenseNo: "",
    name: "",
    dob: "",
    address: "",
    contact: "",
    fatherName: "",
    emergencyContact: "",
    status: "available",
    photo: null,
    photoPreview: null,
  });

  /* =========================
     HANDLERS
  ========================= */
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewDriver((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewDriver((prev) => ({
      ...prev,
      photo: file,
      photoPreview: URL.createObjectURL(file),
    }));
  };

  const handleSaveDriver = () => {
    if (!newDriver.licenseNo || !newDriver.name) {
      alert("Please fill required fields");
      return;
    }

    setDrivers((prev) => [
      ...prev,
      {
        id: Date.now(),
        licenseNo: newDriver.licenseNo,
        name: newDriver.name,
        dob: newDriver.dob,
        address: newDriver.address,
        status: "available",
        photo: newDriver.photoPreview,
      },
    ]);

    setShowAddModal(false);
    setNewDriver({
      licenseNo: "",
      name: "",
      dob: "",
      address: "",
      contact: "",
      fatherName: "",
      emergencyContact: "",
      status: "available",
      photo: null,
      photoPreview: null,
    });
  };

  return (
    <div className="driver-page">
      {/* PAGE HEADER */}
      <div className="driver-page-header">
        <h1 className="page-title">Driver Details</h1>
        <button
          className="add-driver-btn"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="add-icon" />
          Add Driver
        </button>
      </div>

      {/* DRIVER CARDS */}
      <div className="licence-grid">
        {drivers.map((d) => (
          <div key={d.id} className={`licence-card ${d.status}`}>
            <div className="licence-header">DRIVING LICENCE</div>

            <div className="licence-body">
              <div className="licence-photo">
                <img
                  src={d.photo || driverImg}
                  alt={d.name}
                  onError={(e) => (e.target.src = driverImg)}
                />
              </div>

              <div className="licence-details">
                <p className="licence-number">{d.licenseNo}</p>
                <p>
                  <strong>Name:</strong> {d.name}
                </p>
                <p>
                  <strong>DOB:</strong> {d.dob}
                </p>
                <p>
                  <strong>Address:</strong> {d.address}
                </p>

                <p className="driver-phone">
                  <FaPhoneVolume className="phone-icon" />
                  +91 98765 43210
                </p>
              </div>
            </div>

            <div
              className="licence-view-icon"
              onClick={() => {
                setSelectedDriver(d);
                setShowModal(true);
              }}
            >
              <FaEye />
            </div>
          </div>
        ))}
      </div>

      {/* EMERGENCY DETAILS MODAL */}
      {showModal && (
        <div className="driver-modal-overlay">
          <div className="driver-modal">
            <div className="driver-modal-header">
              <h3>Driver Emergency Details</h3>
            </div>

            <div className="driver-modal-body">
              <div className="form-group">
                <label>Father / Spouse Name</label>
                <input type="text" placeholder="Enter name" />
              </div>

              <div className="form-group">
                <label>Emergency Contact Number</label>
                <input type="text" placeholder="Enter emergency number" />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DRIVER MODAL */}
      {showAddModal && (
        <div className="driver-modal-overlay">
          <div className="driver-modal">
            <div className="modal-header">
              <h3>Add Driver</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="driver-modal-body">
              <div className="form-group">
                <label>Driver Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                {newDriver.photoPreview && (
                  <img
                    src={newDriver.photoPreview}
                    alt="Preview"
                    className="driver-photo-preview"
                  />
                )}
              </div>

              <div className="form-group">
                <label>Licence Number</label>
                <input
                  type="text"
                  name="licenseNo"
                  value={newDriver.licenseNo}
                  onChange={handleAddChange}
                />
              </div>

              <div className="form-group">
                <label>Driver Name</label>
                <input
                  type="text"
                  name="name"
                  value={newDriver.name}
                  onChange={handleAddChange}
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={newDriver.dob}
                  onChange={handleAddChange}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  rows="3"
                  value={newDriver.address}
                  onChange={handleAddChange}
                />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  placeholder="Enter contact number"
                  defaultValue={selectedDriver?.emergencyContact || ""}
                />
              </div>
              <div className="form-group">
                <label>Father / Spouse Name</label>
                <input type="text" placeholder="Enter father or spouse name" />
              </div>

              <div className="form-group">
                <label>Emergency Contact Number</label>
                <input
                  type="text"
                  placeholder="Enter emergency contact number"
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button className="btn save" onClick={handleSaveDriver}>
                  Save Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetails;
