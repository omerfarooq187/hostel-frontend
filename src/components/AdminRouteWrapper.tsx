// src/components/AdminRouteWrapper.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";   // ✅ import auth
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import RoomsPage from "../pages/admin/Room";
import StudentsPage from "../pages/admin/Students";
import Allocations from "../pages/admin/Allocations";
import AllocationHistory from "../pages/admin/AllocationsHistory";
import RoomBeds from "../pages/admin/RoomBeds";
import FeesPage from "../pages/admin/FeesPage";
import SettingsPage from "../pages/admin/Settings";
import KitchenInventoryPage from "../pages/admin/KitchenInventory";
import StaffManagementPage from "../pages/admin/Staff";
import ReportsPage from "../pages/admin/Reports";
import MessagingPage from "../pages/admin/Messaging";

// Helper: Restrict page by role – redirects to dashboard if not allowed
const RoleGuard = ({ children, allowedRoles }) => {
  const { role } = useAuth();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const AdminRouteWrapper = () => {
  const { role } = useAuth();   // ✅ get current role

  // Check hostel selection – both admin and staff need this
  const selectedHostel = localStorage.getItem('selectedHostel');
  const isHostelSelected = selectedHostel && selectedHostel !== 'null';
  
  if (!isHostelSelected) {
    return <Navigate to="/admin/hostel-selection" replace />;
  }
  
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />

        {/* ✅ Pages accessible by both ADMIN and STAFF */}
        <Route 
          path="dashboard" 
          element={
            <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
              <AdminDashboard />
            </RoleGuard>
          } 
        />
        <Route 
          path="inventory" 
          element={
            <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
              <KitchenInventoryPage />
            </RoleGuard>
          } 
        />
        <Route 
          path="rooms" 
          element={
            <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
              <RoomsPage />
            </RoleGuard>
          } 
        />
        <Route 
          path="rooms/:roomId/beds" 
          element={
            <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
              <RoomBeds />
            </RoleGuard>
          } 
        />
        <Route 
          path="students" 
          element={
            <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
              <StudentsPage />
            </RoleGuard>
          } 
        />
        <Route 
          path="allocations" 
          element={
            <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
              <Allocations />
            </RoleGuard>
          } 
        />
        <Route 
          path="allocations/history" 
          element={
            <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
              <AllocationHistory />
            </RoleGuard>
          } 
        />
        <Route 
          path="fees" 
          element={
            <RoleGuard allowedRoles={['ADMIN', 'STAFF']}>
              <FeesPage />
            </RoleGuard>
          } 
        />


        {/* 🔐 ADMIN‑ONLY PAGES – staff will be redirected */}

        <Route
          path="staff"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <StaffManagementPage />
            </RoleGuard>
          }
        />

        <Route
          path="reports"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
                <ReportsPage />
            </RoleGuard>
          }
        />
        <Route 
          path="settings" 
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <SettingsPage />
            </RoleGuard>
          } 
        />
        <Route
          path="messaging"
          element={
            <RoleGuard allowedRoles={['ADMIN']}>
              <MessagingPage/>
            </RoleGuard>
          }
        />
      </Route>
    </Routes>
  );
};

export default AdminRouteWrapper;