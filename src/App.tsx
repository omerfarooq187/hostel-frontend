import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

// Public pages
import PublicLayout from "./layout/PublicLayout";
import Home from "./pages/public/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/public/Profile";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

// Admin pages
import AdminRouteWrapper from "./components/AdminRouteWrapper";
import HostelSelection from "./pages/admin/HostelSelection";
import RoleRoute from "./components/RoleRoute";
import AdminLogin from "./pages/admin/AdminLogin";

// Protection components
import ProtectedRoute from "./components/ProtectedRoute"; // adjust path if needed

import { useEffect } from "react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.navigator.userAgent.includes("Electron")) {
      if (!location.pathname.startsWith("/admin")) {
        navigate("/admin/login");
      }
    }
  }, [location, navigate]);

  return (
    <Routes>
      {/* Public routes (no login required) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      </Route>


      {/* Hostel selection route (admin only) */}
      <Route
        path="/admin/hostel-selection"
        element={
          <RoleRoute allowedRoles={["ADMIN"]}>
            <HostelSelection />
          </RoleRoute>
        }
      />

      <Route path="/admin/login" element={<AdminLogin />} />

      {/* All other admin routes */}
      <Route
        path="/admin/*"
        element={
          <RoleRoute allowedRoles={["ADMIN", "STAFF"]}>
            <AdminRouteWrapper />
          </RoleRoute>
        }
      />
    </Routes>
  );
}