import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  BuildingOfficeIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function Allocations() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // History modal
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const hostelId = localStorage.getItem("selectedHostelId")
  
  // Error dialog state
  const [errorDialog, setErrorDialog] = useState({
    show: false,
    title: "",
    message: "",
  });

  // Success dialog state
  const [successDialog, setSuccessDialog] = useState({
    show: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

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

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [roomsRes, studentsRes] = await Promise.all([
        api.get("/api/admin/rooms", {
          params: {hostelId}
        }),
        api.get("/api/admin/students", {
          params: {hostelId}
        }),
      ]);
      setRooms(roomsRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
      showError(
        "Failed to Load Data", 
        err.response?.data?.message || "Unable to load rooms and students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRoomAllocations = async (roomId) => {
    setSelectedRoom(roomId);
    if (!roomId) return setAllocations([]);

    try {
      const res = await api.get(`/api/admin/allocations/room/${roomId}`);
      setAllocations(res.data);
    } catch (err) {
      console.error("Failed to load allocations", err);
      showError(
        "Failed to Load Allocations",
        err.response?.data?.message || "Unable to load room allocations. Please try again."
      );
      setAllocations([]);
    }
  };

  const handleAllocate = async () => {
    if (!selectedStudent || !selectedRoom) {
      showError("Invalid Selection", "Please select both a room and a student.");
      return;
    }

    setActionLoading(true);
    try {
      await api.post(
        `/api/admin/allocations/student/${selectedStudent}/room/${selectedRoom}`,
        {},
        {
          params: {hostelId}
        }
      );
      loadRoomAllocations(selectedRoom);
      setSelectedStudent("");
      showSuccess(
        "Allocation Successful",
        "Student has been successfully allocated to the room."
      );
    } catch (err) {
      console.error("Allocation failed", err);
      showError(
        "Allocation Failed",
        err.response?.data?.message || "Unable to allocate student. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeallocate = async (allocationId) => {
    if (!window.confirm("Are you sure you want to deallocate this student?")) return;

    try {
      await api.post(`/api/admin/allocations/deallocate/${allocationId}`);
      loadRoomAllocations(selectedRoom);
      showSuccess(
        "Deallocation Successful",
        "Student has been successfully deallocated from the room."
      );
    } catch (err) {
      console.error("Failed to deallocate", err);
      showError(
        "Deallocation Failed",
        err.response?.data?.message || "Unable to deallocate student. Please try again."
      );
    }
  };

  const openHistory = async (studentId) => {
    try {
      const res = await api.get(
        `/api/admin/allocations/student/${studentId}/history`,
        {params: {hostelId}}
      );
      setHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      console.error("Failed to load history", err);
      showError(
        "Failed to Load History",
        err.response?.data?.message || "Unable to load allocation history. Please try again."
      );
    }
  };

  const selectedRoomInfo = rooms.find(r => r.id == selectedRoom);

  if (loading) return <AllocationsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Allocations</h1>
          <p className="text-gray-600 mt-1">Allocate students to rooms and manage assignments</p>
        </div>
        <button
          onClick={loadInitialData}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh Data
        </button>
      </div>

      {/* Allocation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Selection Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Select Room</h3>
              <p className="text-sm text-gray-600">Choose a room to view allocations</p>
            </div>
          </div>
          <select
            value={selectedRoom}
            onChange={(e) => loadRoomAllocations(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Choose a room...</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.block} - Room {r.roomNumber} (Capacity: {r.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* Student Selection Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Select Student</h3>
              <p className="text-sm text-gray-600">Choose a student to allocate</p>
            </div>
          </div>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <option value="">Choose a student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.cnic})
              </option>
            ))}
          </select>
        </div>

        {/* Allocation Action Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <PlusIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Allocation Action</h3>
              <p className="text-sm text-gray-600">Allocate selected student to room</p>
            </div>
          </div>
          <button
            onClick={handleAllocate}
            disabled={!selectedStudent || !selectedRoom || actionLoading}
            className="mt-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-purple-400 disabled:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed"
          >
            {actionLoading ? (
              <span className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Allocating...
              </span>
            ) : (
              "Allocate Student"
            )}
          </button>
        </div>
      </div>

      {/* Room Information */}
      {selectedRoom && selectedRoomInfo && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {selectedRoomInfo.block} - Room {selectedRoomInfo.roomNumber}
              </h3>
              <div className="flex items-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Capacity: {selectedRoomInfo.capacity} beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Occupancy: {allocations.length}/{selectedRoomInfo.capacity}</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {allocations.length === 0 ? (
                <span className="text-green-600 font-medium">Empty room - Ready for allocation</span>
              ) : allocations.length === selectedRoomInfo.capacity ? (
                <span className="text-red-600 font-medium">Room is full</span>
              ) : (
                <span className="text-yellow-600 font-medium">
                  {selectedRoomInfo.capacity - allocations.length} beds available
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Allocations Table */}
      {selectedRoom && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Current Allocations
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({allocations.length} allocated)
                </span>
              </h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Student Details</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Bed Number</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 px-6 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="p-3 bg-gray-100 rounded-full mb-3">
                          <UserIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No allocations for this room</p>
                        <p className="text-gray-400 text-sm mt-1">Select a student and allocate to begin</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allocations.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">{a.student.name}</div>
                          <div className="text-sm text-gray-600">CNIC: {a.student.cnic}</div>
                          <button
                            onClick={() => openHistory(a.student.id)}
                            className="mt-1 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            <ClockIcon className="h-3 w-3" />
                            View Allocation History
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          Bed {a.bedNumber}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleDeallocate(a.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors duration-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                          Deallocate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Allocation History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Room</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Bed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {h.room.block} - {h.room.roomNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          h.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          Bed {h.bedNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          h.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {h.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {history.length === 0 && (
                <div className="py-8 text-center">
                  <div className="p-3 bg-gray-100 rounded-full inline-flex mb-3">
                    <ClockIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No allocation history found</p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close History
                </button>
              </div>
            </div>
          </div>
        </div>
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

function AllocationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="h-12 w-40 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Control Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
                <div className="h-3 w-48 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="h-12 w-full bg-gray-300 rounded-xl"></div>
          </div>
        ))}
      </div>

      {/* Room Info Skeleton */}
      <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
        <div className="space-y-3">
          <div className="h-6 w-48 bg-gray-300 rounded"></div>
          <div className="h-4 w-64 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}