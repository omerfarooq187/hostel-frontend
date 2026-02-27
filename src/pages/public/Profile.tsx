import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  UserCircleIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  PhoneIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  HomeIcon,
  PencilIcon,
  CheckIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// Bed Icon Component
const BedIcon = ({ className = "h-6 w-6" }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 14h14M5 17v-4m14 4v-4m-7-7v4m0-4h3m-3 0H8m8 8H8m8 0v2M8 17v2"
    />
  </svg>
);

export default function Profile() {
  const [student, setStudent] = useState(null);
  const [room, setRoom] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const studentRes = await api.get("/api/student/me");
      setStudent(studentRes.data);
      setFormData({
        name: studentRes.data.name,
        phone: studentRes.data.studentRequest?.phone || "",
      });

      try {
        const roomRes = await api.get("/api/student/me/room");
        setRoom(roomRes.data);
      } catch (roomErr) {
        setRoom(null);
      }

      try {
        const feesRes = await api.get("/api/student/me/fees");
        setFees(feesRes.data);
      } catch (feesErr) {
        setFees([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.put("/api/user/me", {
        name: formData.name,
        phone: formData.phone,
      });

      const studentRes = await api.get("/api/student/me");
      setStudent(studentRes.data);

      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const downloadReceipt = async (feeId) => {
    setDownloading(prev => ({ ...prev, [feeId]: true }));
    try {
      const response = await api.get(`/api/student/me/fees/${feeId}/receipt`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee-receipt-${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download receipt:', err);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloading(prev => ({ ...prev, [feeId]: false }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircleIcon className="h-4 w-4 inline mr-1" />
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <ClockIcon className="h-4 w-4 inline mr-1" />
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <ExclamationCircleIcon className="h-4 w-4 inline mr-1" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            Unknown
          </span>
        );
    }
  };

  const getLatestFee = () => {
    if (!fees.length) return null;
    return fees.sort((a, b) => new Date(b.paymentDate || b.dueDate) - new Date(a.paymentDate || a.dueDate))[0];
  };

  const latestFee = getLatestFee();

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans pt-24">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-300 to-blue-200">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <UserCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                  {student?.name || "My Profile"}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-white/90 text-sm sm:text-base">Manage your account and information</p>
                  <div className="flex items-center">
                    {[1,2,3,4,5].map((_, i) => (
                      <StarIconSolid key={i} className="h-3 w-3 text-yellow-300 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={fetchProfile}
              className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-300 border border-white/20 text-sm sm:text-base"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in-up">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <UserCircleIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors border border-blue-200"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {editMode ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {updating ? (
                          <>
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-6 py-3 border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem
                      icon={<UserCircleIcon className="h-5 w-5" />}
                      label="Name"
                      value={student?.name}
                      color="blue"
                    />
                    <InfoItem
                      icon={<EnvelopeIcon className="h-5 w-5" />}
                      label="Email"
                      value={student?.email}
                      color="blue"
                    />
                    <InfoItem
                      icon={<AcademicCapIcon className="h-5 w-5" />}
                      label="CNIC"
                      value={student?.studentRequest?.cnic}
                      color="blue"
                    />
                    <InfoItem
                      icon={<PhoneIcon className="h-5 w-5" />}
                      label="Phone"
                      value={student?.studentRequest?.phone || "Not provided"}
                      color="blue"
                    />
                    <InfoItem
                      icon={<UserGroupIcon className="h-5 w-5" />}
                      label="Guardian Name"
                      value={student?.studentRequest?.guardianName || "Not provided"}
                      color="blue"
                    />
                    <InfoItem
                      icon={<PhoneIcon className="h-5 w-5" />}
                      label="Guardian Phone"
                      value={student?.studentRequest?.guardianPhoneNumber || "Not provided"}
                      color="blue"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Fee Payment Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Fee Payments</h2>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {fees.length} payment{fees.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              </div>

              <div className="p-6">
                {fees.length > 0 ? (
                  <div className="space-y-8">
                    {/* Latest Fee Highlight */}
                  {latestFee && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-green-300 mb-2 sm:mb-3">
                            <SparklesIcon className="h-3 w-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">LATEST PAYMENT</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 break-words">
                            {latestFee.description || "Hostel Fee Payment"}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 break-all">
                            Payment reference: {latestFee.id}
                          </p>
                        </div>
                        {getStatusBadge(latestFee.status)}
                      </div>

                      {/* Responsive grid: 1 col on mobile, 2 on sm, 4 on md+ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Amount</div>
                          <div className="font-bold text-gray-800 text-base sm:text-xl">
                            {formatCurrency(latestFee.amount || 0)}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Due Date</div>
                          <div className="font-semibold text-gray-800 text-sm sm:text-base">
                            {latestFee.dueDate ? formatDate(latestFee.dueDate) : "N/A"}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Paid Date</div>
                          <div className="font-semibold text-gray-800 text-sm sm:text-base">
                            {latestFee.paymentDate ? formatDate(latestFee.paymentDate) : "Not Paid"}
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                          <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Transaction ID</div>
                          <div className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                            {latestFee.transactionId || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Buttons stack on mobile */}
                      {latestFee.status?.toLowerCase() === 'paid' && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => downloadReceipt(latestFee.id)}
                            disabled={downloading[latestFee.id]}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                          >
                            {downloading[latestFee.id] ? (
                              <>
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <ArrowDownIcon className="h-4 w-4" />
                                Download Receipt
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              window.open(`/api/student/me/fees/${latestFee.id}/receipt`, '_blank');
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                            View Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                    {/* All Fees Table */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
                        <span className="text-sm text-gray-600 font-medium">
                          Showing {fees.length} payments
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Description</th>
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Amount</th>
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Due Date</th>
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Status</th>
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {fees.map((fee) => (
                              <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 sm:px-6">
                                  <div className="font-medium text-gray-800">{fee.description}</div>
                                  <div className="text-xs text-gray-500 mt-1">{fee.id}</div>
                                </td>
                                <td className="py-4 px-4 sm:px-6 font-semibold text-gray-800">
                                  {formatCurrency(fee.amount || 0)}
                                </td>
                                <td className="py-4 px-4 sm:px-6 text-gray-700">
                                  {fee.dueDate ? formatDate(fee.dueDate) : "N/A"}
                                </td>
                                <td className="py-4 px-4 sm:px-6">
                                  {getStatusBadge(fee.status)}
                                </td>
                                <td className="py-3 sm:py-4 px-4 sm:px-6">
                                  {fee.status?.toLowerCase() === 'paid' ? (
                                    <button
                                      onClick={() => downloadReceipt(fee.id)}
                                      disabled={downloading[fee.id]}
                                      className="inline-flex items-center gap-1 px-3 py-2 sm:px-4 sm:py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                      {downloading[fee.id] ? (
                                        <ArrowPathIcon className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <ArrowDownIcon className="h-3 w-3" />
                                      )}
                                      Receipt
                                    </button>
                                  ) : (
                                    <span className="text-xs sm:text-sm text-gray-500">No receipt</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
                      <CurrencyDollarIcon className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">No Fee Records</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Your fee records will appear here once they are added by the administration.
                    </p>
                    <span className="inline-block px-6 py-2 bg-blue-50 text-blue-600 rounded-full font-medium border border-blue-200">
                      No Payments Yet
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Room & Account Status */}
          <div className="space-y-8">
            {/* Room Allocation Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Room Allocation</h2>
                </div>
              </div>

              <div className="p-6">
                {room ? (
                  <div className="space-y-6">
                    {/* Hostel Name Badge */}
                    <div className="text-center">
                      <div className="inline-block px-5 py-2 bg-blue-50 rounded-full border border-blue-200">
                        <span className="text-sm font-medium text-blue-700">
                          {room.hostel?.name || "Officers Hostel"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-lg font-bold text-gray-800">
                            {room.block} - Room {room.roomNumber}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Your current accommodation</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Allocated
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <HomeIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Block</span>
                          </div>
                          <div className="font-bold text-gray-800 text-lg">{room.block}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Room</span>
                          </div>
                          <div className="font-bold text-gray-800 text-lg">{room.roomNumber}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <BedIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Bed</span>
                          </div>
                          <div className="font-bold text-gray-800 text-lg">{room.bedNumber}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Status</span>
                          </div>
                          <div className="font-bold text-green-600">Active</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-gray-700 font-medium">
                        Your room allocation is currently active. Contact the admin office for any changes or issues.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                      <HomeIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Room Allocated</h3>
                    <p className="text-gray-600 mb-6">
                      Your room allocation is pending. Please wait for admin assignment.
                    </p>
                    <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-medium border border-blue-200">
                      Pending Allocation
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Account Status</h3>
                  <p className="text-gray-600 text-sm">Your current account information</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Account Type</div>
                  <div className="font-semibold text-gray-800 mt-1">Student</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Fee Status</div>
                  <div className={`font-semibold mt-1 ${
                    latestFee?.status?.toLowerCase() === 'paid' ? 'text-green-600' : 
                    latestFee?.status?.toLowerCase() === 'pending' ? 'text-yellow-600' : 
                    'text-gray-800'
                  }`}>
                    {latestFee?.status || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Total Payments</div>
                  <div className="font-semibold text-gray-800 mt-1">{fees.length}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Last Updated</div>
                  <div className="font-semibold text-gray-800 mt-1">Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
  };

  return (
    <div className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-300 hover:shadow-sm`}>
      <div className={`p-2.5 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-600 font-medium mb-1">{label}</div>
        <div className="font-semibold text-gray-800 truncate">
          {value || "Not provided"}
        </div>
      </div>
    </div>
  );
};

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans animate-pulse pt-24">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-8 w-48 bg-white/20 rounded"></div>
                <div className="h-4 w-32 bg-white/20 rounded"></div>
              </div>
            </div>
            <div className="h-10 w-32 bg-white/20 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 -mt-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-xl"></div>
                    <div className="h-6 w-40 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-100 rounded-lg">
                      <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-20 bg-gray-300 rounded"></div>
                        <div className="h-6 w-32 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-xl"></div>
                    <div className="h-6 w-40 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="h-64 bg-gray-300 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-300 rounded-xl"></div>
                  <div className="h-6 w-40 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="h-40 bg-gray-300 rounded-xl"></div>
                  <div className="h-20 bg-gray-300 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}