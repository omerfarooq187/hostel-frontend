import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  IdentificationIcon,
  ArrowRightIcon,
  DocumentPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

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
  const navigate = useNavigate();
  const { token, role, logout } = useAuth();
  const [student, setStudent] = useState(null);
  const [room, setRoom] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileStatus, setProfileStatus] = useState(null); // 'active', 'deactivated', 'no_request'
  const [adminContact, setAdminContact] = useState(null);
  const [admissionStatus, setAdmissionStatus] = useState(null); // 'PENDING', 'APPROVED', 'REJECTED'

  // Hostels list
  const [hostels, setHostels] = useState([]);
  const [loadingHostels, setLoadingHostels] = useState(false);

  // Form states for admission request
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    phone: "",
    guardianName: "",
    guardianPhone: "",
    preferredHostelId: ""
  });
  const [requestFormErrors, setRequestFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Form states for profile edit
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [profileFormErrors, setProfileFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    guardianName: "",
    guardianPhone: "",
  });

  const [downloading, setDownloading] = useState({});

  // Fetch hostels from public endpoint
  const fetchHostels = async () => {
    setLoadingHostels(true);
    try {
      const response = await api.get("/api/hostels");
      console.log("Hostels fetched:", response.data);
      setHostels(response.data);
    } catch (err) {
      console.error("Failed to fetch hostels", err);
      setHostels([]);
    } finally {
      setLoadingHostels(false);
    }
  };

  // Fetch full student profile (for approved students)
  const fetchStudentProfile = async () => {
    try {
      const response = await api.get("/api/student/me");
      console.log("Student profile response:", response.data);
      
      // Check if response has status field (special case)
      if (response.data.status) {
        if (response.data.status === 'PENDING_RESERVATION') {
          setProfileStatus('no_request');
          setAdmissionStatus(null);
          setLoading(false);
          return;
        } else if (response.data.status === 'DEACTIVATED') {
          setProfileStatus('deactivated');
          setError(response.data.message);
          setAdminContact(response.data.adminContact);
          setLoading(false);
          return;
        }
      }
      
      // Normal student data
      setStudent(response.data);
      setAdmissionStatus('APPROVED');
      setProfileStatus('active');
      
      setFormData({
        name: response.data.name || "",
        phone: response.data.studentRequest?.phone || "",
        guardianName: response.data.studentRequest?.guardianName || "",
        guardianPhone: response.data.studentRequest?.guardianPhoneNumber || "",
      });

      // Fetch room allocation
      try {
        const roomRes = await api.get("/api/student/me/room");
        setRoom(roomRes.data);
      } catch (roomErr) {
        console.log("No room allocated yet");
        setRoom(null);
      }

      // Fetch fees
      try {
        const feesRes = await api.get("/api/student/me/fees");
        setFees(feesRes.data);
      } catch (feesErr) {
        console.log("No fees found");
        setFees([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching student profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");
      setLoading(false);
    }
  };

  // First check admission status
  const fetchAdmissionStatus = async () => {
    try {
      const response = await api.get("/api/student/admission/status");
      console.log("Admission status response:", response.data);
      
      if (response.data.success) {
        const status = response.data.status;
        
        if (status === 'NO_REQUEST') {
          setProfileStatus('no_request');
          setAdmissionStatus(null);
          setStudent(null);
          setLoading(false);
          return;
        } 
        else if (status === 'PENDING') {
          setAdmissionStatus('PENDING');
          setProfileStatus(null);
          // Fetch the request details
          try {
            const requestResponse = await api.get("/api/student/admission/my-request");
            console.log("Pending request details:", requestResponse.data);
            setStudent(requestResponse.data);
          } catch (err) {
            console.error("Failed to fetch request details", err);
          }
          setLoading(false);
          return;
        }
        else if (status === 'APPROVED') {
          // If approved, fetch the full student profile
          await fetchStudentProfile();
          return; // Don't set loading false here as fetchStudentProfile will do it
        }
        else if (status === 'REJECTED') {
          setAdmissionStatus('REJECTED');
          setProfileStatus(null);
          try {
            const requestResponse = await api.get("/api/student/admission/my-request");
            console.log("Rejected request details:", requestResponse.data);
            setStudent(requestResponse.data);
          } catch (err) {
            console.error("Failed to fetch rejection details", err);
          }
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Error fetching admission status:", err);
      setError(err.response?.data?.message || "Failed to check admission status");
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // Check if user is admin or staff
    if (role === 'ADMIN' || role === 'STAFF') {
      setLoading(false);
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch hostels first (they're needed for the form)
        await fetchHostels();
        // Then fetch admission status
        await fetchAdmissionStatus();
      } catch (err) {
        console.error("Error loading profile data:", err);
        setLoading(false);
      }
    };
    
    loadData();
  }, [role]);

  // Fetch hostels when showing the form if not already loaded
  useEffect(() => {
    if (showRequestForm && hostels.length === 0) {
      fetchHostels();
    }
  }, [showRequestForm, hostels.length]);

  // Handle profile form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone fields, only allow digits
    if (name === 'phone' || name === 'guardianPhone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 11) {
        setFormData(prev => ({
          ...prev,
          [name]: digitsOnly
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (profileFormErrors[name]) {
      setProfileFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle request form changes
  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    
    // For phone fields, only allow digits
    if (name === 'phone' || name === 'guardianPhone') {
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 11 digits for request form
      if (digitsOnly.length <= 11) {
        setRequestForm(prev => ({
          ...prev,
          [name]: digitsOnly
        }));
      }
    } else {
      setRequestForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (requestFormErrors[name]) {
      setRequestFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name || !formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
    }
    
    // Phone validation - exactly 11 digits
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{11}$/.test(formData.phone)) {
      errors.phone = "Phone number must be exactly 11 digits";
    }
    
    // Guardian Name validation
    if (!formData.guardianName || !formData.guardianName.trim()) {
      errors.guardianName = "Guardian name is required";
    } else if (formData.guardianName.trim().length < 3) {
      errors.guardianName = "Guardian name must be at least 3 characters";
    }
    
    // Guardian Phone validation - exactly 11 digits
    if (!formData.guardianPhone) {
      errors.guardianPhone = "Guardian phone number is required";
    } else if (!/^\d{11}$/.test(formData.guardianPhone)) {
      errors.guardianPhone = "Guardian phone must be exactly 11 digits";
    }
    
    setProfileFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate request form
  const validateRequestForm = () => {
    const errors = {};
    
    // Phone validation - required and exactly 11 digits
    if (!requestForm.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{11}$/.test(requestForm.phone)) {
      errors.phone = "Phone number must be exactly 11 digits";
    }
    
    // Guardian Name validation - required
    if (!requestForm.guardianName || !requestForm.guardianName.trim()) {
      errors.guardianName = "Guardian name is required";
    } else if (requestForm.guardianName.trim().length < 3) {
      errors.guardianName = "Guardian name must be at least 3 characters";
    }
    
    // Guardian Phone validation - required and exactly 11 digits
    if (!requestForm.guardianPhone) {
      errors.guardianPhone = "Guardian phone number is required";
    } else if (!/^\d{11}$/.test(requestForm.guardianPhone)) {
      errors.guardianPhone = "Guardian phone must be exactly 11 digits";
    }
    
    // Hostel selection validation - required
    if (!requestForm.preferredHostelId) {
      errors.preferredHostelId = "Please select a preferred hostel";
    }
    
    setRequestFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleUpdate = async () => {
    // Validate all fields before submitting
    if (!validateProfileForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setUpdating(true);
    try {
      await api.put("/api/user/me", {
        name: formData.name.trim(),
        phone: formData.phone,
        guardianName: formData.guardianName.trim(),
        guardianPhone: formData.guardianPhone,
      });

      // Refresh data
      const studentRes = await api.get("/api/student/me");
      setStudent(studentRes.data);
      setProfileFormErrors({});

      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle request submission
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    if (!validateRequestForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setSubmitting(true);
    
    try {
      await api.post("/api/student/admission/submit", {
        phone: requestForm.phone,
        guardianName: requestForm.guardianName.trim(),
        guardianPhone: requestForm.guardianPhone,
        preferredHostelId: parseInt(requestForm.preferredHostelId)
      });
      
      alert("Admission request submitted successfully!");
      
      // Reset form
      setRequestForm({
        phone: "",
        guardianName: "",
        guardianPhone: "",
        preferredHostelId: ""
      });
      setRequestFormErrors({});
      
      // Hide the form
      setShowRequestForm(false);
      
      // Refresh the admission status
      setLoading(true);
      await fetchAdmissionStatus();
      
    } catch (err) {
      console.error("Submission error:", err);
      // Check if error is because user already has pending request
      if (err.response?.data?.message?.includes("already have a pending")) {
        alert("You already have a pending request. Please wait for admin approval.");
        // Refresh status to show pending state
        setShowRequestForm(false);
        setLoading(true);
        await fetchAdmissionStatus();
      } else {
        alert(err.response?.data?.message || "Failed to submit request");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReceipt = async (feeId) => {
    setDownloading(prev => ({ ...prev, [feeId]: true }));
    try {
      const hostelName = room?.hostel?.name || "Officers Hostel";
      
      const response = await api.get(`/api/student/me/fees/${feeId}/receipt`, {
        responseType: 'blob',
        params: { hostelName }
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
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircleIcon className="h-4 w-4 inline mr-1" />
            Paid
          </span>
        );
      case 'UNPAID':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <ClockIcon className="h-4 w-4 inline mr-1" />
            Unpaid
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
    return fees.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))[0];
  };

  const latestFee = getLatestFee();
  const totalPaid = fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0);
  const totalUnpaid = fees.filter(f => f.status === 'UNPAID').reduce((sum, f) => sum + f.amount, 0);

  // Show admin/staff message
  if (role === 'ADMIN' || role === 'STAFF') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans pt-24">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C]">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <ShieldCheckIcon className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                  Admin Dashboard
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1">
                  You are logged in as {role === 'ADMIN' ? 'Administrator' : 'Staff Member'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Message Card */}
        <div className="container mx-auto px-4 -mt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-fade-in-up">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                  <BuildingOfficeIcon className="h-10 w-10 text-[#F97316]" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Welcome, {role === 'ADMIN' ? 'Admin' : 'Staff'}!
                </h2>
                
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You are currently viewing the student profile section. 
                  As an admin/staff member, you should use the admin dashboard 
                  to manage students, fees, and allocations.
                </p>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8 w-full">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <BuildingOfficeIcon className="h-6 w-6 text-[#F97316]" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Dashboard</p>
                        <p className="text-sm text-gray-500">Overview & stats</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto group-hover:text-[#F97316] transition-colors" />
                    </Link>

                    <Link
                      to="/admin/students"
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <UserGroupIcon className="h-6 w-6 text-[#F97316]" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Students</p>
                        <p className="text-sm text-gray-500">Manage students</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto group-hover:text-[#F97316] transition-colors" />
                    </Link>

                    <Link
                      to="/admin/allocations"
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <HomeIcon className="h-6 w-6 text-[#F97316]" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Allocations</p>
                        <p className="text-sm text-gray-500">Room assignments</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto group-hover:text-[#F97316] transition-colors" />
                    </Link>

                    <Link
                      to="/admin/fees"
                      className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <CurrencyDollarIcon className="h-6 w-6 text-[#F97316]" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Fees</p>
                        <p className="text-sm text-gray-500">Manage payments</p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto group-hover:text-[#F97316] transition-colors" />
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium transition-colors"
                  >
                    <BuildingOfficeIcon className="h-5 w-5" />
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <ProfileSkeleton />;

  // Show No Request UI
  if (profileStatus === 'no_request') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans pt-24">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C]">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <UserCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                  Student Profile
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1">
                  Submit your admission request
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Request Form Card */}
        <div className="container mx-auto px-4 -mt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            {!showRequestForm ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
                  <DocumentPlusIcon className="h-10 w-10 text-[#F97316]" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  No Admission Request Found
                </h2>
                
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  You haven't submitted an admission request yet. 
                  Please fill out the form to request hostel accommodation.
                </p>

                <button
                  onClick={() => setShowRequestForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium transition-colors"
                >
                  <DocumentPlusIcon className="h-5 w-5" />
                  Submit Admission Request
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Admission Request Form</h2>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={requestForm.phone}
                        onChange={handleRequestChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent ${
                          requestFormErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="03xxxxxxxxx"
                        maxLength="11"
                      />
                    </div>
                    {requestFormErrors.phone ? (
                      <p className="mt-1 text-sm text-red-600">{requestFormErrors.phone}</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        {requestForm.phone.length || 0}/11 digits
                      </p>
                    )}
                  </div>

                  {/* Guardian Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guardian Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="guardianName"
                        value={requestForm.guardianName}
                        onChange={handleRequestChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent ${
                          requestFormErrors.guardianName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Guardian's full name"
                      />
                    </div>
                    {requestFormErrors.guardianName && (
                      <p className="mt-1 text-sm text-red-600">{requestFormErrors.guardianName}</p>
                    )}
                  </div>

                  {/* Guardian Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guardian Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="guardianPhone"
                        value={requestForm.guardianPhone}
                        onChange={handleRequestChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent ${
                          requestFormErrors.guardianPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="03xxxxxxxxx"
                        maxLength="11"
                      />
                    </div>
                    {requestFormErrors.guardianPhone ? (
                      <p className="mt-1 text-sm text-red-600">{requestFormErrors.guardianPhone}</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        {requestForm.guardianPhone.length || 0}/11 digits
                      </p>
                    )}
                  </div>

                  {/* Hostel Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Preferred Hostel <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="preferredHostelId"
                      value={requestForm.preferredHostelId}
                      onChange={handleRequestChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent ${
                        requestFormErrors.preferredHostelId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">-- Choose a hostel --</option>
                      {loadingHostels ? (
                        <option disabled>Loading hostels...</option>
                      ) : hostels.length > 0 ? (
                        hostels.map((hostel) => (
                          <option key={hostel.id} value={hostel.id}>
                            {hostel.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No hostels available</option>
                      )}
                    </select>
                    {requestFormErrors.preferredHostelId && (
                      <p className="mt-1 text-sm text-red-600">{requestFormErrors.preferredHostelId}</p>
                    )}
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-700 flex items-start gap-2">
                      <ClockIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        Your request will be reviewed by admin. You'll be notified once approved.
                      </span>
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <ArrowPathIcon className="h-5 w-5 animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        "Submit Request"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show Pending Request UI
  if (admissionStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans pt-24">
        <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C]">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <ClockIcon className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                  Admission Request Pending
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1">
                  Your request is under review
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6 mx-auto">
                <ClockIcon className="h-10 w-10 text-yellow-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Request Pending Review</h2>
              
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-center">
                Your admission request has been submitted and is waiting for admin approval.
                You will be notified once your request is processed.
              </p>

              {/* Request Details Card */}
              {student && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-yellow-200">
                    Request Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Full Name</p>
                        <p className="text-gray-800 font-semibold">{student.name || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">CNIC</p>
                        <p className="text-gray-800 font-semibold">{student.cnic || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                        <p className="text-gray-800 font-semibold">{student.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Guardian Name</p>
                        <p className="text-gray-800 font-semibold">{student.guardianName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Guardian Phone</p>
                        <p className="text-gray-800 font-semibold">{student.guardianPhone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Submitted On</p>
                        <p className="text-gray-800 font-semibold">{formatDate(student.requestedAt)}</p>
                      </div>
                    </div>
                    
                    {/* Preferred Hostel if available */}
                    {student.hostel && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 font-medium">Preferred Hostel</p>
                        <p className="text-gray-800 font-semibold">{student.hostel.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchAdmissionStatus();
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium transition-colors"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  Check Status
                </button>
                
                <p className="text-sm text-gray-500">
                  Last checked: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Rejected Request UI
  if (admissionStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans pt-24">
        <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C]">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <ExclamationCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                  Request Rejected
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1">
                  Your admission request was not approved
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6 mx-auto">
                <XMarkIcon className="h-10 w-10 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Request Rejected</h2>
              
              {/* Request Details Card */}
              {student && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Request Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Full Name</p>
                        <p className="text-gray-800 font-semibold">{student.name || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">CNIC</p>
                        <p className="text-gray-800 font-semibold">{student.cnic || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                        <p className="text-gray-800 font-semibold">{student.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Guardian Name</p>
                        <p className="text-gray-800 font-semibold">{student.guardianName || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Guardian Phone</p>
                        <p className="text-gray-800 font-semibold">{student.guardianPhone || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Submitted On</p>
                        <p className="text-gray-800 font-semibold">{formatDate(student.requestedAt)}</p>
                      </div>
                    </div>
                    
                    {/* Rejection Reason - Highlighted */}
                    {student.rejectionReason && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700 font-medium mb-1">Reason for Rejection:</p>
                        <p className="text-red-800">{student.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Administration Card */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-orange-200">
                  Contact Administration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <PhoneIcon className="h-5 w-5 text-[#F97316]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-semibold text-gray-800">+92 335 8332755</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <EnvelopeIcon className="h-5 w-5 text-[#F97316]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800">admin@offhostel.org</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <BuildingOfficeIcon className="h-5 w-5 text-[#F97316]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Office Address</p>
                      <p className="font-semibold text-gray-800">Main G.T Road, Mandra, Rawalpindi</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                If you have any questions about this decision, please contact the administration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Deactivated UI
  if (profileStatus === 'deactivated') {
    return (
      <div className="min-h-screen bg-gray-50 font-sans pt-24">
        <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C]">
          <div className="container mx-auto px-4 py-8 sm:py-12">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <ExclamationCircleIcon className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                  Account Deactivated
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-1">
                  Your account has been deactivated
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <ExclamationCircleIcon className="h-10 w-10 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Deactivated</h2>
              
              <p className="text-gray-600 mb-6">{error}</p>

              {adminContact && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8 text-left">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Administration</h3>
                  <div className="space-y-3">
                    <p className="flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-[#F97316]" />
                      <span>{adminContact.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-[#F97316]" />
                      <span>{adminContact.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-5 w-5 text-[#F97316]" />
                      <span>{adminContact.address}</span>
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium transition-colors"
              >
                <HomeIcon className="h-5 w-5" />
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show Approved/Active Student Profile
  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C]">
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
                  <p className="text-white/90 text-sm sm:text-base">
                    Student Account
                  </p>
                  {admissionStatus === 'APPROVED' && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                fetchAdmissionStatus();
              }}
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
                    <div className="p-2 bg-[#F97316]/10 rounded-xl">
                      <UserCircleIcon className="h-6 w-6 text-[#F97316]" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Personal Details</h2>
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] rounded-lg font-medium transition-colors border border-[#F97316]/20"
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
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all ${
                          profileFormErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {profileFormErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{profileFormErrors.name}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength="11"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all ${
                          profileFormErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter 11-digit phone number"
                      />
                      {profileFormErrors.phone ? (
                        <p className="mt-1 text-sm text-red-600">{profileFormErrors.phone}</p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          {formData.phone?.length || 0}/11 digits
                        </p>
                      )}
                    </div>

                    {/* Guardian Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all ${
                          profileFormErrors.guardianName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter guardian name"
                      />
                      {profileFormErrors.guardianName && (
                        <p className="mt-1 text-sm text-red-600">{profileFormErrors.guardianName}</p>
                      )}
                    </div>

                    {/* Guardian Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="guardianPhone"
                        type="tel"
                        value={formData.guardianPhone}
                        onChange={handleChange}
                        maxLength="11"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all ${
                          profileFormErrors.guardianPhone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter 11-digit guardian phone number"
                      />
                      {profileFormErrors.guardianPhone ? (
                        <p className="mt-1 text-sm text-red-600">{profileFormErrors.guardianPhone}</p>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">
                          {formData.guardianPhone?.length || 0}/11 digits
                        </p>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
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
                      color="orange"
                    />
                    <InfoItem
                      icon={<EnvelopeIcon className="h-5 w-5" />}
                      label="Email"
                      value={student?.email}
                      color="orange"
                    />
                    <InfoItem
                      icon={<IdentificationIcon className="h-5 w-5" />}
                      label="CNIC"
                      value={student?.studentRequest?.cnic}
                      color="orange"
                    />
                    <InfoItem
                      icon={<PhoneIcon className="h-5 w-5" />}
                      label="Phone"
                      value={student?.studentRequest?.phone || "Not provided"}
                      color="orange"
                    />
                    <InfoItem
                      icon={<UserGroupIcon className="h-5 w-5" />}
                      label="Guardian Name"
                      value={student?.studentRequest?.guardianName || "Not provided"}
                      color="orange"
                    />
                    <InfoItem
                      icon={<PhoneIcon className="h-5 w-5" />}
                      label="Guardian Phone"
                      value={student?.studentRequest?.guardianPhoneNumber || "Not provided"}
                      color="orange"
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
                    Total Paid: {formatCurrency(totalPaid)}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {fees.length > 0 ? (
                  <div className="space-y-8">
                    {/* Fee Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 font-medium">Paid Amount</p>
                            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
                          </div>
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-yellow-600 font-medium">Unpaid Amount</p>
                            <p className="text-2xl font-bold text-yellow-700">{formatCurrency(totalUnpaid)}</p>
                          </div>
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Latest Fee Highlight */}
                    {latestFee && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                          <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-orange-300 mb-2 sm:mb-3">
                              <SparklesIcon className="h-3 w-3 text-[#F97316]" />
                              <span className="text-xs font-medium text-[#F97316]">LATEST FEE</span>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 break-words">
                              Fee for {latestFee.month}
                            </h3>
                          </div>
                          {getStatusBadge(latestFee.status)}
                        </div>

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
                              {formatDate(latestFee.dueDate)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                            <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Paid Date</div>
                            <div className="font-semibold text-gray-800 text-sm sm:text-base">
                              {latestFee.paymentDate ? formatDate(latestFee.paymentDate) : "Not Paid"}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                            <div className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">Month</div>
                            <div className="font-semibold text-gray-800 text-sm sm:text-base">
                              {latestFee.month}
                            </div>
                          </div>
                        </div>

                        {latestFee.status === 'PAID' && (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => downloadReceipt(latestFee.id)}
                              disabled={downloading[latestFee.id]}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
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
                          </div>
                        )}
                      </div>
                    )}

                    {/* All Fees Table */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Payment History</h3>
                        <span className="text-sm text-gray-600 font-medium">
                          {fees.length} record{fees.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Month</th>
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Amount</th>
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Due Date</th>
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Paid Date</th>
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Status</th>
                              <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-700">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {fees.map((fee) => (
                              <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4 sm:px-6">
                                  <div className="font-medium text-gray-800">{fee.month}</div>
                                </td>
                                <td className="py-4 px-4 sm:px-6 font-semibold text-gray-800">
                                  {formatCurrency(fee.amount || 0)}
                                </td>
                                <td className="py-4 px-4 sm:px-6 text-gray-700">
                                  {formatDate(fee.dueDate)}
                                </td>
                                <td className="py-4 px-4 sm:px-6 text-gray-700">
                                  {fee.paymentDate ? formatDate(fee.paymentDate) : "-"}
                                </td>
                                <td className="py-4 px-4 sm:px-6">
                                  {getStatusBadge(fee.status)}
                                </td>
                                <td className="py-3 sm:py-4 px-4 sm:px-6">
                                  {fee.status === 'PAID' ? (
                                    <button
                                      onClick={() => downloadReceipt(fee.id)}
                                      disabled={downloading[fee.id]}
                                      className="inline-flex items-center gap-1 px-3 py-2 bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                      {downloading[fee.id] ? (
                                        <ArrowPathIcon className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <ArrowDownIcon className="h-3 w-3" />
                                      )}
                                      Download
                                    </button>
                                  ) : (
                                    <span className="text-xs sm:text-sm text-gray-400">Pending</span>
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
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-full mb-6">
                      <CurrencyDollarIcon className="h-10 w-10 text-[#F97316]" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">No Fee Records</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Your fee records will appear here once they are added by the administration.
                    </p>
                    <span className="inline-block px-6 py-2 bg-orange-50 text-[#F97316] rounded-full font-medium border border-orange-200">
                      No Records Yet
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
                  <div className="p-2 bg-[#F97316]/10 rounded-xl">
                    <BuildingOfficeIcon className="h-6 w-6 text-[#F97316]" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Room Allocation</h2>
                </div>
              </div>

              <div className="p-6">
                {room ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-block px-5 py-2 bg-orange-50 rounded-full border border-orange-200">
                        <span className="text-sm font-medium text-[#F97316]">
                          {room.hostel?.name || "Officers Hostel"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-lg font-bold text-gray-800">
                            Room {room.roomNumber}
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
                            <HomeIcon className="h-4 w-4 text-[#F97316]" />
                            <span className="text-sm font-medium text-gray-700">Block</span>
                          </div>
                          <div className="font-bold text-gray-800 text-lg">{room.block || "A"}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <BuildingOfficeIcon className="h-4 w-4 text-[#F97316]" />
                            <span className="text-sm font-medium text-gray-700">Room</span>
                          </div>
                          <div className="font-bold text-gray-800 text-lg">{room.roomNumber}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <BedIcon className="h-4 w-4 text-[#F97316]" />
                            <span className="text-sm font-medium text-gray-700">Bed</span>
                          </div>
                          <div className="font-bold text-gray-800 text-lg">{room.bedNumber || 1}</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="h-4 w-4 text-[#F97316]" />
                            <span className="text-sm font-medium text-gray-700">Status</span>
                          </div>
                          <div className="font-bold text-green-600">Active</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <p className="text-sm text-gray-700 font-medium">
                        Your room allocation is currently active. Contact the admin office for any changes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-4">
                      <HomeIcon className="h-8 w-8 text-[#F97316]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Room Allocated</h3>
                    <p className="text-gray-600 mb-6">
                      Your room allocation is pending. Please wait for admin assignment.
                    </p>
                    <span className="inline-block px-4 py-2 bg-orange-50 text-[#F97316] rounded-full font-medium border border-orange-200">
                      Pending Allocation
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#F97316]/10 rounded-xl">
                  <ShieldCheckIcon className="h-6 w-6 text-[#F97316]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Account Status</h3>
                  <p className="text-gray-600 text-sm">Your current account information</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Account Type</div>
                  <div className="font-semibold text-gray-800 mt-1">
                    Student
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Status</div>
                  <div className={`font-semibold mt-1 text-green-600`}>
                    Active
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Total Fees</div>
                  <div className="font-semibold text-gray-800 mt-1">{fees.length}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Room Status</div>
                  <div className={`font-semibold mt-1 ${room ? 'text-green-600' : 'text-gray-800'}`}>
                    {room ? 'Allocated' : 'Not Allocated'}
                  </div>
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
    orange: "bg-[#F97316]/10 border-[#F97316]/20 text-[#F97316]",
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
  };

  return (
    <div className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:border-[#F97316] transition-colors duration-300 hover:shadow-sm`}>
      <div className={`p-2.5 rounded-lg ${colorClasses[color] || colorClasses.orange}`}>
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
      <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C]">
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