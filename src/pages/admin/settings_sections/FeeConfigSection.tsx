import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { 
  CalendarIcon, 
  CurrencyRupeeIcon, 
  CheckCircleIcon,
  BuildingOfficeIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  HomeIcon
} from "@heroicons/react/24/outline";

export default function FeeConfigSection() {
  const hostelId = localStorage.getItem("selectedHostelId");

  // State for default config
  const [defaultConfig, setDefaultConfig] = useState(null);
  const [defaultAmount, setDefaultAmount] = useState("");
  const [defaultDueDay, setDefaultDueDay] = useState("");
  
  // State for room-specific configs
  const [rooms, setRooms] = useState([]);
  const [roomConfigs, setRoomConfigs] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomAmount, setRoomAmount] = useState("");
  const [roomDueDay, setRoomDueDay] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const loadData = async () => {
    try {
      // Load default config
      const defaultRes = await api.get("/api/admin/fee-config/active", {
        params: { hostelId },
      });
      setDefaultConfig(defaultRes.data);

      // Load rooms
      const roomsRes = await api.get("/api/admin/rooms", {
        params: { hostelId },
      });
      setRooms(roomsRes.data);

      // Load room-specific configs
      const roomConfigsRes = await api.get(`/api/admin/fee-config/hostel/${hostelId}/rooms`);
      setRoomConfigs(roomConfigsRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveDefaultConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const response = await api.post("/api/admin/fee-config/default", null, {
        params: { 
          hostelId, 
          amount: defaultAmount, 
          dueDay: defaultDueDay 
        },
      });

      setSuccess("Default fee configuration updated successfully");
      setDefaultAmount("");
      setDefaultDueDay("");
      loadData();
    } catch (err) {
      console.error("Failed to update default fee config", err);
      alert(err.response?.data?.message || "Failed to save fee configuration");
    } finally {
      setLoading(false);
    }
  };

  const openRoomModal = (room = null, config = null) => {
    if (room) {
      setSelectedRoom(room);
      if (config) {
        setEditingRoom(config);
        setRoomAmount(config.monthlyAmount.toString());
        setRoomDueDay(config.dueDay.toString());
      } else {
        setEditingRoom(null);
        setRoomAmount("");
        setRoomDueDay("");
      }
      setShowRoomModal(true);
    }
  };

  const saveRoomConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      if (editingRoom) {
        // Update existing config - in your controller, POST will deactivate old and create new
        await api.post(`/api/admin/fee-config/room/${selectedRoom.id}`, null, {
          params: { 
            amount: roomAmount, 
            dueDay: roomDueDay 
          },
        });
        setSuccess(`Fee configuration for Room ${selectedRoom.roomNumber} updated successfully`);
      } else {
        // Create new config
        await api.post(`/api/admin/fee-config/room/${selectedRoom.id}`, null, {
          params: { 
            amount: roomAmount, 
            dueDay: roomDueDay 
          },
        });
        setSuccess(`Fee configuration for Room ${selectedRoom.roomNumber} created successfully`);
      }
      
      setRoomAmount("");
      setRoomDueDay("");
      setShowRoomModal(false);
      loadData();
    } catch (err) {
      console.error("Failed to save room fee config", err);
      alert(err.response?.data?.message || "Failed to save room fee configuration");
    } finally {
      setLoading(false);
    }
  };

  const getRoomConfig = (roomId) => {
    return roomConfigs.find(config => config.room?.id === roomId);
  };

  return (
    <div className="space-y-6">
      {/* Default Fee Configuration Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CurrencyRupeeIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Default Fee Configuration</h2>
          <span className="ml-2 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            Fallback for rooms without specific config
          </span>
        </div>

        {/* Current default fee */}
        {defaultConfig ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl p-5 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Default Monthly Fee</p>
                <p className="text-3xl font-bold text-gray-900">
                  Rs {defaultConfig.monthlyAmount.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-xs text-gray-600">
                    Due on day <span className="font-medium text-gray-800">{defaultConfig.dueDay}</span> of every month
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <p className="text-xs text-gray-600">
                    Effective from{" "}
                    <span className="font-medium text-gray-800">
                      {new Date(defaultConfig.effectiveFrom).toLocaleDateString("en-PK", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                Active
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 text-center">
            <p className="text-sm text-gray-500">No default fee configuration set yet.</p>
          </div>
        )}

        {/* Update default fee form */}
        <form onSubmit={saveDefaultConfig} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Default Monthly Fee Amount (Rs)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rs</span>
                <input
                  type="number"
                  value={defaultAmount}
                  onChange={(e) => setDefaultAmount(e.target.value)}
                  placeholder="Enter default fee"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                  min="0"
                  step="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Due Day (1-28)
              </label>
              <input
                type="number"
                min="1"
                max="28"
                value={defaultDueDay}
                onChange={(e) => setDefaultDueDay(e.target.value)}
                placeholder="Example: 10"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Default fee applies to rooms that don't have their own specific fee configuration.
          </p>

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Update Default Fee"}
          </button>
        </form>
      </div>

      {/* Room-Specific Fee Configuration Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BuildingOfficeIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Room-Specific Fee Configuration</h2>
          </div>
        </div>

        {/* Rooms Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.length > 0 ? (
                rooms.map((room) => {
                  const config = getRoomConfig(room.id);
                  return (
                    <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <HomeIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">Room {room.roomNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        Block {room.block || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {room.capacity} {room.capacity === 1 ? "bed" : "beds"}
                      </td>
                      {config ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                            Rs {config.monthlyAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            Day {config.dueDay}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Configured
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400 italic">
                            Using default
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-400 italic">
                            {defaultConfig ? `Day ${defaultConfig.dueDay}` : "Not set"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              Default
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openRoomModal(room, config)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-colors text-sm"
                        >
                          {config ? (
                            <>
                              <PencilIcon className="h-4 w-4" />
                              Edit
                            </>
                          ) : (
                            <>
                              <PlusIcon className="h-4 w-4" />
                              Configure
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No rooms found</p>
                    <p className="text-gray-500 text-sm mt-1">Add rooms first to configure fees</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room Fee Modal */}
      {showRoomModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <BuildingOfficeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingRoom ? "Edit Room Fee" : "Configure Room Fee"}
                    </h2>
                    <p className="text-purple-100 text-sm">
                      Room {selectedRoom.roomNumber} {selectedRoom.block ? `(Block ${selectedRoom.block})` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={saveRoomConfig} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Monthly Fee Amount (Rs)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rs</span>
                  <input
                    type="number"
                    value={roomAmount}
                    onChange={(e) => setRoomAmount(e.target.value)}
                    placeholder="Enter monthly fee"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                    required
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Due Day (1-28)
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={roomDueDay}
                  onChange={(e) => setRoomDueDay(e.target.value)}
                  placeholder="Example: 10"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Fee will be due on this day every month
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingRoom ? "Update Fee" : "Set Fee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}