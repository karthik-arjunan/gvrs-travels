import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./layouts/ProtectedRoute";
import DriverDetails from "./pages/Drivers/DriverDetails";
import Bookings from "./pages/Bookings/Bookings";
import BookingsList from "./pages/BookingsList/BookingsList";
import VehiclesList from "./pages/Vehicle/VehicleList";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/driverdetails" element={<DriverDetails />} />
          <Route path="/bookingsList" element={<BookingsList />} />
          <Route path="/vehiclesList" element={<VehiclesList />} />
        </Route>
      </Route>

      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
