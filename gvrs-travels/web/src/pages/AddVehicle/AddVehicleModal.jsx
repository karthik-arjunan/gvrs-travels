import React, { useState } from "react";
import "./AddVehicleModal.css";

const AddVehicleModal = ({ onClose, onSave }) => {
  const [carModel, setCarModel] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [availability, setAvailability] = useState("available");

  const handleSave = () => {
    if (!carModel || !vehicleNo) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      carModel,
      vehicleNo,
      availability,
    };

    console.log("Saving vehicle:", payload);
    onSave(payload);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Add Vehicle</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Car Model</label>
            <input
              type="text"
              placeholder="Ex: Toyota Etios, Swift Dzire"
              value={carModel}
              onChange={(e) => setCarModel(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Vehicle Number</label>
            <input
              type="text"
              placeholder="TN 45 AB 1234"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
            />
          </div>

          <div className="form-group">
            <label>Vehicle Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="available">Available</option>
              <option value="on-trip">On Trip</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn save" onClick={handleSave}>
            Save Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVehicleModal;
