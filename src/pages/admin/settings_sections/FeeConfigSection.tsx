import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { CalendarIcon, CurrencyRupeeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function FeeConfigSection() {
  const hostelId = localStorage.getItem("selectedHostelId");

  const [currentConfig, setCurrentConfig] = useState(null);
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const loadCurrentConfig = async () => {
    try {
      const res = await api.get("/api/admin/fee-config/active", {
        params: { hostelId },
      });
      setCurrentConfig(res.data);
    } catch (err) {
      console.error("Failed to load fee config", err);
    }
  };

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const saveConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await api.post("/api/admin/fee-config", null, {
        params: { hostelId, amount, dueDay },
      });

      setSuccess("Monthly fee updated successfully");
      setAmount("");
      setDueDay("");
      loadCurrentConfig();
    } catch (err) {
      console.error("Failed to update fee config", err);
      alert("Failed to save fee configuration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-100 rounded-lg">
          <CurrencyRupeeIcon className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Fee Configuration</h2>
      </div>

      {/* Current active fee */}
      {currentConfig ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Monthly Fee</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{currentConfig.monthlyAmount}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <p className="text-xs text-gray-600">
                  Effective from{" "}
                  <span className="font-medium text-gray-800">
                    {new Date(currentConfig.effectiveFrom).toLocaleDateString("en-IN", {
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
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-sm text-gray-500">No fee configuration set yet.</p>
        </div>
      )}

      {/* Update form */}
      <form onSubmit={saveConfig} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            New Monthly Fee Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter new monthly fee"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Fee Due Day (every month)
          </label>
          <input
            type="number"
            min="1"
            max="28"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder="Example: 10"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />
          <p className="text-xs text-gray-500 mt-1.5">
            Fee will be due on this day every month
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Update Fee"}
        </button>
      </form>
    </div>
  );
}