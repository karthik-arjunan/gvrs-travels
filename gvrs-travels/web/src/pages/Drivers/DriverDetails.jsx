import React, { useState, useEffect } from "react";
import "./DriverDetails.css";
import driverImg from "../../assets/driver.png";
import { FaPhoneVolume, FaPlus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { toast } from "react-toastify";
import { API_BASE_URL, DRIVER_API } from "../../config/api";
import { FaCheckCircle, FaRoute, FaTrash } from "react-icons/fa";
import Cropper from "react-easy-crop";
import LogoLoader from "../LogoLoader/LogoLoader";
/* =========================
   EMPTY DRIVER TEMPLATE
========================= */
const emptyDriver = {
  photo: null,
  name: "",
  contact: "",
  emergencyContact: "",
  licenseNo: "",
  dob: "",
  address: "",
  fatherName: "",
  status: "available",
  photoPreview: null,
};

const DriverDetails = () => {
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [newDriver, setNewDriver] = useState(emptyDriver);
  const [drivers, setDrivers] = useState([]);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [loading, setLoading] = useState(false);
  const filtered = drivers;
  /* TABLE PAGINATION */
  const last = page * itemsPerPage;
  const first = last - itemsPerPage;
  const tableData = filtered.slice(first, last);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  /* =========================

     HANDLERS

  ========================= */

  const handleAddChange = (e) => {
    const { name, value } = e.target;

    setNewDriver((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;

    const digits = value.replace(/\D/g, "");

    if (digits.length <= 10) {
      setNewDriver((prev) => ({ ...prev, [name]: digits }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setNewDriver((prev) => ({
      ...prev,

      photoPreview: imageUrl,

      photo: file,
    }));

    setShowCropper(true);
  };

  const setDriverStatus = (status) => {
    setNewDriver((prev) => ({ ...prev, status }));
  };

  /* =========================

     FETCH DRIVERS

  ========================= */

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await fetch(DRIVER_API);

      const data = await res.json();
      setDrivers(data);
    } catch (err) {
      toast.error("Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  /* =========================

     IMAGE CROP HELPERS

  ========================= */

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();

      img.addEventListener("load", () => resolve(img));

      img.addEventListener("error", reject);

      img.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(new File([blob], "driver.png", { type: "image/png" }));
      }, "image/png");
    });
  };

  const handleCropSave = async () => {
    const croppedImage = await getCroppedImg(
      newDriver.photoPreview,

      croppedAreaPixels,
    );

    setNewDriver((prev) => ({
      ...prev,

      photo: croppedImage,

      photoPreview: URL.createObjectURL(croppedImage),
    }));

    setShowCropper(false);
  };

  /* =========================
     SAVE DRIVER
  ========================= */
  const handleSaveDriver = async () => {
    const {
      name,
      photo,
      contact,
      emergencyContact,
      licenseNo,
      dob,
      fatherName,
      address,
      status,
    } = newDriver;

    // 🔍 Validation
    if (
      !name ||
      !contact ||
      contact.length !== 10 ||
      !emergencyContact ||
      emergencyContact.length !== 10 ||
      !licenseNo ||
      !dob ||
      !fatherName ||
      !address
    ) {
      toast.warning("Please fill all required fields properly");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("name", name);
      if (photo) {
        formData.append("photo", photo);
      } else {
        const defaultPhoto = await urlToFile(driverImg, "default_driver.png");
        formData.append("photo", defaultPhoto);
      }
      formData.append("contact_number", contact);
      formData.append("emergency_contact_number", emergencyContact);
      formData.append("license_number", licenseNo);
      formData.append("date_of_birth", dob);
      formData.append("father_or_spouse_name", fatherName);
      formData.append("address", address);
      formData.append("driver_status", status);

      const url = editingDriver
        ? `${DRIVER_API}${editingDriver.id}/`
        : DRIVER_API;

      const method = editingDriver ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
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
          toast.error("Driver already exists or invalid data");
        }
        return;
      }

      toast.success(
        editingDriver
          ? "Driver updated successfully"
          : "Driver added successfully",
      );
      await fetchDrivers();
      setShowAddModal(false);
      setEditingDriver(null);
      setNewDriver(emptyDriver);
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Server error. Please try again.");
    }
  };

  const urlToFile = async (url, filename) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  };
  /* =========================
     EDIT HANDLER
  ========================= */

  const handleEditDriver = (d) => {
    setEditingDriver(d);

    setNewDriver({
      photo: null,
      photoPreview: d.photo ? `${API_BASE_URL}${d.photo}` : null,
      name: d.name || "",
      contact: d.contact_number || "",
      emergencyContact: d.emergency_contact_number || "",
      licenseNo: d.license_number || "",
      dob: d.date_of_birth || "",
      address: d.address || "",
      fatherName: d.father_or_spouse_name || "",
      status: d.driver_status || "available",
    });

    setShowAddModal(true);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  /* =========================
   PAGINATION LOGIC
========================= */
  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 8;

  const indexOfLast = currentPage * cardsPerPage;
  const indexOfFirst = indexOfLast - cardsPerPage;
  const currentDrivers = filteredDrivers.slice(indexOfFirst, indexOfLast);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  const handleDeleteDriver = async (driver) => {
    if (!driver) return;
    try {
      const res = await fetch(`${DRIVER_API}${driver.id}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Driver deleted successfully");
      setShowDeleteModal(false);
      setDriverToDelete(null);
      fetchDrivers();
    } catch (err) {
      toast.error("Failed to delete driver");
    }
  };

  return (
    <div className="driver-page">
      <div className="driver-page-header">
        <h1 className="page-title">Driver Details</h1>

        <div className="driver-header-actions">
          <div className="search-box">
            <svg viewBox="0 0 24 24">
              <path d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z" />
            </svg>

            <input
              type="text"
              placeholder="Search driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            className="add-driver-btn"
            onClick={() => {
              setEditingDriver(null);
              setNewDriver(emptyDriver);
              setShowAddModal(true);
            }}
          >
            <FaPlus className="add-icon" />
            Add Driver
          </button>
        </div>
      </div>
      {loading && <LogoLoader />}
      {/* DRIVER CARDS */}
      <div className="licence-grid">
        {currentDrivers.map((d) => (
          <div key={d.id} className={`licence-card ${d.driver_status}`}>
            <div className="licence-header">DRIVING LICENCE</div>

            <div className="licence-body">
              <div className="licence-photo">
                <img
                  src={d.photo ? `${API_BASE_URL}${d.photo}` : driverImg}
                  alt={d.name}
                  onError={(e) => (e.target.src = driverImg)}
                />
              </div>

              <div className="licence-details">
                <p className="licence-number">{d.license_number}</p>
                <p>
                  <strong>Name:</strong> {d.name}
                </p>
                <p>
                  <strong>DOB:</strong> {formatDate(d.date_of_birth)}
                </p>
                <p>
                  <strong>Address:</strong> {d.address}
                </p>

                <p className="driver-phone">
                  <FaPhoneVolume className="phone-icon" />
                  +91 {d.contact_number}
                </p>
              </div>
            </div>

            {/* EDIT ICON */}
            <div className="licence-actions">
              <div
                className="licence-view-icon edit"
                onClick={() => handleEditDriver(d)}
                title="Edit Driver"
              >
                <MdEdit />
              </div>

              <div
                className="licence-view-icon delete"
                onClick={() => {
                  setDriverToDelete(d);
                  setShowDeleteModal(true);
                }}
              >
                <FaTrash />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <div className="modal-header">
              <h3>{editingDriver ? "Edit Driver" : "Add Driver"}</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-form">
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
                      alt="preview"
                      className="driver-photo-preview"
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Licence Number <span className="required">*</span></label>
                  <input
                    type="text"
                    name="licenseNo"
                    value={newDriver.licenseNo}
                    onChange={handleAddChange}
                  />
                </div>

                <div className="form-group">
                  <label>Driver Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={newDriver.name}
                    onChange={handleAddChange}
                  />
                </div>

                <div className="form-group">
                  <label>Date of Birth <span className="required">*</span></label>
                  <input
                    type="date"
                    name="dob"
                    value={newDriver.dob}
                    onChange={handleAddChange}
                  />
                </div>

                <div className="form-group">
                  <label>Address <span className="required">*</span></label>
                  <textarea
                    name="address"
                    rows="4"
                    value={newDriver.address}
                    onChange={handleAddChange}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Number <span className="required">*</span></label>
                  <input
                    type="text"
                    name="contact"
                    inputMode="numeric"
                    value={newDriver.contact}
                    onChange={handlePhoneChange}
                    maxLength={10}
                  />
                </div>

                <div className="form-group">
                  <label>Father / Spouse Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="fatherName"
                    value={newDriver.fatherName}
                    onChange={handleAddChange}
                  />
                </div>

                <div className="form-group">
                  <label>Emergency Contact <span className="required">*</span></label>
                  <input
                    type="text"
                    name="emergencyContact"
                    inputMode="numeric"
                    value={newDriver.emergencyContact}
                    onChange={handlePhoneChange}
                    maxLength={10}
                  />
                </div>
                <div className="form-group">
                  <label>
                    Driver Status <span className="required">*</span>
                  </label>

                  <div className="status-selector">
                    <button
                      type="button"
                      className={`status-btn available ${newDriver.status === "available" ? "active" : ""}`}
                      onClick={() => setDriverStatus("available")}
                    >
                      <FaCheckCircle />
                      Available
                    </button>

                    <button
                      type="button"
                      className={`status-btn ontrip ${newDriver.status === "booked" ? "active" : ""}`}
                      onClick={() => setDriverStatus("booked")}
                    >
                      <FaRoute />
                      Booked
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button className="btn save" onClick={handleSaveDriver}>
                  {editingDriver ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* IMAGE CROPPER */}
      {showCropper && (
        <div className="cropper-overlay">
          <div className="cropper-container">
            <Cropper
              image={newDriver.photoPreview}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(c, p) => setCroppedAreaPixels(p)}
            />

            <div className="cropper-controls">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
              />

              <div className="cropper-btns">
                <button
                  className="cancel"
                  onClick={() => setShowCropper(false)}
                >
                  Cancel
                </button>

                <button className="save" onClick={handleCropSave}>
                  Crop & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ULTRA PREMIUM PAGINATION */}
      <div className="pagination-container">
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ‹
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
            ›
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal">
            <h3>Delete Driver?</h3>
            <strong className="driver-name">{driverToDelete?.name}</strong>

            <div className="confirm-actions">
              <button
                className="btn cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn danger"
                onClick={() => handleDeleteDriver(driverToDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetails;
