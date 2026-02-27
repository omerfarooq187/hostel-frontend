// src/pages/admin/AdminLayout.jsx
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext"; 

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);

  // KitchenInventoryIcon component
  const KitchenInventoryIcon = ({ size = 24, color = 'currentColor', className = '' }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <circle cx="9" cy="6" r="0.5" fill={color} />
      <circle cx="15" cy="6" r="0.5" fill={color} />
      <circle cx="6" cy="12" r="1" />
      <circle cx="18" cy="12" r="1" />
      <rect x="5" y="17" width="2" height="1" rx="0.5" />
      <rect x="17" y="17" width="2" height="1" rx="0.5" />
    </svg>
  );
  
  useEffect(() => {
    const storedHostel = localStorage.getItem('selectedHostel');
    if (storedHostel && storedHostel !== 'null') {
      try {
        setSelectedHostel(JSON.parse(storedHostel));
      } catch (error) {
        console.error('Error parsing hostel data:', error);
      }
    }
  }, []);

  // Build navigation items based on role
  const navigationItems = useMemo(() => {
    const baseItems = [
      { name: 'Dashboard', to: '/admin/dashboard', icon: HomeIcon },
      { name: 'Rooms', to: '/admin/rooms', icon: BuildingOfficeIcon },
      { name: 'Students', to: '/admin/students', icon: UsersIcon },
      { name: 'Allocations', to: '/admin/allocations', icon: ClipboardDocumentCheckIcon },
      { name: 'History', to: '/admin/allocations/history', icon: ClockIcon },
      { name: 'Fees', to: '/admin/fees', icon: CurrencyRupeeIcon },
      { name: 'Inventory', to: '/admin/inventory', icon: KitchenInventoryIcon },
    ];

    if (role === 'ADMIN') {
      return [
        ...baseItems,
        { name: 'Staff Management', to: '/admin/staff', icon: UserGroupIcon },
        { name: 'Reports', to: '/admin/reports', icon: ChartBarIcon },
        { name: 'Messaging', to: '/admin/messaging', icon: DocumentTextIcon }
      ];
    }
    return baseItems;
  }, [role]);

  const getPageTitle = () => {
    const currentItem = navigationItems.find(item => 
      location.pathname === item.to || 
      location.pathname.startsWith(item.to + '/')
    );
    return currentItem?.name || 'Dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('selectedHostel');
    localStorage.removeItem('selectedHostelId');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-700" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Sidebar – now using flex column layout */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-gray-900 to-gray-800 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        flex flex-col h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 shadow-2xl
      `}>
        {/* Logo/Brand – fixed at top */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Hostel Admin</h1>
              <p className="text-gray-400 text-sm">Management System</p>
            </div>
          </div>
          
          {selectedHostel && (
            <div className="mt-4 p-2 bg-gray-800 rounded-lg">
              <p className="text-sm text-white font-medium truncate">
                {selectedHostel.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {selectedHostel.address}
              </p>
            </div>
          )}
        </div>

        {/* Navigation – scrollable if needed */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Settings – fixed at bottom, no absolute positioning */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <UserCircleIcon className="h-10 w-10 text-gray-400" />
            <div>
              <p className="text-white font-medium">Admin User</p>
              <p className="text-gray-400 text-sm">
                {role === 'ADMIN' ? 'Super Administrator' : 'Staff'}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            {role === 'ADMIN' && (
              <button 
                onClick={() => {
                  localStorage.removeItem('selectedHostel');
                  localStorage.removeItem('selectedHostelId');
                  navigate('/admin/hostel-selection');
                }}
                className="flex items-center space-x-3 w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>Change Hostel</span>
              </button>
            )}
            
            {role === 'ADMIN' && (
              <button 
                onClick={() => navigate("/admin/settings")}
                className="flex items-center space-x-3 w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                <span>Settings</span>
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
              {selectedHostel && (
                <p className="text-sm text-gray-600">
                  Managing: <span className="font-medium">{selectedHostel.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <main className="p-6">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
          <footer className="mt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
          </footer>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}