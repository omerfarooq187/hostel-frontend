import { useEffect, useState, memo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import {
  BellSnoozeIcon,
  UserIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MinusIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";

export default function RoomBeds() {
  const { roomId } = useParams();

  const [room, setRoom] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    loadData();
  }, [roomId]);

  const loadData = async () => {
    setLoading(true);
    const hostelId = localStorage.getItem("selectedHostelId");
    try {
      const [roomRes, allocRes, studentsRes] = await Promise.all([
        api.get(`/api/admin/rooms/${roomId}`),
        api.get(`/api/admin/allocations/room/${roomId}`),
        api.get("/api/admin/students", {
          params: {hostelId}
        }),
      ]);

      setRoom(roomRes.data);
      setAllocations(allocRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
      showError(
        "Failed to Load Data",
        err.response?.data?.message || "Unable to load room data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const occupiedMap = {};
  allocations.forEach(a => {
    occupiedMap[a.bedNumber] = a;
  });

  const allocate = async (bedNumber) => {
    if (!selectedStudent) {
      showError("No Student Selected", "Please select a student first.");
      return;
    }

    setActionLoading(true);
    const hostelId = localStorage.getItem("selectedHostelId");
    try {
      await api.post(
        `/api/admin/allocations/student/${selectedStudent}/room/${roomId}/bed/${bedNumber}`,
        null,
        {
          params: {hostelId}
        }
      );
      await loadData();
      setSelectedStudent("");
      showSuccess(
        "Bed Allocated",
        `Student has been successfully allocated to Bed ${bedNumber}.`
      );
    } catch (err) {
      console.error("Failed to allocate bed", err);
      showError(
        "Allocation Failed",
        err.response?.data?.message || "Unable to allocate bed. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const deallocate = async (allocationId) => {
    setActionLoading(true);
    try {
      await api.post(`/api/admin/allocations/deallocate/${allocationId}`);
      await loadData();
      showSuccess(
        "Bed Deallocated",
        "Student has been successfully deallocated from the bed."
      );
    } catch (err) {
      console.error("Failed to deallocate bed", err);
      showError(
        "Deallocation Failed",
        err.response?.data?.message || "Unable to deallocate bed. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <RoomBedsSkeleton />;
  if (!room) return null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/rooms"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Rooms
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {room.block} - Room {room.roomNumber}
            </h1>
            <p className="text-gray-600 mt-1">Manage bed allocations for this room</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Room Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Room Details</h3>
              <p className="text-sm text-gray-600">Complete room information</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Block</span>
              <span className="font-medium">{room.block}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Room Number</span>
              <span className="font-medium">{room.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Capacity</span>
              <span className="font-medium">{room.capacity} beds</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <BellSnoozeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Bed Status</h3>
              <p className="text-sm text-gray-600">Current allocation status</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Occupied Beds</span>
              <span className="font-medium text-red-600">{allocations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available Beds</span>
              <span className="font-medium text-green-600">{room.capacity - allocations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilization</span>
              <span className="font-medium">
                {room.capacity > 0 ? Math.round((allocations.length / room.capacity) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Allocate Student</h3>
              <p className="text-sm text-gray-600">Select student for allocation</p>
            </div>
          </div>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            disabled={actionLoading}
          >
            <option value="">Choose a student...</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.cnic})
              </option>
            ))}
          </select>
          {selectedStudent && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-800">
                Ready to allocate. Click on an available bed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Beds Grid */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Bed Allocation</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Occupied</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: room.capacity }).map((_, i) => {
            const bedNumber = i + 1;
            const allocation = occupiedMap[bedNumber];
            const isOccupied = !!allocation;

            return (
              <BedCard
                key={bedNumber}
                bedNumber={bedNumber}
                allocation={allocation}
                isOccupied={isOccupied}
                selectedStudent={selectedStudent}
                onAllocate={() => allocate(bedNumber)}
                onDeallocate={() => deallocate(allocation.id)}
                disabled={actionLoading}
              />
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">How to Allocate</h3>
        <ol className="space-y-2 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              1
            </span>
            <span>Select a student from the dropdown in the right card</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              2
            </span>
            <span>Click on an available (green) bed to allocate the student</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              3
            </span>
            <span>Click on an occupied (red) bed to deallocate the student</span>
          </li>
        </ol>
      </div>

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

const BedCard = memo(({ bedNumber, allocation, isOccupied, selectedStudent, onAllocate, onDeallocate, disabled }) => {
  return (
    <div
      onClick={() => !disabled && (isOccupied ? onDeallocate() : onAllocate())}
      className={`relative rounded-xl p-5 border-2 transition-all duration-300 cursor-pointer ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 hover:shadow-lg'
      } ${
        isOccupied
          ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:border-red-300'
          : selectedStudent
          ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300'
          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Bed Number */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-bold text-gray-900">Bed {bedNumber}</div>
        {isOccupied ? (
          <XCircleIcon className="h-5 w-5 text-red-500" />
        ) : (
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
        )}
      </div>

      {/* Status Indicator */}
      <div className={`mb-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        isOccupied
          ? 'bg-red-100 text-red-800'
          : selectedStudent
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isOccupied ? 'Occupied' : selectedStudent ? 'Click to Allocate' : 'Available'}
      </div>

      {/* Student Info or Empty State */}
      {isOccupied ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-red-100 rounded">
              <UserIcon className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm truncate">
                {allocation.student.name}
              </p>
              <p className="text-xs text-gray-600">
                CNIC: {allocation.student.cnic}
              </p>
            </div>
          </div>
          <button
            className="w-full mt-2 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onDeallocate();
            }}
            disabled={disabled}
          >
            <MinusIcon className="h-3 w-3" />
            Deallocate
          </button>
        </div>
      ) : selectedStudent ? (
        <div className="text-center">
          <div className="p-2 bg-green-100 rounded-lg inline-flex mb-2">
            <PlusIcon className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-700">Click to allocate</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="p-2 bg-gray-100 rounded-lg inline-flex mb-2">
            <BellSnoozeIcon className="h-5 w-5 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500">Select a student first</p>
        </div>
      )}
    </div>
  );
});

function RoomBedsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-300 rounded"></div>
                <div className="h-3 w-48 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-300 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Beds Grid Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-gray-100 border border-gray-200 rounded-xl p-5">
              <div className="space-y-3">
                <div className="h-6 w-16 bg-gray-300 rounded"></div>
                <div className="h-6 w-24 bg-gray-300 rounded-full"></div>
                <div className="h-16 w-full bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions Skeleton */}
      <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
        <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
              <div className="h-4 w-48 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}