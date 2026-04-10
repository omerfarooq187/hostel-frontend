import { useEffect, useState, memo } from "react";
import api from "../../api/axios";
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    rooms: 0,
    students: 0,
    occupiedBeds: 0,
    totalBeds: 0,
    totalFeeCollection: 0,
    unpaidFeesCount: 0,
    totalPaidAmount: 0,
    totalUnpaidAmount: 0,
    collectionRate: 0
  });

  const [selectedHostel, setSelectedHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const [errorDialog, setErrorDialog] = useState({
    show: false,
    title: "",
    message: "",
  });

  const getCurrentYearMonth = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  };

  useEffect(() => {
    const storedHostel = localStorage.getItem('selectedHostel');
    
    if (!storedHostel || storedHostel === 'null') {
      navigate('/admin/hostel-selection', { replace: true });
    } else {
      try {
        setSelectedHostel(JSON.parse(storedHostel));
        fetchStats();
      } catch (error) {
        console.error('Error parsing hostel data:', error);
        localStorage.removeItem('selectedHostel');
        navigate('/admin/hostel-selection', { replace: true });
      }
    }
  }, [navigate]);

  const showError = (title, message) => {
    setErrorDialog({
      show: true,
      title: title || "Error",
      message: message || "An unexpected error occurred"
    });
  };

  const closeErrorDialog = () => {
    setErrorDialog(prev => ({ ...prev, show: false }));
  };

  const fetchStats = async () => {
    let isMounted = true;
    const hostelId = localStorage.getItem("selectedHostelId");
    const { year, month } = getCurrentYearMonth();
    const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;

    try {
      const [roomsRes, studentsRes, allocationsRes, feesRes] = await Promise.all([
        api.get("/api/admin/rooms", { params: { hostelId } }),
        api.get("/api/admin/students", { params: { hostelId } }),
        api.get("/api/admin/allocations", { params: { hostelId } }),
        api.get("/api/admin/fee", { params: { hostelId } })
      ]);

      if (!isMounted) return;

      const totalBeds = roomsRes.data.reduce((sum, room) => sum + room.capacity, 0);
      
      // Filter fees for current month
      const currentMonthFees = feesRes.data.filter(fee => fee.month === currentMonthStr);
      
      // Calculate total collected = sum of all paid_amount
      const totalCollected = currentMonthFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
      
      // Calculate total expected amount
      const totalExpected = currentMonthFees.reduce((sum, fee) => sum + fee.amount, 0);
      
      // Calculate total unpaid amount = sum of remaining amounts for ALL fees (PAID, PARTIAL, UNPAID)
      // This is the correct way - any fee where remaining > 0 contributes to unpaid amount
      const totalUnpaidAmount = currentMonthFees.reduce((sum, fee) => {
        const paid = fee.paidAmount || 0;
        const remaining = fee.amount - paid;
        return sum + (remaining > 0 ? remaining : 0);
      }, 0);
      
      // Count unpaid fees - any fee with remaining amount > 0 (includes PARTIAL and UNPAID)
      const unpaidCount = currentMonthFees.filter(fee => {
        const paid = fee.paidAmount || 0;
        const remaining = fee.amount - paid;
        return remaining > 0; // Count if any amount is still due
      }).length;
      
      // Calculate collection rate
      const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

      setStats({
        rooms: roomsRes.data.length,
        students: studentsRes.data.length,
        occupiedBeds: allocationsRes.data,
        totalBeds: totalBeds,
        totalFeeCollection: totalCollected,
        unpaidFeesCount: unpaidCount,
        totalPaidAmount: totalCollected,
        totalUnpaidAmount: totalUnpaidAmount,
        collectionRate: collectionRate
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      if (!isMounted) return;
      showError(
        "Failed to Load Dashboard",
        err.response?.data?.message || "Unable to load dashboard data. Please try again."
      );
    } finally {
      if (isMounted) setLoading(false);
    }

    return () => { isMounted = false; };
  };

  const occupancyRate = stats.totalBeds > 0 
    ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) 
    : 0;
  const occupancyStatus = stats.totalBeds > 0 
    ? (stats.occupiedBeds / stats.totalBeds * 100).toFixed(1) 
    : "0.0";
  const availableBeds = Math.max(0, stats.totalBeds - stats.occupiedBeds);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const refreshData = () => {
    fetchStats();
  };

  if (loading || !selectedHostel) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {errorDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <ExclamationCircleIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{errorDialog.title}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700">{errorDialog.message}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={closeErrorDialog}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of hostel management system</p>
        </div>
        
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              <ClockIcon className="w-4 h-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          )}
          <button
            onClick={refreshData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid - 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          title="Total Rooms" 
          value={stats.rooms} 
          icon={BuildingOfficeIcon}
          color="blue"
          description="Available hostel rooms"
          trend={`${stats.rooms} rooms`}
        />
        <StatCard 
          title="Total Students" 
          value={stats.students} 
          icon={UsersIcon}
          color="green"
          description="Registered students"
          trend={`${stats.students} students`}
        />
        <StatCard 
          title="Occupied Beds" 
          value={stats.occupiedBeds} 
          icon={ClipboardDocumentCheckIcon}
          color="purple"
          description="Currently allocated beds"
          trend={`${stats.occupiedBeds} occupied`}
        />
        <StatCard 
          title="Occupancy Rate" 
          value={`${occupancyRate}%`} 
          icon={ClockIcon}
          color="orange"
          description={`${availableBeds} beds available`}
          trend={`${occupancyStatus}% filled`}
        />
        <StatCard 
          title="Fee Collection" 
          value={formatCurrency(stats.totalFeeCollection)} 
          icon={BanknotesIcon}
          color="emerald"
          description="Fees collected this month"
          trend="Current month"
        />
        <StatCard 
          title="Unpaid Amount" 
          value={formatCurrency(stats.totalUnpaidAmount)} 
          icon={ExclamationTriangleIcon}
          color="red"
          description="Total pending amount"
          trend={stats.unpaidFeesCount > 0 ? "Action needed" : "All clear"}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Beds Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Available Beds</h3>
              <p className="text-gray-600 text-sm">Ready for allocation</p>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {availableBeds}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Capacity utilization</span>
              <span className="font-medium">{occupancyRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  occupancyRate > 80 ? 'bg-red-500' :
                  occupancyRate > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, occupancyRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fee Collection Card - Updated with partial payment support */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Fee Collection</h3>
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                This month
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <BanknotesIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700 text-sm">Collected</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(stats.totalFeeCollection)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, stats.collectionRate)}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700 text-sm">Pending Amount</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(stats.totalUnpaidAmount)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, 100 - stats.collectionRate)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-600">Collection Rate</span>
              <span className="text-sm font-bold text-emerald-700">{stats.collectionRate.toFixed(1)}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Cases</span>
              <span className={`text-sm font-bold ${stats.unpaidFeesCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.unpaidFeesCount}
              </span>
            </div>
          </div>
        </div>

        {/* Unpaid Alerts Card */}
        <div className={`border rounded-2xl p-6 ${
          stats.unpaidFeesCount > 0 
            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200' 
            : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {stats.unpaidFeesCount > 0 ? 'Payment Alerts' : 'All Clear'}
              </h3>
              <p className="text-gray-600 text-sm">
                {stats.unpaidFeesCount > 0 
                  ? `${stats.unpaidFeesCount} student${stats.unpaidFeesCount !== 1 ? 's' : ''} have pending payments` 
                  : 'No pending payments this month'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              stats.unpaidFeesCount > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <ExclamationTriangleIcon className={`h-6 w-6 ${
                stats.unpaidFeesCount > 0 ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
          </div>
          
          {stats.unpaidFeesCount > 0 ? (
            <div className="space-y-3">
              <div className="bg-white/70 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Action Required</p>
                    <p className="text-sm text-gray-600">
                      {stats.unpaidFeesCount} {stats.unpaidFeesCount === 1 ? 'student' : 'students'} have pending payments
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Total pending: {formatCurrency(stats.totalUnpaidAmount)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    {stats.collectionRate < 50 ? 'Critical' : stats.collectionRate < 80 ? 'Warning' : 'Pending'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/fees')}
                className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                View Pending Payments
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">🎉</div>
              <p className="text-gray-700 font-medium">All fees are up to date</p>
              <p className="text-sm text-gray-600 mt-1">No pending payments for this month</p>
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.rooms}</div>
            <div className="text-sm text-gray-600">Rooms</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.students}</div>
            <div className="text-sm text-gray-600">Students</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.occupiedBeds}</div>
            <div className="text-sm text-gray-600">Active Allocations</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{availableBeds}</div>
            <div className="text-sm text-gray-600">Available Beds</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalFeeCollection)}
            </div>
            <div className="text-sm text-gray-600">Collected</div>
            <div className="text-xs text-gray-400">This month</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalUnpaidAmount)}
            </div>
            <div className="text-sm text-gray-600">Pending Amount</div>
            <div className="text-xs text-gray-400">This month</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// StatCard component
const StatCard = memo(function StatCard({ title, value, icon: Icon, color, description, trend }) {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-600', border: 'border-green-200' },
    purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', border: 'border-orange-200' },
    emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', border: 'border-emerald-200' },
    red: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', border: 'border-red-200' },
  };

  return (
    <div className={`${colorClasses[color].bg} border ${colorClasses[color].border} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color].iconBg} group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].iconColor}`} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{description}</p>
        {trend && (
          <span className={`text-sm font-medium ${color === 'red' ? 'text-red-700' : 'text-gray-700'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
});

// DashboardSkeleton component
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-300 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-gray-100 rounded-lg p-4">
              <div className="h-8 w-16 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-4 w-20 bg-gray-300 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}