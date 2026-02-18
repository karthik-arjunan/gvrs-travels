const BASE_URL = "http://localhost:8080";

export const API_BASE_URL = BASE_URL;

export const VEHICLE_API = `${BASE_URL}/api/vehicles/`;
export const DRIVER_API = `${BASE_URL}/api/drivers/`;
export const BOOKING_API = `${BASE_URL}/api/bookings/`;
export const DRIVER_REPORT_API = `${BASE_URL}/api/reports/create/`;
export const DRIVER_REPORT_DETAIL_API = (id) =>
  `${BASE_URL}/api/reports/driver/${id}`;
export const TRIP_FINANCE_API = `${BASE_URL}/api/trip-finance/`;
export const CREATE_TRIP_FINANCE_API = `${BASE_URL}/api/trip-finance/create/`;