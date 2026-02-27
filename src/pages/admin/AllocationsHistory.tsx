import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  ClockIcon,
  BuildingOfficeIcon,
  UserIcon,
  BellSnoozeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

export default function AllocationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Error dialog state
  const [errorDialog, setErrorDialog] = useState({
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

  const closeErrorDialog = () => {
    setErrorDialog(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const hostelId = localStorage.getItem("selectedHostelId")
    try {
      const res = await api.get("/api/admin/allocations/history", {
        params: {hostelId}
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load allocation history", err);
      showError(
        "Failed to Load History",
        err.response?.data?.message || "Unable to load allocation history. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const activeAllocations = history.filter(a => a.active).length;
  const inactiveAllocations = history.filter(a => !a.active).length;
  const uniqueStudents = [...new Set(history.map(a => a.student.id))].length;
  const uniqueRooms = [...new Set(history.map(a => a.room.id))].length;

  if (loading) return <HistorySkeleton />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Allocation History</h1>
          <p className="text-gray-600 mt-1">Complete history of all room allocations and deallocations</p>
        </div>
        <button
          onClick={loadHistory}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh History
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{history.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Active Allocations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeAllocations}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Inactive Allocations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{inactiveAllocations}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Unique Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{uniqueStudents}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              Allocation History
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({history.length} total records)
              </span>
            </h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Student Information</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Room Details</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Bed Number</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 px-6 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="p-3 bg-gray-100 rounded-full mb-3">
                        <ClockIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No allocation history found</p>
                      <p className="text-gray-400 text-sm mt-1">Allocations will appear here once made</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((allocation) => (
                  <tr 
                    key={allocation.id} 
                    className={`hover:bg-gray-50 transition-colors duration-200 ${
                      allocation.active ? 'bg-green-50/50' : 'bg-red-50/50'
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          allocation.active ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <UserIcon className={`h-5 w-5 ${
                            allocation.active ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {allocation.student.name || allocation.student.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            CNIC: {allocation.student.cnic}
                          </div>
                          {allocation.student.user?.email && (
                            <div className="text-sm text-gray-500">
                              {allocation.student.user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {allocation.room.block} - {allocation.room.roomNumber}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Capacity: {allocation.room.capacity} beds
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <BellSnoozeIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="font-semibold text-gray-900">Bed {allocation.bedNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                        allocation.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {allocation.active ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-4 w-4" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      {history.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">History Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{history.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeAllocations}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{inactiveAllocations}</div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{uniqueRooms}</div>
              <div className="text-sm text-gray-600">Rooms Involved</div>
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
    </div>
  );
}

function HistorySkeleton() {
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

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="bg-gray-100 border border-gray-200 rounded-2xl p-6">
        <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="text-center">
              <div className="h-8 w-16 bg-gray-300 rounded mx-auto mb-2"></div>
              <div className="h-4 w-20 bg-gray-300 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}