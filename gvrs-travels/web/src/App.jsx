import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./layouts/ProtectedRoute";
import DriverDetails from "./pages/Drivers/DriverDetails";
import Bookings from "./pages/CreateBookings/CreateBookings";
import BookingsList from "./pages/BookingsList/BookingsList";
import VehiclesList from "./pages/Vehicle/VehicleList";
import DriverReport from "./pages/DriverReport/DriverReport";
function App() {
  return (
    <>
      {/* 🔥 Toast Container - Global */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/driverdetails" element={<DriverDetails />} />
            <Route path="/bookingsList" element={<BookingsList />} />
            <Route path="/vehiclesList" element={<VehiclesList />} />
            <Route path="/driverReport" element={<DriverReport />} />
          </Route>
        </Route>

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
