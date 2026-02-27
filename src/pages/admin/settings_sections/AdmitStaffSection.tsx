import { useEffect, useState } from "react";
import api from "../../../api/axios";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  PhoneIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function AdmitStaffSection() {
  const hostelId = localStorage.getItem("selectedHostelId");

  // --- State ---
  const [users, setUsers] = useState([]);        // all non-staff, non-admin users
  const [selectedUserId, setSelectedUserId] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [joiningDate, setJoiningDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- Load all eligible users (role = USER) ---
  const loadEligibleUsers = async () => {
    try {
      // 🔧 This endpoint is not provided – you may need to create:
      // GET /api/admin/users?role=USER&hostelId=...
      // For now we simulate with a placeholder. Adjust according to your actual API.
      const res = await api.get("/api/admin/users", {
        params: { role: "USER", hostelId },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Could not load eligible users");
    }
  };

  // --- Load all current staff ---
  const loadStaff = async () => {
    try {
      const res = await api.get("/api/admin/staff");
      setStaffList(res.data);
    } catch (err) {
      console.error("Failed to load staff", err);
      setError("Could not load staff list");
    }
  };

  useEffect(() => {
    loadEligibleUsers();
    loadStaff();
  }, []);

  // --- Admit staff ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/api/admin/staff/${selectedUserId}/make-staff`, {
        hostelId: parseInt(hostelId),
        designation,
        phone,
        joiningDate,
      });

      setSuccess("Staff admitted successfully");
      // Reset form
      setSelectedUserId("");
      setDesignation("");
      setPhone("");
      setJoiningDate(new Date().toISOString().split("T")[0]);
      // Refresh lists
      loadEligibleUsers();
      loadStaff();
    } catch (err) {
      console.error("Failed to admit staff", err);
      setError(err.response?.data || "Failed to admit staff");
    } finally {
      setLoading(false);
    }
  };

  // --- Remove staff ---
  const handleRemoveStaff = async (staffId) => {
    if (!window.confirm("Are you sure you want to remove this staff member?"))
      return;
    try {
      await api.delete(`/api/admin/staff/${staffId}`);
      loadStaff(); // refresh list
      loadEligibleUsers(); // user becomes eligible again
    } catch (err) {
      console.error("Failed to remove staff", err);
      alert("Could not remove staff");
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <UserGroupIcon className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Admit Staff</h2>
      </div>

      {/* Admit Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User selection with search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Select User *
          </label>
          <div className="relative mb-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
            required
          >
            <option value="">-- Choose a user --</option>
            {filteredUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {users.length === 0 && (
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
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required
            />
          </div>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:ring-4 focus:ring-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Admitting..." : "Admit as Staff"}
        </button>
      </form>

      {/* Divider */}
      <div className="border-t border-gray-200 my-2"></div>

      {/* Current Staff List */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <UserGroupIcon className="h-5 w-5 text-gray-500" />
          Current Staff ({staffList.length})
        </h3>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {staffList.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
              No staff members admitted yet.
            </p>
          ) : (
            staffList.map((staff) => (
              <div
                key={staff.id}
                className="flex items-start justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {staff.user?.name}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                      {staff.designation}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <IdentificationIcon className="h-4 w-4 text-gray-400" />
                      {staff.user?.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      {staff.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      Joined:{" "}
                      {new Date(staff.joiningDate).toLocaleDateString("en-IN")}
                    </span>
                    <span className="flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                      Hostel ID: {staff.hostel?.id || staff.hostelId}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveStaff(staff.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                  title="Remove staff"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}