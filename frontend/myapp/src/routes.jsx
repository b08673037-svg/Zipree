import { Routes, Route } from "react-router-dom";

// Public Pages
import HomePage from "./pages/HomePage.jsx";
import FleetPage from "./pages/FleetPage.jsx";
import VehicleDetailPage from "./pages/VehicleDetailPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import OurExperiencePage from "./pages/OurExperience/OurExperiencePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// Auth Pages
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import VerifyOtpPage from "./pages/VerifyOtpPage.jsx";

// Customer Dashboard
import ProtectedRoute from "./components/dashboard/ProtectedRoute.jsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";
import DashboardOverview from "./pages/dashboard/DashboardOverview.jsx";
import MyBookings from "./pages/dashboard/MyBookings.jsx";
import BookingDetails from "./pages/dashboard/BookingDetails.jsx";
import SavedVehicles from "./pages/dashboard/SavedVehicles.jsx";
import Notifications from "./pages/dashboard/Notifications.jsx";
import Profile from "./pages/dashboard/Profile.jsx";

// Admin Dashboard
import AdminRoute from "./components/admin/AdminRoute.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminFleet from "./pages/admin/AdminFleet.jsx";
import AdminBookings from "./pages/admin/AdminBookings.jsx";
import AdminCustomers from "./pages/admin/AdminCustomers.jsx";
import AdminMessages from "./pages/admin/AdminMessages.jsx";
import AdminLoginPage from "./pages/admin/AdminLoginPage.jsx";
import AdminRegisterPage from "./pages/admin/AdminRegisterPage.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<HomePage />} />
      <Route path="/fleet" element={<FleetPage />} />
      <Route path="/fleet/:id" element={<VehicleDetailPage />} />
      <Route path="/experience" element={<OurExperiencePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* AUTH */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      {/* CUSTOMER DASHBOARD */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="wishlist" element={<SavedVehicles />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ADMIN PUBLIC */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />

      {/* ADMIN PROTECTED */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="fleet" element={<AdminFleet />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}