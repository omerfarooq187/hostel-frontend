import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  InboxIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  BuildingOfficeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function AdmissionRequests() {
  const hostelId = localStorage.getItem("selectedHostelId");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING"); // PENDING, APPROVED, REJECTED, ALL
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [hostels, setHostels] = useState([]);

  // Alert state
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  useEffect(() => {
    fetchRequests();
    fetchHostels();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/admission-requests/all";
      if (filter !== "ALL") {
        url = `/api/admin/admission-requests/all?status=${filter}`;
      }
      const response = await api.get(url, { params: { hostelId } });
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
      showAlert("error", "Failed to load admission requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const response = await api.get("/api/admin/hostels");
      setHostels(response.data);
    } catch (err) {
      console.error("Failed to fetch hostels", err);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || !selectedHostel) {
      showAlert("error", "Please select a hostel");
      return;
    }

    setActionLoading(true);
    try {
      await api.post(
        `/api/admin/admission-requests/${selectedRequest.id}/approve?hostelId=${selectedHostel}`,
        {}
      );
      showAlert("success", "Request approved successfully");
      setShowApproveModal(false);
      setSelectedRequest(null);
      setSelectedHostel("");
      fetchRequests();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      await api.post(`/api/admin/admission-requests/${selectedRequest.id}/reject`, {
        reason: rejectReason || "Request rejected",
      });
      showAlert("success", "Request rejected successfully");
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
      fetchRequests();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setSelectedHostel(request.hostelId || "");
    setShowApproveModal(true);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const filteredRequests = requests.filter((req) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      req.name?.toLowerCase().includes(term) ||
      req.cnic?.toLowerCase().includes(term) ||
      req.email?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <ClockIcon className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Rejected
          </span>
        );
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg ${
            alert.type === "success"
              ? "bg-green-100 border border-green-400 text-green-800"
              : "bg-red-100 border border-red-400 text-red-800"
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <InboxIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admission Requests</h1>
              <p className="text-purple-100 mt-1">
                Review and manage student admission requests
              </p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {requests.filter((r) => r.admissionStatus === "PENDING").length}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Approved</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {requests.filter((r) => r.admissionStatus === "APPROVED").length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {requests.filter((r) => r.admissionStatus === "REJECTED").length}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{requests.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, CNIC, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("PENDING")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "PENDING"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("APPROVED")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "APPROVED"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("REJECTED")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "REJECTED"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "ALL"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Guardian</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <InboxIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium">No requests found</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "No admission requests to display"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{request.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <IdentificationIcon className="h-3 w-3" />
                        {request.cnic}
                      </div>
                      {request.email && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <EnvelopeIcon className="h-3 w-3" />
                          {request.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {request.phone ? (
                        <div className="flex items-center gap-1 text-gray-700">
                          <PhoneIcon className="h-4 w-4" />
                          {request.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.guardianName || "N/A"}
                        </div>
                        {request.guardianPhone && (
                          <div className="text-sm text-gray-500">{request.guardianPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{formatDate(request.requestedAt)}</div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(request.admissionStatus)}</td>
                    <td className="px-6 py-4">
                      {request.admissionStatus === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openApproveModal(request)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <CheckIcon className="h-4 w-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(request)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            Reject
                          </button>
                        </div>
                      ) : request.admissionStatus === "REJECTED" && request.rejectionReason ? (
                        <div className="relative group">
                          <span className="text-sm text-gray-500 cursor-help">
                            View reason
                          </span>
                          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 max-w-xs">
                            {request.rejectionReason}
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Approve Admission Request</h2>
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700">
                  Approving request for: <span className="font-semibold">{selectedRequest.name}</span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Hostel *
                </label>
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="">Choose a hostel...</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                  This will create a student profile and activate the student.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={!selectedHostel || actionLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? "Approving..." : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Reject Admission Request</h2>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="text-white hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700">
                  Rejecting request for: <span className="font-semibold">{selectedRequest.name}</span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter reason for rejection..."
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  <XCircleIcon className="h-4 w-4 inline mr-1" />
                  This action cannot be undone. The student will be notified.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}