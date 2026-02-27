import { useEffect, useState, memo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BellSnoozeIcon,
  BuildingOfficeIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // form state
  const [block, setBlock] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [editingRoomId, setEditingRoomId] = useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    const hostelId = localStorage.getItem("selectedHostelId");
    try {
      const res = await api.get("/api/admin/rooms", {
        params: {hostelId}
      });

      // Fetch status for each room
      const roomsWithStatus = await Promise.all(
        res.data.map(async (room) => {
          const status = await api.get(`/api/admin/rooms/${room.id}/status`,
            {params: {hostelId}}
          );
          return { ...room, status: status.data };
        })
      );

      setRooms(roomsWithStatus);
      setCurrentPage(1); // Reset to first page on refresh
    } catch (err) {
      console.error("Failed to fetch rooms", err);
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRooms = rooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rooms.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const openAddModal = () => {
    setEditingRoomId(null);
    setBlock("");
    setRoomNumber("");
    setCapacity("");
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoomId(room.id);
    setBlock(room.block);
    setRoomNumber(room.roomNumber);
    setCapacity(room.capacity);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!block || !roomNumber || !capacity) return;

    setActionLoading(true);
    const hostelId = localStorage.getItem("selectedHostelId");
    try {
      let res;
      if (editingRoomId) {
        res = await api.put(`/api/admin/rooms/${editingRoomId}`, {
          block,
          roomNumber,
          capacity: Number(capacity),
        });

        const status = await api.get(`/api/admin/rooms/${editingRoomId}/status`);

        setRooms(
          rooms.map((r) =>
            r.id === editingRoomId ? { ...res.data, status: status.data } : r
          )
        );
      } else {
        res = await api.post("/api/admin/rooms", {
          block,
          roomNumber,
          capacity: Number(capacity),
        },{
          params: {hostelId}
        });

        const status = await api.get(`/api/admin/rooms/${res.data.id}/status`, {params: {hostelId}});
        setRooms([...rooms, { ...res.data, status: status.data }]);
      }

      setShowModal(false);
    } catch (err) {
      console.error("Failed to save room", err);
      setError("Error saving room. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await api.delete(`/api/admin/rooms/${id}`);
      setRooms(rooms.filter((r) => r.id !== id));
      
      // Adjust current page if we deleted the last item on the page
      if (currentRooms.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      console.error("Failed to delete room", err);
      setError("Error deleting room. Please try again.");
    }
  };

  if (loading) return <RoomsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
          <p className="text-gray-600 mt-1">Manage all hostel rooms and their capacities</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Room
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{rooms.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {rooms.reduce((sum, room) => sum + room.capacity, 0)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <BellSnoozeIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Occupied Beds</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {rooms.reduce((sum, room) => sum + room.status.occupiedBeds, 0)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BellSnoozeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Available Beds</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {rooms.reduce((sum, room) => sum + room.status.availableBeds, 0)}
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <BellSnoozeIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Block</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Room Number</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Capacity</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Occupied</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Available</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentRooms.map((room) => (
                <tr 
                  key={room.id} 
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{room.block}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{room.roomNumber}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-900 font-semibold">{room.capacity}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-red-600 font-semibold">{room.status.occupiedBeds}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-green-600 font-semibold">{room.status.availableBeds}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(room)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors duration-200"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors duration-200"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                      <Link
                        to={`/admin/rooms/${room.id}/beds`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-colors duration-200"
                      >
                        <BellSnoozeIcon className="h-4 w-4" />
                        Beds
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {rooms.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, rooms.length)}
                </span>{" "}
                of <span className="font-medium">{rooms.length}</span> rooms
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => paginate(totalPages)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={fetchRooms}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-200"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh Rooms
        </button>
        
        {rooms.length > 0 && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">{rooms.length}</span> rooms total
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <RoomModal
          editingRoomId={editingRoomId}
          block={block}
          setBlock={setBlock}
          roomNumber={roomNumber}
          setRoomNumber={setRoomNumber}
          capacity={capacity}
          setCapacity={setCapacity}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}

const RoomModal = memo(
  ({ editingRoomId, block, setBlock, roomNumber, setRoomNumber, capacity, setCapacity, onClose, onSubmit, actionLoading }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {editingRoomId ? "Edit Room" : "Add New Room"}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Block
            </label>
            <input
              type="text"
              placeholder="e.g., A, B, C"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={actionLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              placeholder="e.g., 101, 102"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={actionLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity (Beds)
            </label>
            <input
              type="number"
              placeholder="e.g., 2, 3, 4"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={actionLoading}
            />
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
              disabled={actionLoading}
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : editingRoomId ? "Update Room" : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
);

function RoomsSkeleton() {
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
        <div className="p-4 border-b border-gray-200">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4 w-full">
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}