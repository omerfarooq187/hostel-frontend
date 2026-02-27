import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  PhoneIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  PencilIcon
} from "@heroicons/react/24/outline";

export default function StaffManagementPage() {
  const hostelId = localStorage.getItem("selectedHostelId");
  const { role } = useAuth();

  // ---------- State ----------
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Admit Staff Modal
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [searchUserTerm, setSearchUserTerm] = useState("");
  const [admitForm, setAdmitForm] = useState({
    userId: "",
    designation: "",
    phone: "",
    joiningDate: new Date().toISOString().split("T")[0],
  });

  // Expandable salary rows
  const [expandedStaffId, setExpandedStaffId] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState({}); // staffId -> array

  // Add salary modal per staff
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedStaffForSalary, setSelectedStaffForSalary] = useState(null);
  const [salaryForm, setSalaryForm] = useState({
    amount: "",
    month: new Date().toISOString().slice(0, 7) + "-01", // YYYY-MM-01
    paidDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  // Alert
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  // ---------- API Calls ----------

  // 1. Load all staff
  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/staff");
      setStaffList(res.data);
    } catch (err) {
      console.error("Failed to load staff", err);
      setError("Could not load staff list");
    } finally {
      setLoading(false);
    }
  };

  // 2. Load eligible users (role = USER, not staff/admin)
  //    🔧 Requires backend: GET /api/admin/users?role=USER&hostelId=...
  const loadEligibleUsers = async () => {
    try {
      const res = await api.get("/api/admin/users", {
        params: { role: "USER", hostelId },
      });
      setEligibleUsers(res.data);
    } catch (err) {
      console.error("Failed to load eligible users", err);
      // If endpoint doesn't exist, show a message
      setEligibleUsers([]);
    }
  };

  // 3. Load salary history for a specific staff
  const loadSalaryHistory = async (staffId) => {
    try {
      const res = await api.get(`/api/admin/staff/${staffId}/salary`);
      setSalaryHistory((prev) => ({ ...prev, [staffId]: res.data }));
    } catch (err) {
      console.error("Failed to load salary history", err);
    }
  };

  // 4. Admit new staff
  const handleAdmitStaff = async (e) => {
    e.preventDefault();
    if (!admitForm.userId) {
      showAlert("error", "Please select a user");
      return;
    }
    try {
      await api.post(`/api/admin/staff/${admitForm.userId}/make-staff`, {
        hostelId: parseInt(hostelId),
        designation: admitForm.designation,
        phone: admitForm.phone,
        joiningDate: admitForm.joiningDate,
      });
      showAlert("success", "Staff admitted successfully");
      setShowAdmitModal(false);
      setAdmitForm({
        userId: "",
        designation: "",
        phone: "",
        joiningDate: new Date().toISOString().split("T")[0],
      });
      loadStaff();
      loadEligibleUsers(); // refresh eligible list
    } catch (err) {
      showAlert("error", err.response?.data || "Failed to admit staff");
    }
  };

  // 5. Remove staff
  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to remove this staff member?"))
      return;
    try {
      await api.delete(`/api/admin/staff/${staffId}`);
      showAlert("success", "Staff removed successfully");
      loadStaff();
      loadEligibleUsers();
    } catch (err) {
      showAlert("error", "Failed to remove staff");
    }
  };

  // 6. Add salary
  const handleAddSalary = async (e) => {
    e.preventDefault();
    if (!selectedStaffForSalary) return;
    try {
      await api.post(`/api/admin/staff/${selectedStaffForSalary.id}/salary`, {
        amount: parseFloat(salaryForm.amount),
        month: salaryForm.month,
        paidDate: salaryForm.paidDate,
        remarks: salaryForm.remarks || "",
      });
      showAlert("success", "Salary added successfully");
      setShowSalaryModal(false);
      setSalaryForm({
        amount: "",
        month: new Date().toISOString().slice(0, 7) + "-01",
        paidDate: new Date().toISOString().split("T")[0],
        remarks: "",
      });
      // Refresh salary history for this staff
      loadSalaryHistory(selectedStaffForSalary.id);
    } catch (err) {
      showAlert("error", err.response?.data || "Failed to add salary");
    }
  };

  // 7. Delete salary
  const handleDeleteSalary = async (salaryId, staffId) => {
    if (!window.confirm("Delete this salary entry?")) return;
    try {
      await api.delete(`/api/admin/staff/salary/${salaryId}`);
      showAlert("success", "Salary deleted");
      loadSalaryHistory(staffId); // refresh
    } catch (err) {
      showAlert("error", "Failed to delete salary");
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    loadStaff();
    loadEligibleUsers();
  }, []);

  // Expand/collapse salary section
  const toggleExpand = (staffId) => {
    if (expandedStaffId === staffId) {
      setExpandedStaffId(null);
    } else {
      setExpandedStaffId(staffId);
      if (!salaryHistory[staffId]) {
        loadSalaryHistory(staffId);
      }
    }
  };

  // Filter eligible users by search
  const filteredEligibleUsers = eligibleUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUserTerm.toLowerCase())
  );

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg ${
            alert.type === "success"
              ? "bg-green-100 border border-green-400 text-green-800"
              : alert.type === "error"
              ? "bg-red-100 border border-red-400 text-red-800"
              : "bg-blue-100 border border-blue-400 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {alert.type === "success" ? (
              <CheckCircleIcon className="h-6 w-6" />
            ) : (
              <ExclamationCircleIcon className="h-6 w-6" />
            )}
            <span className="font-medium">{alert.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-indigo-100 mt-1">
              Manage staff members, designations, and salaries
            </p>
          </div>
          <button
            onClick={() => setShowAdmitModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-100 text-indigo-700 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <PlusIcon className="h-5 w-5" />
            Admit New Staff
          </button>
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="h-5 w-5 text-gray-600" />
            Current Staff ({staffList.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading staff...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : staffList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No staff members found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {staffList.map((staff) => (
              <StaffRow
                key={staff.id}
                staff={staff}
                expanded={expandedStaffId === staff.id}
                onToggle={() => toggleExpand(staff.id)}
                salaryHistory={salaryHistory[staff.id] || []}
                onRemove={() => handleRemoveStaff(staff.id)}
                onAddSalary={() => {
                  setSelectedStaffForSalary(staff);
                  setShowSalaryModal(true);
                }}
                onDeleteSalary={(salaryId) =>
                  handleDeleteSalary(salaryId, staff.id)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------- MODAL: Admit Staff ---------- */}
      {showAdmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Admit New Staff
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Promote a user to staff member
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdmitModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAdmitStaff} className="space-y-5">
                {/* User selection with search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Select User *
                  </label>
                  <div className="relative mb-2">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchUserTerm}
                      onChange={(e) => setSearchUserTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                  <select
                    value={admitForm.userId}
                    onChange={(e) =>
                      setAdmitForm({ ...admitForm, userId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                    required
                  >
                    <option value="">-- Choose a user --</option>
                    {filteredEligibleUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {eligibleUsers.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      No eligible users found.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Designation *
                    </label>
                    <input
                      type="text"
                      value={admitForm.designation}
                      onChange={(e) =>
                        setAdmitForm({ ...admitForm, designation: e.target.value })
                      }
                      placeholder="e.g. Chef, Cleaner"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone *
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={admitForm.phone}
                        onChange={(e) =>
                          setAdmitForm({ ...admitForm, phone: e.target.value })
                        }
                        placeholder="Contact number"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Joining Date *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={admitForm.joiningDate}
                      onChange={(e) =>
                        setAdmitForm({ ...admitForm, joiningDate: e.target.value })
                      }
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAdmitModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors font-medium"
                  >
                    Admit Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------- MODAL: Add Salary ---------- */}
      {showSalaryModal && selectedStaffForSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Add Salary
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {selectedStaffForSalary.user?.name} •{" "}
                      {selectedStaffForSalary.designation}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSalaryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddSalary} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Amount (₹) *
                  </label>
                  <div className="relative">
                    <CurrencyRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={salaryForm.amount}
                      onChange={(e) =>
                        setSalaryForm({ ...salaryForm, amount: e.target.value })
                      }
                      placeholder="e.g. 15000"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Month *
                    </label>
                    <input
                      type="month"
                      value={salaryForm.month.slice(0, 7)}
                      onChange={(e) =>
                        setSalaryForm({
                          ...salaryForm,
                          month: e.target.value + "-01",
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Paid Date *
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={salaryForm.paidDate}
                        onChange={(e) =>
                          setSalaryForm({ ...salaryForm, paidDate: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Remarks (Optional)
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={salaryForm.remarks}
                      onChange={(e) =>
                        setSalaryForm({ ...salaryForm, remarks: e.target.value })
                      }
                      placeholder="Any notes"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSalaryModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-colors font-medium"
                  >
                    Save Salary
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Staff Row Component ----------
const StaffRow = ({
  staff,
  expanded,
  onToggle,
  salaryHistory,
  onRemove,
  onAddSalary,
  onDeleteSalary,
}) => {
  const user = staff.user || {};
  const hostel = staff.hostel || {};

  return (
    <div className="p-4 hover:bg-gray-50 transition">
      {/* Main row */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-semibold text-gray-900">{user.name}</span>
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
              {staff.designation}
            </span>
            {!user.active && (
              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full border border-red-200">
                Inactive
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1">
              <IdentificationIcon className="h-4 w-4 text-gray-400" />
              {user.email}
            </span>
            <span className="flex items-center gap-1">
              <PhoneIcon className="h-4 w-4 text-gray-400" />
              {staff.phone}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              Joined: {new Date(staff.joiningDate).toLocaleDateString("en-IN")}
            </span>
            <span className="flex items-center gap-1">
              <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
              {hostel.name || `Hostel ID: ${staff.hostelId}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddSalary}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition"
            title="Add Salary"
          >
            <CurrencyRupeeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onToggle}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            {expanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
            title="Remove Staff"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Expanded salary section */}
      {expanded && (
        <div className="mt-4 pl-4 border-l-4 border-indigo-200 bg-gray-50 rounded-r-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
              Salary History
            </h4>
            <span className="text-sm text-gray-500">
              {salaryHistory.length} entries
            </span>
          </div>

          {salaryHistory.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No salary records yet.</p>
          ) : (
            <div className="space-y-2">
              {salaryHistory.map((salary) => (
                <div
                  key={salary.id}
                  className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-green-700">
                      ₹{salary.amount.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(salary.month).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-gray-500">
                      Paid: {new Date(salary.paidDate).toLocaleDateString("en-IN")}
                    </span>
                    {salary.remarks && (
                      <span className="text-xs text-gray-500 italic">
                        {salary.remarks}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteSalary(salary.id)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};