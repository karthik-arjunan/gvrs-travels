import React, { useState, useEffect } from "react";
import "./AddVehicleModal.css";
import {
  FaCar,
  FaShuttleVan,
  FaCheckCircle,
  FaRoute,
  FaTools,
  FaGasPump,
  FaChargingStation,
} from "react-icons/fa";
import { GiFuelTank } from "react-icons/gi";
import { VEHICLE_API } from "../../config/api";
import { toast } from "react-toastify";
import Select from "react-select";

const brandOptions = [
  { value: "Toyota", label: "Toyota" },
  { value: "Honda", label: "Honda" },
  { value: "Hyundai", label: "Hyundai" },
  { value: "Tata", label: "Tata" },
  { value: "Mahindra", label: "Mahindra" },
  { value: "Maruti Suzuki", label: "Maruti Suzuki" },
  { value: "Kia", label: "Kia" },
  { value: "Skoda", label: "Skoda" },
  { value: "Volkswagen", label: "Volkswagen" },
  { value: "BMW", label: "BMW" },
  { value: "Audi", label: "Audi" },
];

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


const AddVehicleModal = ({ onClose, onSave, editingVehicle }) => {
  const [vehicleType, setVehicleType] = useState("");
  const [brand, setBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [seatCapacity, setSeatCapacity] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [insurance_company, setInsuranceCompany] = useState("");
  const [insurance_start_date, setInsuranceStartDate] = useState("");
  const [insurance_end_date, setInsuranceEndDate] = useState("");
  const [carStatus, setCarStatus] = useState("");

  const handleSave = async () => {
    if (!vehicleType || !carModel || !vehicleNo) {
      toast.warning("Please fill all required fields");
      return;
    }

    const payload = {
      vehicle_type: vehicleType,
      brand: brand,
      model: carModel,
      vehicle_number: vehicleNo,
      fuel_type: fuelType,
      seating_capacity: seatCapacity,
      status: carStatus,
      insurance_company: insurance_company,
      insurance_start_date: insurance_start_date,
      insurance_end_date: insurance_end_date,
      vehicle_status: carStatus,
    };

    try {
      const url = editingVehicle
        ? `${VEHICLE_API}${editingVehicle.id}/`
        : VEHICLE_API;

      const method = editingVehicle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save vehicle");

      const data = await res.json();

      toast.success(
        editingVehicle
          ? "Vehicle updated successfully"
          : "Vehicle added successfully",
      );

      onSave();
      onClose(); // close modal
    } catch (err) {
      console.error("API Error:", err);
      toast.error("Server error. Please try again!");
    }
  };

  useEffect(() => {
    if (editingVehicle) {
      setVehicleType(editingVehicle.vehicle_type);
      setBrand(editingVehicle.brand);
      setCarModel(editingVehicle.model);
      setVehicleNo(editingVehicle.vehicle_number);
      setSeatCapacity(editingVehicle.seating_capacity);
      setFuelType(editingVehicle.fuel_type);
      setCarStatus(editingVehicle.vehicle_status);
      setInsuranceCompany(editingVehicle.insurance_company);
      setInsuranceStartDate(editingVehicle.insurance_start_date);
      setInsuranceEndDate(editingVehicle.insurance_end_date);
    }
  }, [editingVehicle]);

  return (
    <div className="modal-overlay">
      <div className="booking-modal">
        <div className="modal-header">
          <h3>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="booking-card">
          <div className="booking-form">
            <div className="form-group">
              <label>
                Vehicle Type <span className="required">*</span>
              </label>

              <div className="vehicle-type-selector">
                <button
                  type="button"
                  className={`type-pill ${vehicleType === "car" ? "active" : ""}`}
                  onClick={() => setVehicleType("car")}
                >
                  <FaCar />
                  Car
                </button>

                <button
                  type="button"
                  className={`type-pill ${vehicleType === "van" ? "active" : ""}`}
                  onClick={() => setVehicleType("van")}
                >
                  <FaShuttleVan />
                  Van
                </button>

                <button
                  type="button"
                  className={`type-pill ${vehicleType === "bus" ? "active" : ""}`}
                  onClick={() => setVehicleType("bus")}
                >
                  🚌 Bus
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>
                Brand <span className="required">*</span>
              </label>
              <Select
                className="premium-select"
                options={brandOptions}
                value={brandOptions.find((b) => b.value === brand) || null}
                onChange={(selected) => setBrand(selected.value)}
                placeholder="Select or search brand"
                styles={premiumSelectStyles}
                isSearchable
              />
              {/* <datalist id="brand-list">
                <option value="Toyota" />
                <option value="Honda" />
                <option value="Hyundai" />
                <option value="Tata" />
                <option value="Mahindra" />
                <option value="Maruti Suzuki" />
                <option value="Kia" />
                <option value="Skoda" />
                <option value="Volkswagen" />
                <option value="BMW" />
                <option value="Audi" />
              </datalist> */}
            </div>
            <div className="form-group">
              <label>
                Model <span className="required">*</span>
              </label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => {
                  const value = e.target.value;
                  const formatted =
                    value.charAt(0).toUpperCase() + value.slice(1);
                  setCarModel(formatted);
                }}
                placeholder="Ex: Etios, Dzire, Crysta"
              />
            </div>

            <div className="form-group">
              <label>
                Vehicle Number <span className="required">*</span>
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                placeholder="Vehicle Number"
              />
            </div>
            <div className="form-group">
              <label>
                Seat Capacity <span className="required">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter seat capacity"
                value={seatCapacity}
                onChange={(e) => setSeatCapacity(e.target.value)}
                min="1"
                step="1"
                inputMode="numeric"
                pattern="[0-9]*"
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label>
                Fuel Type <span className="required">*</span>
              </label>

              <div className="fuel-type-group">
                <button
                  type="button"
                  className={`fuel-btn ${fuelType === "petrol" ? "active" : ""}`}
                  onClick={() => setFuelType("petrol")}
                >
                  <FaGasPump />
                  Petrol
                </button>

                <button
                  type="button"
                  className={`fuel-btn ${fuelType === "diesel" ? "active" : ""}`}
                  onClick={() => setFuelType("diesel")}
                >
                  <GiFuelTank />
                  Diesel
                </button>

                <button
                  type="button"
                  className={`fuel-btn ${fuelType === "electric" ? "active" : ""}`}
                  onClick={() => setFuelType("electric")}
                >
                  <FaChargingStation />
                  Electric
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                Insurance Company <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Bajaj Allianz, ICICI Lombard, HDFC ERGO"
                name="insurance_company"
                value={insurance_company}
                onChange={(e) => {
                  const value = e.target.value;
                  const formatted =
                    value.charAt(0).toUpperCase() + value.slice(1);
                  setInsuranceCompany(formatted);
                }}
              />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">
                  Insurance Start Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  name="insurance_start_date"
                  value={insurance_start_date}
                  onChange={(e) => setInsuranceStartDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Insurance End Date <span className="required">*</span>
                </label>
                <input
                  type="date"
                  className="form-input"
                  name="insurance_end_date"
                  value={insurance_end_date}
                  onChange={(e) => setInsuranceEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Vehicle Status <span className="required">*</span>
              </label>

              <div className="status-selector">
                <button
                  type="button"
                  className={`status-btn available ${carStatus === "available" ? "active" : ""}`}
                  onClick={() => setCarStatus("available")}
                >
                  <FaCheckCircle />
                  Available
                </button>

                <button
                  type="button"
                  className={`status-btn ontrip ${carStatus === "on-trip" ? "active" : ""}`}
                  onClick={() => setCarStatus("on-trip")}
                >
                  <FaRoute />
                  On Trip
                </button>

                <button
                  type="button"
                  className={`status-btn maintenance ${carStatus === "maintenance" ? "active" : ""}`}
                  onClick={() => setCarStatus("maintenance")}
                >
                  <FaTools />
                  Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn save" onClick={handleSave}>
            {editingVehicle ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal;
