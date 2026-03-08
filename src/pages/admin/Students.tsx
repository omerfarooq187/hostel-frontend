import { useEffect, useState, memo, useMemo } from "react";
import api from "../../api/axios";
import {
  UserGroupIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  UserPlusIcon,
  IdentificationIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArchiveBoxIcon,
  ArchiveBoxXMarkIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [manualActionLoading, setManualActionLoading] = useState(false);

  // role
  const {role} = useAuth();

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("active"); // "active", "inactive", "all"
  const [filterType, setFilterType] = useState("all"); // "all", "with-account", "manual"
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  // Existing user form state
  const [cnic, setCnic] = useState("");
  const [phone, setPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  // Manual admission form state
  const [manualName, setManualName] = useState("");
  const [manualCnic, setManualCnic] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualGuardianName, setManualGuardianName] = useState("");
  const [manualGuardianPhone, setManualGuardianPhone] = useState("");

  // user search state
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [editingStudentId, setEditingStudentId] = useState(null);

  // Student total collection
  const [totalCollections, setTotalCollections] = useState({});

  // Student Allocations
  const [allocationsMap, setAllocationsMap] = useState({});

  // Active allocations
  const [activeAllocations, setActiveAllocations] = useState(0);

  // Error and success dialogs
  const [errorDialog, setErrorDialog] = useState({
    show: false,
    title: "",
    message: "",
  });
  const [successDialog, setSuccessDialog] = useState({
    show: false,
    title: "",
    message: "",
  });

  // Helper function to validate CNIC format
  const validateCNIC = (cnic) => {
    if (!cnic) return false;
    // Pakistani CNIC format: 13 digits only
    const cnicRegex = /^\d{13}$/;
    return cnicRegex.test(cnic);
  };

  const showError = (title, message) => {
    setErrorDialog({
      show: true,
      title: title || "Error",
      message: message || "An unexpected error occurred"
    });
  };

  const showSuccess = (title, message) => {
    setSuccessDialog({
      show: true,
      title: title || "Success",
      message: message
    });
  };

  const closeErrorDialog = () => {
    setErrorDialog(prev => ({ ...prev, show: false }));
  };

  const closeSuccessDialog = () => {
    setSuccessDialog(prev => ({ ...prev, show: false }));
  };

  // Add state for pending requests count
const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

// Fetch pending requests count
const fetchPendingRequestsCount = async () => {
  try {
    const response = await api.get("/api/admin/admission-requests/pending");
    if (response.data.success) {
      setPendingRequestsCount(response.data.count || 0);
    }
  } catch (err) {
    console.error("Failed to fetch pending requests count:", err);
  }
};

// Call it in useEffect
useEffect(() => {
  fetchPendingRequestsCount();
}, []);

  const fetchData = async () => {
    setLoading(true);
    const hostelId = localStorage.getItem("selectedHostelId")
    try {
      // Fetch all students including inactive
      const [studentsRes, usersRes, activeAllocationsRes] = await Promise.all([
        api.get("/api/admin/students/all-including-inactive",
          {params: {hostelId}}
        ),
        api.get("/api/admin/users"),
        api.get("/api/admin/allocations/count",
          {params: {hostelId}}
        )
      ]);

      setStudents(studentsRes.data);
      setUsers(usersRes.data);
      setActiveAllocations(activeAllocationsRes.data)
    } catch (err) {
      console.error("Failed to load students", err);
      showError(
        "Failed to Load Data",
        err.response?.data?.message || "Unable to load students and users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCollection = async (studentId) => {
    try {
      const res = await api.get("/api/admin/fee/student/collection", {
        params: { studentId }
      });

      setTotalCollections(prev => ({
        ...prev,
        [studentId]: res.data
      }));
    } catch (err) {
      console.error("Failed to fetch total collection for student", studentId, err);
    }
  };

  const fetchStudentAllocation = async (studentId) => {
    const hostelId = localStorage.getItem("selectedHostelId");
    try {
      const res = await api.get(
        `/api/admin/allocations/student/${studentId}`,
        { params: { hostelId } }
      );

      setAllocationsMap(prev => ({
        ...prev,
        [studentId]: res.data
      }));
    } catch (err) {
      console.error("Failed to fetch allocation for student", studentId, err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (students?.length) {
      students.forEach(student => {
        fetchTotalCollection(student.id);
        fetchStudentAllocation(student.id);
      });
    }
  }, [students]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...students];

    // Apply status filter
    if (filterStatus === "active") {
      filtered = filtered.filter(s => s.active === true);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter(s => s.active === false);
    }

    // Apply type filter
    if (filterType === "with-account") {
      filtered = filtered.filter(s => s.user !== null);
    } else if (filterType === "manual") {
      filtered = filtered.filter(s => s.user === null);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        (s.user?.name?.toLowerCase() || s.name?.toLowerCase()).includes(term) ||
        s.cnic?.toLowerCase().includes(term) ||
        s.phone?.toLowerCase().includes(term) ||
        s.user?.email?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case "name":
          aValue = a.user?.name || a.name || "";
          bValue = b.user?.name || b.name || "";
          break;
        case "cnic":
          aValue = a.cnic || "";
          bValue = b.cnic || "";
          break;
        case "type":
          aValue = a.user ? "with-account" : "manual";
          bValue = b.user ? "with-account" : "manual";
          break;
        case "status":
          aValue = a.active ? "active" : "inactive";
          bValue = b.active ? "active" : "inactive";
          break;
        case "collection":
          aValue = totalCollections[a.id] || 0;
          bValue = totalCollections[b.id] || 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [students, searchTerm, filterStatus, filterType, sortField, sortDirection, totalCollections]);

  // Statistics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.active === true).length;
    const inactive = students.filter(s => s.active === false).length;
    const withAccount = students.filter(s => s.user !== null).length;
    const manual = students.filter(s => s.user === null).length;
    const allocated = Object.values(allocationsMap).filter(a => a?.active === true).length;

    return { total, active, inactive, withAccount, manual, allocated };
  }, [students, allocationsMap]);

  const openAddModal = () => {
    setEditingStudentId(null);
    setCnic("");
    setPhone("");
    setGuardianName("");
    setGuardianPhone("");
    setUserSearch("");
    setSelectedUser(null);
    setShowModal(true);
  };

  const openManualModal = () => {
    setManualName("");
    setManualCnic("");
    setManualPhone("");
    setManualGuardianName("");
    setManualGuardianPhone("");
    setShowManualModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudentId(student.id);
    setCnic(student.cnic || "");
    setPhone(student.phone || "");
    setGuardianName(student.guardianName || "");
    setGuardianPhone(student.guardianPhone || "");
    
    // Check if student has a user or is a manual admission
    if (student.user) {
      setSelectedUser({
        id: student.user.id,
        name: student.user.name,
        email: student.user.email,
        cnic: student.user.cnic
      });
      setUserSearch(`${student.user.name} (${student.user.email})`);
    } else {
      // For manually admitted students
      setSelectedUser({ 
        id: null, 
        name: student.name, 
        email: "Manual Admission - No Account" 
      });
      setUserSearch(`${student.name} (Manual Admission)`);
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate CNIC for all students
    if (!cnic) {
      showError("Validation Error", "CNIC is required");
      return;
    }

    if (!validateCNIC(cnic)) {
      showError("Validation Error", "Please enter a valid 13-digit CNIC (without dashes)");
      return;
    }

    if (!editingStudentId && !selectedUser) {
      showError("Validation Error", "Please select a user");
      return;
    }

    setActionLoading(true);
    const hostelId = localStorage.getItem("selectedHostelId")
    try {
      let res;
      if (editingStudentId) {
        // Update existing student - always include CNIC
        res = await api.put(`/api/admin/students/${editingStudentId}`, {
          cnic,
          phone,
          guardianName,
          guardianPhoneNumber: guardianPhone,
        });

        setStudents(students.map((s) => (s.id === editingStudentId ? res.data : s)));
        showSuccess(
          "Student Updated",
          "Student information has been successfully updated."
        );
      } else {
        // Add student with existing user - include CNIC (can override user's CNIC if needed)
        res = await api.post(`/api/admin/students/${selectedUser.id}`, {
          cnic,
          phone,
          guardianName,
          guardianPhoneNumber: guardianPhone,
        },
        {
          params: {hostelId}
        });

        setStudents([...students, res.data]);
        showSuccess(
          "Student Added",
          "Student has been successfully added to the system."
        );
      }

      setShowModal(false);
    } catch (err) {
      console.error("Failed to save student", err);
      showError(
        "Save Failed",
        err.response?.data?.message || "Unable to save student. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (!manualName || !manualCnic) {
      showError("Validation Error", "Name and CNIC are required");
      return;
    }

    if (!validateCNIC(manualCnic)) {
      showError("Validation Error", "Please enter a valid 13-digit CNIC (without dashes)");
      return;
    }

    // Check if CNIC already exists in students list
    const existingStudent = students.find(s => s.cnic === manualCnic);
    if (existingStudent) {
      showError("Duplicate CNIC", "A student with this CNIC already exists");
      return;
    }

    setManualActionLoading(true);
    const hostelId = localStorage.getItem("selectedHostelId");
    
    try {
      const res = await api.post("/api/admin/students", {
        name: manualName,
        cnic: manualCnic,
        phone: manualPhone,
        guardianName: manualGuardianName,
        guardianPhoneNumber: manualGuardianPhone,
      }, {
        params: { hostelId }
      });

      setStudents([...students, res.data]);
      showSuccess(
        "Student Admitted",
        "Student has been successfully admitted without user account."
      );
      setShowManualModal(false);
    } catch (err) {
      console.error("Failed to admit student", err);
      showError(
        "Admission Failed",
        err.response?.data?.message || "Unable to admit student. Please try again."
      );
    } finally {
      setManualActionLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this student? They will no longer be active in the system.")) return;

    try {
      const response = await api.delete(`/api/admin/students/${id}/deactivate`);
      
      if (response.data.success) {
        fetchData();
        showSuccess(
          "Student Deactivated",
          response.data.message || "Student has been successfully deactivated."
        );
      }
    } catch (err) {
      console.error("Failed to deactivate student", err);
      if (err.response?.status === 409) {
        showError("Cannot Deactivate Student", err.response.data.message);
      } else {
        showError(
          "Deactivation Failed",
          err.response?.data?.message || "Unable to deactivate student. Please try again."
        );
      }
    }
  };

  const handleHardDelete = async (id, studentName) => {
  // Stronger warning since this deletes everything including active allocations
  if (!window.confirm(`⚠️ PERMANENT DELETE: Are you sure you want to permanently delete ${studentName}?\n\nThis will delete:\n- All fee records (paid and unpaid)\n- All allocation history (even active allocations)\n- The student profile itself\n\nThis action CANNOT be undone!`)) {
    return;
  }

  try {
    const response = await api.delete(`/api/admin/students/${id}/hard`);
    
    if (response.data.success) {
      fetchData(); // Refresh the list
      showSuccess(
        "Student Permanently Deleted",
        response.data.message || "Student and all related data has been permanently deleted."
      );
    }
  } catch (err) {
    console.error("Failed to hard delete student", err);
    showError(
      "Delete Failed",
      err.response?.data?.message || "Unable to delete student. Please try again."
    );
  }
};

  const handleReactivate = async (id) => {
    if (!window.confirm("Are you sure you want to reactivate this student?")) return;

    try {
      const response = await api.put(`/api/admin/students/${id}/reactivate`);
      
      if (response.data.success) {
        fetchData();
        showSuccess("Student Reactivated", response.data.message);
      }
    } catch (err) {
      console.error("Failed to reactivate student", err);
      showError(
        "Reactivate Failed",
        err.response?.data?.message || "Unable to reactivate student. Please try again."
      );
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" 
      ? <ArrowUpIcon className="h-3 w-3 ml-1 inline" />
      : <ArrowDownIcon className="h-3 w-3 ml-1 inline" />;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("active");
    setFilterType("all");
    setSortField("name");
    setSortDirection("asc");
  };

  if (loading) return <StudentsSkeleton />;

 return (
    <div className="space-y-6">
      {/* Header Section */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
    <p className="text-gray-600 mt-1">Manage all student profiles and information</p>
  </div>
  <div className="flex flex-col sm:flex-row gap-3">
    <Link
      to="/admin/admission-requests"
      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 relative"
    >
      <InboxIcon className="h-5 w-5" />
      Admission Requests
      {/* Badge for pending requests */}
      {pendingRequestsCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] h-6 flex items-center justify-center animate-pulse">
          {pendingRequestsCount > 99 ? '99+' : pendingRequestsCount}
        </span>
      )}
    </Link>
    <button
      onClick={openAddModal}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      <PlusIcon className="h-5 w-5" />
      Add Student with Account
    </button>
    <button
      onClick={openManualModal}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
    >
      <UserPlusIcon className="h-5 w-5" />
      Admit Student Manually
    </button>
  </div>
</div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Inactive Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ArchiveBoxXMarkIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Active Allocations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.allocated}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-800">Students with Accounts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.withAccount}
              </p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-800">Manual Admissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.manual}
              </p>
            </div>
            <div className="p-2 bg-teal-100 rounded-lg">
              <UserPlusIcon className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, CNIC, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          {/* Clear Filters */}
          {(searchTerm || filterStatus !== "active" || filterType !== "all" || sortField !== "name" || sortDirection !== "asc") && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="all">All Status</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="with-account">With Account</option>
                <option value="manual">Manual Admission</option>
              </select>
            </div>

            {/* Sort Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name</option>
                <option value="cnic">CNIC</option>
                <option value="type">Type</option>
                <option value="status">Status</option>
                <option value="collection">Total Collection</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredAndSortedStudents.length}</span> of <span className="font-medium">{students.length}</span> students
        </p>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th 
                  className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleSort("name")}
                >
                  Student Details <SortIcon field="name" />
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Guardian</th>
                <th 
                  className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleSort("type")}
                >
                  Type <SortIcon field="type" />
                </th>
                <th 
                  className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleSort("status")}
                >
                  Status <SortIcon field="status" />
                </th>
                <th 
                  className="text-left py-4 px-6 font-semibold text-gray-700 cursor-pointer hover:bg-gray-200"
                  onClick={() => toggleSort("collection")}
                >
                  Total Collection <SortIcon field="collection" />
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserGroupIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium mb-2">No students found</p>
                      <p className="text-gray-500 text-sm mb-4">
                        {searchTerm || filterStatus !== "active" || filterType !== "all" 
                          ? "Try adjusting your filters"
                          : "Get started by adding your first student"}
                      </p>
                      {(searchTerm || filterStatus !== "active" || filterType !== "all") && (
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedStudents.map((student) => {
                  const allocation = allocationsMap[student.id];
                  const isAllocated = allocation?.active === true;
                  const isManualAdmission = student.user === null;
                  const isActive = student.active === true;
                  
                  return (
                    <tr key={student.id} className={`hover:bg-gray-50 transition-colors duration-200 ${!isActive ? 'bg-gray-50' : ''}`}>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">
                            {student.user ? student.user.name : student.name}
                          </div>
                          {student.user ? (
                            <>
                              <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <EnvelopeIcon className="h-3 w-3" />
                                {student.user.email}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <IdentificationIcon className="h-3 w-3" />
                                CNIC: {student.cnic}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <UserPlusIcon className="h-3 w-3" />
                                Manual Admission
                              </div>
                              <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <IdentificationIcon className="h-3 w-3" />
                                CNIC: {student.cnic}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-gray-700">
                          <PhoneIcon className="h-4 w-4" />
                          {student.phone || "Not provided"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.guardianName || "N/A"}</div>
                          {student.guardianPhone && (
                            <div className="text-sm text-gray-600">{student.guardianPhone}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isManualAdmission
                              ? "bg-teal-100 text-teal-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {isManualAdmission ? (
                            <>
                              <UserPlusIcon className="h-3 w-3 mr-1" />
                              Manual
                            </>
                          ) : (
                            <>
                              <UserIcon className="h-3 w-3 mr-1" />
                              With Account
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <ArchiveBoxIcon className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              isAllocated
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {isAllocated ? "Allocated" : "Not Allocated"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 relative group">
                        <div className="flex items-center gap-1 text-gray-700">
                          <span className="text-gray-700 font-medium">₨</span>
                          {totalCollections[student.id] !== undefined ? (
                            <>
                              {totalCollections[student.id].toLocaleString()}
                              <span className="invisible group-hover:visible absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                Total fees collected
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400 flex items-center gap-1">
                              <ArrowPathIcon className="h-3 w-3 animate-spin" />
                              Loading...
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {/* Edit button - available to both admin and staff */}
                          <button
                            onClick={() => openEditModal(student)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors duration-200"
                            title="Edit Student"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                          </button>
                          
                          {/* Admin-only actions */}
                          {role === 'ADMIN' && (
                            <>
                              {/* Deactivate button - admin only */}
                              <button
                                onClick={() => handleDeactivate(student.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium transition-colors duration-200"
                                title="Deactivate (soft delete)"
                              >
                                <ArchiveBoxIcon className="h-4 w-4" />
                                Deactivate
                              </button>
                              
                              {/* Hard Delete button - admin only */}
                              <button
                                onClick={() => handleHardDelete(student.id, student.name)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors duration-200"
                                title="Permanently Delete (removes all data)"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh Students
        </button>
      </div>

      {/* Existing User Modal */}
      {showModal && (
        <Modal
          editingStudentId={editingStudentId}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          cnic={cnic}
          setCnic={setCnic}
          phone={phone}
          setPhone={setPhone}
          guardianName={guardianName}
          setGuardianName={setGuardianName}
          guardianPhone={guardianPhone}
          setGuardianPhone={setGuardianPhone}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          actionLoading={actionLoading}
          students={students}
        />
      )}

      {/* Manual Admission Modal */}
      {showManualModal && (
        <ManualAdmissionModal
          manualName={manualName}
          setManualName={setManualName}
          manualCnic={manualCnic}
          setManualCnic={setManualCnic}
          manualPhone={manualPhone}
          setManualPhone={setManualPhone}
          manualGuardianName={manualGuardianName}
          setManualGuardianName={setManualGuardianName}
          manualGuardianPhone={manualGuardianPhone}
          setManualGuardianPhone={setManualGuardianPhone}
          onClose={() => setShowManualModal(false)}
          onSubmit={handleManualSubmit}
          actionLoading={manualActionLoading}
        />
      )}

      {/* Error Dialog */}
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

      {/* Success Dialog */}
      {successDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{successDialog.title}</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700">{successDialog.message}</p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={closeSuccessDialog}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Existing User Modal component (unchanged)
const Modal = memo(({
  editingStudentId,
  userSearch,
  setUserSearch,
  users,
  selectedUser,
  setSelectedUser,
  cnic,
  setCnic,
  phone,
  setPhone,
  guardianName,
  setGuardianName,
  guardianPhone,
  setGuardianPhone,
  onClose,
  onSubmit,
  actionLoading,
  students
}) => {
  // Filter users who are not admins and not already students
  const availableUsers = users.filter(
    u => u.role !== "ADMIN" && !students.some(s => s.user?.id === u.id)
  );

  const filteredUsers = userSearch && !selectedUser
    ? availableUsers.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  // Pre-fill CNIC from selected user if available and not editing
  useEffect(() => {
    if (selectedUser && selectedUser.id !== null && !editingStudentId) {
      // When a user is selected for new admission, pre-fill CNIC from user
      setCnic(selectedUser.cnic || "");
    }
  }, [selectedUser, editingStudentId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {editingStudentId ? "Edit Student" : "Add Student with Account"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={actionLoading}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {editingStudentId && selectedUser && selectedUser.id === null && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <UserPlusIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">Manual Admission Student</p>
                  <p className="text-sm text-purple-700">
                    This student was admitted manually. You can update their details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Show selected user info if editing a student with account */}
          {editingStudentId && selectedUser && selectedUser.id !== null && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Student with Account</p>
                  <p className="text-sm text-blue-700">
                    User: {selectedUser.name} ({selectedUser.email})
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    CNIC can be edited if needed
                  </p>
                </div>
              </div>
            </div>
          )}

          {!editingStudentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search User
                <span className="text-gray-500 text-sm ml-1">(Name or Email)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Start typing to search users..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setSelectedUser(null);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={actionLoading}
                />
                {userSearch && !selectedUser && filteredUsers.length > 0 && (
                  <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u);
                          setUserSearch(`${u.name} (${u.email})`);
                        }}
                        className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedUser && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-800">Selected User</p>
                      <p className="text-sm text-green-700">{selectedUser.name} ({selectedUser.email})</p>
                      <p className="text-xs text-green-600 mt-1">
                        CNIC will be pre-filled from user's registration
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setUserSearch("");
                        setCnic("");
                      }}
                      className="text-green-700 hover:text-green-900"
                      disabled={actionLoading}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CNIC Field - ALWAYS VISIBLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNIC *
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter 13-digit CNIC without dashes"
              value={cnic}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 13) {
                  setCnic(val);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={actionLoading}
              required
              maxLength={13}
            />
            {selectedUser && selectedUser.id !== null && !editingStudentId && (
              <p className="text-xs text-blue-600 mt-1">
                Pre-filled from user's registration. You can edit if needed.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={actionLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guardian Name
              </label>
              <input
                type="text"
                placeholder="Guardian name"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={actionLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guardian Phone
              </label>
              <input
                type="text"
                placeholder="Guardian phone"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={actionLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={actionLoading || (!editingStudentId && !selectedUser)}
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : editingStudentId ? "Update Student" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// Manual Admission Modal component (updated with CNIC validation)
const ManualAdmissionModal = memo(({
  manualName,
  setManualName,
  manualCnic,
  setManualCnic,
  manualPhone,
  setManualPhone,
  manualGuardianName,
  setManualGuardianName,
  manualGuardianPhone,
  setManualGuardianPhone,
  onClose,
  onSubmit,
  actionLoading
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <UserPlusIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Admit Student Manually</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            disabled={actionLoading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <p className="text-green-100 text-sm mt-2">
          Create student record without user account
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Name *
          </label>
          <input
            type="text"
            placeholder="Enter student full name"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            required
            disabled={actionLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CNIC *
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter 13-digit CNIC without dashes"
            value={manualCnic}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              if (val.length <= 13) {
                setManualCnic(val);
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            required
            disabled={actionLoading}
            maxLength={13}
          />
          <p className="text-xs text-gray-500 mt-1">Enter 13 digits only (e.g., 1234512345671)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="Enter phone number"
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            disabled={actionLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Name
            </label>
            <input
              type="text"
              placeholder="Guardian name"
              value={manualGuardianName}
              onChange={(e) => setManualGuardianName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={actionLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guardian Phone
            </label>
            <input
              type="text"
              placeholder="Guardian phone"
              value={manualGuardianPhone}
              onChange={(e) => setManualGuardianPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={actionLoading}
            />
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <ExclamationCircleIcon className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">Manual Admission Note</p>
              <p className="text-xs text-green-700">
                This student will be created without a user account. They won't have login access.
                To add login access later, associate them with an existing user using the same CNIC.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <span className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Admitting...
              </span>
            ) : (
              <>
                <UserPlusIcon className="h-4 w-4 mr-2 inline" />
                Admit Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
));

function StudentsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-48 bg-gray-200 rounded-xl"></div>
          <div className="h-12 w-48 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-100 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-300 rounded"></div>
                <div className="h-8 w-16 bg-gray-300 rounded"></div>
              </div>
              <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-gray-100 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
                <div className="h-8 w-20 bg-gray-300 rounded"></div>
              </div>
              <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4 w-full">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button Skeleton */}
      <div className="flex justify-center">
        <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}