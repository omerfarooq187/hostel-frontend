import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";

// Layouts
import PublicLayout from "./layout/PublicLayout";

// Lazy load all pages for better performance
const Home = lazy(() => import("./pages/public/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/public/Profile"));
const VerifyEmail = lazy(() => import("./components/VerifyEmail"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/ResetPassword"));

// Admin pages
const HostelSelection = lazy(() => import("./pages/admin/HostelSelection"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminRouteWrapper = lazy(() => import("./components/AdminRouteWrapper"));

// Protection components (keep these as normal imports since they're small)
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}