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
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
  HomeIcon,
  UserGroupIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function Allocations() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [feeConfigs, setFeeConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // View state
  const [view, setView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // Automatically switch to student view when searching
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setView("student");
    }
  }, [searchTerm]);

  // Allocation form state
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBed, setSelectedBed] = useState("");
  const [customFee, setCustomFee] = useState("");
  const [customDueDay, setCustomDueDay] = useState("");
  const [useCustomFee, setUseCustomFee] = useState(false);
  
  // Auto-allocate state - UPDATED with custom fee
  const [showAutoAllocate, setShowAutoAllocate] = useState(false);
  const [autoAllocateStudent, setAutoAllocateStudent] = useState("");
  const [autoAllocateRoom, setAutoAllocateRoom] = useState("");
  const [autoCustomFee, setAutoCustomFee] = useState("");
  const [autoCustomDueDay, setAutoCustomDueDay] = useState("");
  const [useAutoCustomFee, setUseAutoCustomFee] = useState(false);

  // History modal
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStudent, setHistoryStudent] = useState(null);

  // Transfer modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStudent, setTransferStudent] = useState(null);
  const [transferFromRoom, setTransferFromRoom] = useState(null);
  const [transferToRoom, setTransferToRoom] = useState("");

  // Fee info modal
  const [showFeeInfo, setShowFeeInfo] = useState(false);
  const [feeInfo, setFeeInfo] = useState(null);

  const hostelId = localStorage.getItem("selectedHostelId");
  
  // Error/Success dialogs
  const [errorDialog, setErrorDialog] = useState({ show: false, title: "", message: "" });
  const [successDialog, setSuccessDialog] = useState({ show: false, title: "", message: "" });

  useEffect(() => {
    loadAllData();
  }, []);

  const showError = (title, message) => {
    setErrorDialog({ show: true, title: title || "Error", message: message || "An unexpected error occurred" });
  };

  const showSuccess = (title, message) => {
    setSuccessDialog({ show: true, title: title || "Success", message: message });
  };

  const closeErrorDialog = () => setErrorDialog(prev => ({ ...prev, show: false }));
  const closeSuccessDialog = () => setSuccessDialog(prev => ({ ...prev, show: false }));

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [roomsRes, studentsRes, allocationsRes, feeConfigsRes] = await Promise.all([
        api.get("/api/admin/rooms", { params: { hostelId } }),
        api.get("/api/admin/students", { params: { hostelId } }),
        api.get("/api/admin/allocations/history", { params: { hostelId } }),
        api.get(`/api/admin/fee-config/hostel/${hostelId}/rooms`),
      ]);
      
      setRooms(roomsRes.data);
      setStudents(studentsRes.data);
      setAllocations(allocationsRes.data.filter(a => a.active));
      
      // Create a map of room fee configs for quick lookup
      const configMap = {};
      feeConfigsRes.data.forEach(config => {
        if (config.room) {
          configMap[config.room.id] = config;
        }
      });
      setFeeConfigs(configMap);
    } catch (err) {
      console.error("Failed to load data", err);
      showError("Failed to Load Data", err.response?.data?.message || "Unable to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoomAllocations = (roomId) => {
    return allocations.filter(a => a.room.id === roomId);
  };

  const getStudentAllocation = (studentId) => {
    return allocations.find(a => a.student.id === studentId);
  };

  const getAvailableBeds = (room) => {
    const occupied = getRoomAllocations(room.id).length;
    return room.capacity - occupied;
  };

  const getAvailableBedsInRoom = (roomId) => {
    const room = rooms.find(r => r.id === parseInt(roomId));
    if (!room) return 0;
    const occupied = getRoomAllocations(roomId).length;
    return room.capacity - occupied;
  };

  const getRoomFeeInfo = (roomId) => {
    const config = feeConfigs[roomId];
    if (config) {
      return {
        amount: config.monthlyAmount,
        dueDay: config.dueDay,
        source: "Room Specific"
      };
    }
    return null;
  };

  const handleAllocate = async (e) => {
    e?.preventDefault();
    
    if (!selectedStudent || !selectedRoom || !selectedBed) {
      showError("Invalid Selection", "Please select a student, room, and bed number.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        studentId: parseInt(selectedStudent),
        roomId: parseInt(selectedRoom),
        bedNumber: parseInt(selectedBed),
        customFeeAmount: useCustomFee && customFee ? parseFloat(customFee) : null,
        customDueDay: useCustomFee && customDueDay ? parseInt(customDueDay) : null
      };

      const response = await api.post("/api/admin/allocations/allocate", payload, {
        params: { hostelId }
      });

      await loadAllData();
      
      // Show fee info in success message
      if (response.data.fee) {
        setFeeInfo({
          amount: response.data.fee.amount,
          dueDate: response.data.fee.dueDate,
          source: response.data.feeSource
        });
        setShowFeeInfo(true);
      }
      
      resetAllocationForm();
      setShowAllocationModal(false);
      showSuccess("Allocation Successful", response.data.message || "Student has been successfully allocated.");
    } catch (err) {
      console.error("Allocation failed", err);
      showError("Allocation Failed", err.response?.data?.message || "Unable to allocate student.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoAllocate = async () => {
    if (!autoAllocateStudent || !autoAllocateRoom) {
      showError("Invalid Selection", "Please select both a student and a room.");
      return;
    }

    setActionLoading(true);
    try {
      const room = rooms.find(r => r.id === parseInt(autoAllocateRoom));
      if (!room) {
        showError("Room Not Found", "Selected room not found.");
        return;
      }

      const payload = {
        studentId: parseInt(autoAllocateStudent),
        roomId: parseInt(autoAllocateRoom),
        customFeeAmount: useAutoCustomFee && autoCustomFee ? parseFloat(autoCustomFee) : null,
        customDueDay: useAutoCustomFee && autoCustomDueDay ? parseInt(autoCustomDueDay) : null
      };

      const response = await api.post("/api/admin/allocations/auto-allocate", payload, {
        params: { hostelId }
      });

      await loadAllData();
      setShowAutoAllocate(false);
      setAutoAllocateStudent("");
      setAutoAllocateRoom("");
      setAutoCustomFee("");
      setAutoCustomDueDay("");
      setUseAutoCustomFee(false);
      
      if (response.data.fee) {
        setFeeInfo({
          amount: response.data.fee.amount,
          dueDate: response.data.fee.dueDate,
          source: response.data.feeSource
        });
        setShowFeeInfo(true);
      }
      
      showSuccess("Auto-Allocation Successful", `Student has been allocated to Room ${room.roomNumber}.`);
    } catch (err) {
      showError("Auto-Allocation Failed", err.response?.data?.message || "Unable to auto-allocate student.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeallocate = async (allocationId) => {
    if (!window.confirm("Are you sure you want to deallocate this student? This will mark the allocation as inactive.")) return;

    try {
      await api.post(`/api/admin/allocations/deallocate/${allocationId}`);
      await loadAllData();
      showSuccess("Deallocation Successful", "Student has been successfully deallocated.");
    } catch (err) {
      showError("Deallocation Failed", err.response?.data?.message || "Unable to deallocate student.");
    }
  };

  const handleTransfer = async () => {
    if (!transferStudent || !transferToRoom) {
      showError("Invalid Selection", "Please select a destination room.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        studentId: transferStudent.id,
        fromRoomId: transferFromRoom,
        toRoomId: parseInt(transferToRoom)
      };

      await api.post(`/api/admin/allocations/transfer/student/${transferStudent.id}/room/${transferToRoom}`, {}, {
        params: { hostelId }
      });

      await loadAllData();
      setShowTransferModal(false);
      setTransferStudent(null);
      setTransferToRoom("");
      showSuccess("Transfer Successful", "Student has been transferred to new room.");
    } catch (err) {
      showError("Transfer Failed", err.response?.data?.message || "Unable to transfer student.");
    } finally {
      setActionLoading(false);
    }
  };

  const openTransferModal = (student, fromRoomId) => {
    setTransferStudent(student);
    setTransferFromRoom(fromRoomId);
    setShowTransferModal(true);
  };

  const openHistory = async (student) => {
    try {
      const res = await api.get(`/api/admin/allocations/student/${student.id}/history`, { params: { hostelId } });
      setHistory(res.data);
      setHistoryStudent(student);
      setShowHistory(true);
    } catch (err) {
      showError("Failed to Load History", err.response?.data?.message || "Unable to load allocation history.");
    }
  };

  const resetAllocationForm = () => {
    setSelectedStudent("");
    setSelectedRoom("");
    setSelectedBed("");
    setCustomFee("");
    setCustomDueDay("");
    setUseCustomFee(false);
  };

  const getAvailableBedsList = (roomId) => {
    const room = rooms.find(r => r.id === parseInt(roomId));
    if (!room) return [];
    
    const occupied = getRoomAllocations(roomId).map(a => a.bedNumber);
    const available = [];
    for (let i = 1; i <= room.capacity; i++) {
      if (!occupied.includes(i)) {
        available.push(i);
      }
    }
    return available;
  };

  // Filter students for search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cnic.includes(searchTerm)
  );

  // Stats
  const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0);
  const occupiedBeds = allocations.length;
  const availableBeds = totalBeds - occupiedBeds;
  const fullRooms = rooms.filter(r => getAvailableBeds(r) === 0).length;

  if (loading) return <AllocationsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Allocations</h1>
          <p className="text-gray-600 mt-1">Manage student accommodations and fee assignments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAllData}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              resetAllocationForm();
              setShowAllocationModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            New Allocation
          </button>
          <button
            onClick={() => {
              setAutoAllocateStudent("");
              setAutoAllocateRoom("");
              setAutoCustomFee("");
              setAutoCustomDueDay("");
              setUseAutoCustomFee(false);
              setShowAutoAllocate(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
          >
            <SparklesIcon className="h-4 w-4" />
            Auto-Allocate
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Beds</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalBeds}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Occupied Beds</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{occupiedBeds}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Available Beds</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{availableBeds}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <HomeIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Full Rooms</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{fullRooms}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle & Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or CNIC... (Automatically switches to Student View)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setView("grid")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === "grid" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === "list" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView("student")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === "student" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Student View
            </button>
          </div>
        </div>
        {searchTerm && (
          <p className="text-xs text-blue-600 mt-2">
            🔍 Showing {filteredStudents.length} search results in Student View
          </p>
        )}
      </div>

      {/* Main Content */}
      {view === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => {
            const roomAllocations = getRoomAllocations(room.id);
            const available = getAvailableBeds(room);
            const feeInfo = getRoomFeeInfo(room.id);
            
            return (
              <div key={room.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`p-4 border-b ${
                  available === 0 ? 'bg-red-50' : available < room.capacity ? 'bg-yellow-50' : 'bg-green-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {room.block} - Room {room.roomNumber}
                      </h3>
                      {feeInfo && (
                        <p className="text-xs text-gray-600 mt-1">
                          Fee: Rs {feeInfo.amount.toLocaleString()} (Due: Day {feeInfo.dueDay})
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      available === 0 ? 'bg-red-100 text-red-800' : 
                      available < room.capacity ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {available}/{room.capacity} beds
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[...Array(room.capacity)].map((_, i) => {
                      const bedNum = i + 1;
                      const allocation = roomAllocations.find(a => a.bedNumber === bedNum);
                      
                      return (
                        <div
                          key={bedNum}
                          className={`p-3 rounded-lg border ${
                            allocation 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-500">Bed {bedNum}</span>
                            {allocation ? (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                Occupied
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                                Free
                              </span>
                            )}
                          </div>
                          {allocation && (
                            <div className="text-xs">
                              <p className="font-medium text-gray-900 truncate">{allocation.student.name}</p>
                              <p className="text-gray-500 text-xs truncate">{allocation.student.cnic}</p>
                              <div className="flex gap-1 mt-1">
                                <button
                                  onClick={() => openHistory(allocation.student)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="View History"
                                >
                                  <ClockIcon className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => openTransferModal(allocation.student, room.id)}
                                  className="text-purple-600 hover:text-purple-800"
                                  title="Transfer"
                                >
                                  <ArrowsRightLeftIcon className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeallocate(allocation.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Deallocate"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "list" && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Bed</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">CNIC</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Monthly Fee</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allocations.map(allocation => {
                  const feeInfo = getRoomFeeInfo(allocation.room.id);
                  
                  return (
                    <tr key={allocation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {allocation.room.block} - {allocation.room.roomNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          Bed {allocation.bedNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{allocation.student.name}</td>
                      <td className="px-6 py-4 text-gray-700">{allocation.student.cnic}</td>
                      <td className="px-6 py-4">
                        {feeInfo ? (
                          <span className="font-semibold text-gray-900">
                            Rs {feeInfo.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openHistory(allocation.student)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View History"
                          >
                            <ClockIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openTransferModal(allocation.student, allocation.room.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Transfer Room"
                          >
                            <ArrowsRightLeftIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeallocate(allocation.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deallocate"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {allocations.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium">No allocations found</p>
                        <p className="text-gray-500 text-sm mt-1">Start by allocating a student to a room</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "student" && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">CNIC</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Allocation Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Monthly Fee</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map(student => {
                  const allocation = getStudentAllocation(student.id);
                  const feeInfo = allocation ? getRoomFeeInfo(allocation.room.id) : null;
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 text-gray-700">{student.cnic}</td>
                      <td className="px-6 py-4">
                        {allocation ? (
                          <div>
                            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Allocated
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {allocation.room.block} - Room {allocation.room.roomNumber}, Bed {allocation.bedNumber}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            Not Allocated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {feeInfo ? (
                          <span className="font-semibold text-gray-900">
                            Rs {feeInfo.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {allocation ? (
                            <>
                              <button
                                onClick={() => openHistory(student)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View History"
                              >
                                <ClockIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openTransferModal(student, allocation.room.id)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Transfer Room"
                              >
                                <ArrowsRightLeftIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeallocate(allocation.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Deallocate"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                resetAllocationForm();
                                setSelectedStudent(student.id.toString());
                                setShowAllocationModal(true);
                              }}
                              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                              Allocate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && searchTerm && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <UserIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium">No students found matching "{searchTerm}"</p>
                        <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Allocate Student to Room</h2>
                <button 
                  onClick={() => {
                    setShowAllocationModal(false);
                    resetAllocationForm();
                  }} 
                  className="text-white hover:text-gray-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAllocate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a student...</option>
                  {students
                    .filter(s => !getStudentAllocation(s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.cnic})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                <select
                  value={selectedRoom}
                  onChange={(e) => {
                    setSelectedRoom(e.target.value);
                    setSelectedBed("");
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a room...</option>
                  {rooms.filter(r => getAvailableBeds(r) > 0).map(r => {
                    const feeInfo = getRoomFeeInfo(r.id);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.block} - {r.roomNumber} ({getAvailableBeds(r)} beds available)
                        {feeInfo && ` - Rs ${feeInfo.amount.toLocaleString()}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedRoom && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Bed Number</label>
                  <select
                    value={selectedBed}
                    onChange={(e) => setSelectedBed(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a bed...</option>
                    {getAvailableBedsList(selectedRoom).map(bedNum => (
                      <option key={bedNum} value={bedNum}>Bed {bedNum}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Fee Option */}
              <div className="pt-4 border-t border-gray-200">
                {!useCustomFee ? (
                  <button
                    type="button"
                    onClick={() => setUseCustomFee(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium transition-colors"
                  >
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Set Custom Fee for this Student
                  </button>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">Custom Fee Settings</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomFee(false);
                          setCustomFee("");
                          setCustomDueDay("");
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Amount (Rs)
                        </label>
                        <input
                          type="number"
                          value={customFee}
                          onChange={(e) => setCustomFee(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          min="0"
                          step="100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Day (1-28)
                        </label>
                        <input
                          type="number"
                          value={customDueDay}
                          onChange={(e) => setCustomDueDay(e.target.value)}
                          placeholder="Default: 10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          min="1"
                          max="28"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Custom fee will override room-specific and default fee configurations.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAllocationModal(false);
                    resetAllocationForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudent || !selectedRoom || !selectedBed || actionLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? "Allocating..." : "Allocate Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-Allocate Modal - WITH CUSTOM FEE OPTION */}
      {showAutoAllocate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Auto-Allocate Student</h2>
                <button onClick={() => setShowAutoAllocate(false)} className="text-white hover:text-gray-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                <select
                  value={autoAllocateStudent}
                  onChange={(e) => setAutoAllocateStudent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a student...</option>
                  {students
                    .filter(s => !getStudentAllocation(s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.cnic})</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                <select
                  value={autoAllocateRoom}
                  onChange={(e) => setAutoAllocateRoom(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a room...</option>
                  {rooms.filter(r => getAvailableBeds(r) > 0).map(r => {
                    const feeInfo = getRoomFeeInfo(r.id);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.block} - {r.roomNumber} ({getAvailableBeds(r)} beds available)
                        {feeInfo && ` - Rs ${feeInfo.amount.toLocaleString()}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Custom Fee Option for Auto-Allocate */}
              <div className="pt-4 border-t border-gray-200">
                {!useAutoCustomFee ? (
                  <button
                    type="button"
                    onClick={() => setUseAutoCustomFee(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg font-medium transition-colors"
                  >
                    <CurrencyDollarIcon className="h-4 w-4" />
                    Set Custom Fee for Auto-Allocation
                  </button>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">Custom Fee Settings</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setUseAutoCustomFee(false);
                          setAutoCustomFee("");
                          setAutoCustomDueDay("");
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Amount (Rs)
                        </label>
                        <input
                          type="number"
                          value={autoCustomFee}
                          onChange={(e) => setAutoCustomFee(e.target.value)}
                          placeholder="Enter amount"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          min="0"
                          step="100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Day (1-28)
                        </label>
                        <input
                          type="number"
                          value={autoCustomDueDay}
                          onChange={(e) => setAutoCustomDueDay(e.target.value)}
                          placeholder="Default: 10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                          min="1"
                          max="28"
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Custom fee will override room-specific and default fee configurations.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 flex items-start gap-2">
                  <InformationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>
                    The student will be automatically allocated to the first available bed in the selected room.
                    {autoAllocateRoom && getRoomFeeInfo(parseInt(autoAllocateRoom)) && !useAutoCustomFee && (
                      <span className="block mt-1 font-medium">
                        Default Fee: Rs {getRoomFeeInfo(parseInt(autoAllocateRoom)).amount.toLocaleString()} (Due: Day {getRoomFeeInfo(parseInt(autoAllocateRoom)).dueDay})
                      </span>
                    )}
                    {useAutoCustomFee && autoCustomFee && (
                      <span className="block mt-1 font-medium">
                        Custom Fee: Rs {parseFloat(autoCustomFee).toLocaleString()} {autoCustomDueDay && `(Due: Day ${autoCustomDueDay})`}
                      </span>
                    )}
                  </span>
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAutoAllocate(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAutoAllocate}
                  disabled={!autoAllocateStudent || !autoAllocateRoom || actionLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? "Allocating..." : "Auto-Allocate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && transferStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Transfer Student</h2>
                <button onClick={() => setShowTransferModal(false)} className="text-white hover:text-gray-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Student: <span className="font-semibold">{transferStudent.name}</span></p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Destination Room</label>
                <select
                  value={transferToRoom}
                  onChange={(e) => setTransferToRoom(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Choose a room...</option>
                  {rooms.filter(r => r.id !== transferFromRoom && getAvailableBeds(r) > 0).map(r => {
                    const feeInfo = getRoomFeeInfo(r.id);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.block} - {r.roomNumber} ({getAvailableBeds(r)} beds available)
                        {feeInfo && ` - Rs ${feeInfo.amount.toLocaleString()}`}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-800">
                  <InformationCircleIcon className="h-4 w-4 inline mr-1" />
                  Current allocation will be deactivated and new allocation will be created.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={!transferToRoom || actionLoading}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {actionLoading ? "Transferring..." : "Transfer Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fee Info Modal */}
      {showFeeInfo && feeInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Fee Generated</h2>
                <button onClick={() => setShowFeeInfo(false)} className="text-white hover:text-gray-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircleIcon className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-center mb-4">Fee Details</h3>
              
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-gray-900">Rs {feeInfo.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium text-gray-900">{new Date(feeInfo.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee Source:</span>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    {feeInfo.source}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                The fee has been automatically generated for this student.
              </p>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowFeeInfo(false)}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && historyStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Allocation History - {historyStudent.name}
                </h2>
                <button onClick={() => setShowHistory(false)} className="text-white hover:text-gray-200">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No allocation history found for this student.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Room</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Bed</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Allocated At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {history.map(h => (
                      <tr key={h.id}>
                        <td className="px-4 py-3">{h.room.block} - {h.room.roomNumber}</td>
                        <td className="px-4 py-3">Bed {h.bedNumber}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            h.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {h.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(h.allocatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowHistory(false)}
                  className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
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
              <p className="text-gray-700 mb-6">{errorDialog.message}</p>
              <div className="flex justify-end">
                <button onClick={closeErrorDialog} className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg">
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
              <p className="text-gray-700 mb-6">{successDialog.message}</p>
              <div className="flex justify-end">
                <button onClick={closeSuccessDialog} className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg">
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
      <div className="flex justify-between">
        <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
      </div>
      <div className="h-12 bg-gray-200 rounded-xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>)}
      </div>
    </div>
  );
}