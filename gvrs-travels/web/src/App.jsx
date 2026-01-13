import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoute from "./layouts/ProtectedRoute";
import DriverDetails from "./pages/Drivers/DriverDetails";
import Bookings from "./pages/Bookings/Bookings";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/driver-details" element={<DriverDetails />} />
          <Route path="/bookings" element={<Bookings />} />
        </Route>
      </Route>

      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
