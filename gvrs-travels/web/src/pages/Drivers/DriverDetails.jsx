import React, { useState, useEffect } from "react";
import "./DriverDetails.css";
import driverImg from "../../assets/driver.png";
import { FaPhoneVolume } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

const DriverDetails = () => {
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
      contact: "9876543210",
      status: "available",
      photo: null,
    },
    {
      id: 2,
      licenseNo: "TN7878798787",
      name: "Suresh Kumar",
      dob: "1995-04-20",
      address: "Anna Nagar, Chennai",
      contact: "9876543211",
      status: "booked",
      photo: null,
    },
    {
      id: 3,
      licenseNo: "TN1289834678",
      name: "Arun Prasad",
      dob: "11/11/1993",
      address: "Velachery, Chennai",
      contact: "9876543210",
      status: "available",
      photo: null,
    },
    {
      id: 4,
      licenseNo: "TN4567123890",
      name: "Karthik",
      dob: "05/06/1990",
      address: "Tambaram, Chennai",
      contact: "9677504660",
      status: "booked",
      photo: null,
    },
    {
      id: 5,
      licenseNo: "TN9988776655",
      name: "Vijay",
      dob: "09/02/1998",
      address: "Porur, Chennai",
      contact: "9790119105",
      status: "available",
      photo: null,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const emptyDriver = {
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
  };

  const [newDriver, setNewDriver] = useState(emptyDriver);

  /* =========================
     PREFILL WHEN EDITING
  ========================= */
  useEffect(() => {
    if (editingDriver) {
      setNewDriver({
        ...editingDriver,
        photoPreview: editingDriver.photo,
      });
    } else {
      setNewDriver(emptyDriver);
    }
  }, [editingDriver]);

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

  /* =========================
     SAVE / UPDATE DRIVER
  ========================= */
  const handleSaveDriver = () => {
    if (!newDriver.licenseNo || !newDriver.name) {
      alert("Please fill required fields");
      return;
    }

    if (editingDriver) {
      // UPDATE EXISTING
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === editingDriver.id ? { ...newDriver, id: d.id } : d,
        ),
      );
    } else {
      // ADD NEW
      setDrivers((prev) => [...prev, { ...newDriver, id: Date.now() }]);
    }

    setShowAddModal(false);
    setEditingDriver(null);
    setNewDriver(emptyDriver);
  };

  return (
    <div className="driver-page">
      {/* PAGE HEADER */}
      <div className="driver-page-header">
        <h1 className="page-title">Driver Details</h1>

        <button
          className="add-driver-btn"
          onClick={() => {
            setEditingDriver(null);
            setShowAddModal(true);
          }}
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
                  +91 {d.contact}
                </p>
              </div>
            </div>

            {/* EDIT ICON */}
            <div
              className="licence-view-icon"
              onClick={() => {
                setEditingDriver(d);
                setShowAddModal(true);
              }}
              title="Edit Driver"
            >
              <MdEdit />
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT DRIVER MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingDriver ? "Edit Driver Details" : "Add Driver"}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingDriver(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
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
                  placeholder="Driver licence number"
                  value={newDriver.licenseNo}
                  onChange={handleAddChange}
                />
              </div>

              <div className="form-group">
                <label>Driver Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Driver name"
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
                  placeholder="Driver address"
                  value={newDriver.address}
                  onChange={handleAddChange}
                />
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="contact"
                  placeholder="Driver contact number"
                  value={newDriver.contact}
                  onChange={handleAddChange}
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
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDriver(null);
                  }}
                >
                  Cancel
                </button>

                <button className="btn save" onClick={handleSaveDriver}>
                  {editingDriver ? "Update Driver" : "Save Driver"}
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
