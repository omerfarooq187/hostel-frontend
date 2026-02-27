import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  UsersIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ShoppingCartIcon,
  BuildingOfficeIcon,
  CalculatorIcon,
  CalendarIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ReportsPage() {
  const hostelId = localStorage.getItem("selectedHostelId");

  // Date state – default to current month
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch reports
  const fetchReports = async () => {
    if (!hostelId) return;
    setLoading(true);
    setError("");
    try {
      const [year, month] = selectedDate.split("-").map(Number);
      const res = await api.get("/api/admin/reports", {
        params: {
          hostelId,
          year,
          month,
        },
      });
      setReport(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to load reports", err);
      setError("Could not load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when date changes
  useEffect(() => {
    fetchReports();
  }, [selectedDate]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-blue-100 mt-1">
              Monthly financial summary and occupancy statistics
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Month picker */}
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="month"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Loading / Error / Content */}
      {loading && !report ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : report ? (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Students"
              value={report.totalStudents}
              icon={UsersIcon}
              color="bg-blue-600"
            />
            <StatCard
              title="Total Staff"
              value={report.totalStaff}
              icon={UserGroupIcon}
              color="bg-purple-600"
            />
            <StatCard
              title="Fees Collected"
              value={formatCurrency(report.totalFeeCollected)}
              icon={CurrencyRupeeIcon}
              color="bg-green-600"
              subValue="This month"
            />
            <StatCard
              title="Inventory Expense"
              value={formatCurrency(report.totalInventoryExpense)}
              icon={ShoppingCartIcon}
              color="bg-orange-600"
              subValue="This month"
            />
          </div>

          {/* Second row – financial summary (now 4 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
            <StatCard
              title="Salary Expense"
              value={formatCurrency(report.totalSalaryExpense)}
              icon={BuildingOfficeIcon}
              color="bg-indigo-600"
              subValue="This month"
            />
            <StatCard
              title="Total Expense"
              value={formatCurrency(report.totalExpense)}
              icon={CalculatorIcon}
              color="bg-red-600"
              subValue="Inventory + Salary"
            />
            <StatCard
              title="Expense Per Head"
              value={formatCurrency(report.expensePerHead)}
              icon={UserIcon}
              color="bg-amber-600"
              subValue="Per student"
            />
            <StatCard
              title="Net Profit / Loss"
              value={formatCurrency(report.netProfit)}
              icon={report.netProfit >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
              color={report.netProfit >= 0 ? "bg-emerald-600" : "bg-rose-600"}
              subValue={report.netProfit >= 0 ? "Profit" : "Loss"}
            />
          </div>

          {/* Third row – Other Expense card (single) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
            <StatCard
              title="Other Expense"
              value={formatCurrency(report.otherExpense || 0)}
              icon={BuildingOfficeIcon}
              color="bg-indigo-600"
              subValue="This month"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Bar Chart: Income vs Expenses vs Net Profit */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Income & Expense Comparison
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: "Fees Collected", value: report.totalFeeCollected },
                    { name: "Total Expenses", value: report.totalExpense },
                    { name: "Net Profit", value: report.netProfit },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `Rs ${value}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart: Expense Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Expense Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Inventory", value: report.totalInventoryExpense },
                      { name: "Salary", value: report.totalSalaryExpense },
                      { name: "Other", value: report.otherExpense || 0 },
                    ].filter((item) => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {report &&
                      [
                        { name: "Inventory", value: report.totalInventoryExpense },
                        { name: "Salary", value: report.totalSalaryExpense },
                        { name: "Other", value: report.otherExpense || 0 },
                      ]
                        .filter((item) => item.value > 0)
                        .map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              {report.totalExpense === 0 && (
                <p className="text-center text-gray-500 mt-4">No expenses recorded this month.</p>
              )}
            </div>
          </div>

          {/* Month summary text */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-600">
            <span className="font-medium">📊 Summary for </span>
            {new Date(selectedDate + "-01").toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          No report data available. Select a month to view.
        </div>
      )}
    </div>
  );
}