import React from "react";
import "./VehicleList.css";
import { FaCar, FaShuttleVan, FaWhatsapp, FaEdit } from "react-icons/fa";

const VehiclesList = () => {
  const vehicles = [
    {
      id: "VH-001",
      type: "Car",
      brand: "Toyota Etios",
      number: "TN 45 AB 1234",
      driver: "Ramesh",
      phone: "9790341157",
      status: "available",
    },
    {
      id: "VH-002",
      type: "Van",
      brand: "Tempo Traveller",
      number: "TN 22 CD 5678",
      driver: "Suresh",
      phone: "9842123456",
      status: "on-trip",
    },
    {
      id: "VH-003",
      type: "Car",
      brand: "Swift Dzire",
      number: "TN 09 XY 9988",
      driver: "Arun",
      phone: "9876543210",
      status: "maintenance",
    },
  ];

  return (
    <div className="vehicle-page">
      <div className="vehicle-header">
        <h1>Vehicles</h1>
        <button className="add-vehicle-btn">+ Add Vehicle</button>
      </div>

      <div className="vehicle-grid">
        {vehicles.map((v) => (
          <div key={v.id} className="vehicle-card">
            <div className={`vehicle-status ${v.status}`}>{v.status}</div>

            <div className="vehicle-top">
              {v.type === "Car" ? <FaCar /> : <FaShuttleVan />}
              <h3>{v.brand}</h3>
            </div>

            <div className="vehicle-info">
              <div>
                <span className="label">Vehicle No</span>
                <span className="value">{v.number}</span>
              </div>
              <div>
                <span className="label">Driver</span>
                <span className="value">{v.driver}</span>
              </div>
            </div>

            <div className="vehicle-footer">
              <button
                className="whatsapp-btn"
                onClick={() =>
                  window.open(`https://wa.me/91${v.phone}`, "_blank")
                }
              >
                <FaWhatsapp />
              </button>

              <button className="edit-btn">
                <FaEdit />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehiclesList;
