import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext"; // Add this import
import {
  BanknotesIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  XMarkIcon,
  UserCircleIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

export default function FeesPage() {
  const { role } = useAuth(); // Get user role
  const hostelId = localStorage.getItem("selectedHostelId");

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  
  // Search and filter state
  const [searchCnic, setSearchCnic] = useState("");
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("");

  // Loading states for actions
  const [downloadingId, setDownloadingId] = useState(null);
  const [printingId, setPrintingId] = useState(null);
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form state for add modal
  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Form state for edit modal
  const [editStudentId, setEditStudentId] = useState("");
  const [editMonth, setEditMonth] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  // Alert state
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  const fetchData = async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([
        api.get("/api/admin/fee", { params: { hostelId } }),
        api.get("/api/admin/students", { params: { hostelId } }),
      ]);

      setFees(feesRes.data);
      setStudents(studentsRes.data);
    } catch (e) {
      console.error("Failed to load fees", e);
      showAlert("error", "Failed to load fees. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setStudentId("");
    setMonth("");
    setAmount("");
    setDueDate("");
    setShowModal(true);
  };

  const openEditModal = (fee) => {
    setEditingFee(fee);
    setEditStudentId(fee.student.id.toString());
    setEditMonth(fee.month);
    setEditAmount(fee.amount.toString());
    setEditDueDate(fee.dueDate);
    setShowEditModal(true);
  };

  const addFee = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "/api/admin/fee",
        {
          student: { id: parseInt(studentId) },
          month,
          amount: parseFloat(amount),
          dueDate,
          status: "UNPAID"
        },
        { params: { hostelId } }
      );
      setFees([...fees, res.data]);
      setShowModal(false);
      showAlert("success", "Fee added successfully!");
    } catch (e) {
      console.error("Failed to add fee", e);
      showAlert("error", e.response?.data?.message || "Failed to add fee");
    }
  };

  const editFee = async (e) => {
    e.preventDefault();
    if (!editingFee) return;
    
    setEditingId(editingFee.id);
    try {
      const res = await api.put(
        `/api/admin/fee/${editingFee.id}`,
        {
          student: { id: parseInt(editStudentId) },
          month: editMonth,
          amount: parseFloat(editAmount),
          dueDate: editDueDate,
        },
        { params: { hostelId } }
      );
      
      setFees(fees.map(f => f.id === editingFee.id ? res.data : f));
      setShowEditModal(false);
      setEditingFee(null);
      showAlert("success", "Fee updated successfully!");
    } catch (e) {
      console.error("Failed to edit fee", e);
      showAlert("error", e.response?.data?.message || "Failed to update fee");
    } finally {
      setEditingId(null);
    }
  };

  const markPaid = async (feeId) => {
    setMarkingPaidId(feeId);
    try {
      const res = await api.put(`/api/admin/fee/${feeId}/pay`);
      setFees(fees.map(f => (f.id === feeId ? res.data : f)));
      showAlert("success", "Fee marked as paid successfully!");
    } catch (e) {
      console.error("Failed to mark as paid", e);
      showAlert("error", e.response?.data?.message || "Failed to mark as paid");
    } finally {
      setMarkingPaidId(null);
    }
  };

  const downloadReceipt = async (feeId) => {
    setDownloadingId(feeId);
    try {
      const res = await api.get(`/api/admin/fee/${feeId}/receipt`, {
        params: {hostelId}, 
        responseType: "blob" 
      });
      
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Fee-Receipt-${feeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      showAlert("success", "Receipt downloaded successfully!");
    } catch (error) {
      console.error("Failed to download receipt", error);
      showAlert("error", "Failed to download receipt. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const printReceipt = async (feeId) => {
    setPrintingId(feeId);
    try {
      const res = await api.get(`/api/admin/fee/${feeId}/receipt`, { 
        params: {hostelId},
        responseType: "blob" 
      });
      
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.focus();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      } else {
        showAlert("error", "Pop-up blocked! Please allow pop-ups to print receipts.");
      }
    } catch (error) {
      console.error("Failed to print receipt", error);
      showAlert("error", "Failed to print receipt. Please try again.");
    } finally {
      setPrintingId(null);
    }
  };

  const deleteFee = async (feeId) => {
    if (!window.confirm("Are you sure you want to delete this fee record?")) return;
    
    setDeletingId(feeId);
    try {
      await api.delete(`/api/admin/fee/${feeId}`);
      setFees(fees.filter(f => f.id !== feeId));
      showAlert("success", "Fee deleted successfully!");
    } catch (e) {
      console.error("Failed to delete fee", e);
      showAlert("error", e.response?.data?.message || "Failed to delete fee");
    } finally {
      setDeletingId(null);
    }
  };

  // Get unique months for filter
  const uniqueMonths = [...new Set(fees.map(f => f.month))].sort().reverse();

  // Filter fees
  const filteredFees = fees.filter(f => {
    const matchesCnic = searchCnic 
      ? f.student.cnic?.toLowerCase().includes(searchCnic.toLowerCase())
      : true;
    const matchesName = searchName
      ? f.student.name?.toLowerCase().includes(searchName.toLowerCase())
      : true;
    const matchesStatus = statusFilter !== "ALL"
      ? f.status === statusFilter
      : true;
    const matchesMonth = monthFilter
      ? f.month === monthFilter
      : true;
    return matchesCnic && matchesName && matchesStatus && matchesMonth;
  });

  // Statistics
  const totalFees = fees.length;
  const paidFees = fees.filter(f => f.status === "PAID");
  const unpaidFees = fees.filter(f => f.status === "UNPAID");
  const totalCollected = paidFees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPending = unpaidFees.reduce((sum, fee) => sum + fee.amount, 0);
  const overdueFees = unpaidFees.filter(f => new Date(f.dueDate) < new Date()).length;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchCnic("");
    setSearchName("");
    setStatusFilter("ALL");
    setMonthFilter("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg ${
          alert.type === "success" 
            ? "bg-green-100 border border-green-400 text-green-800" 
            : "bg-red-100 border border-red-400 text-red-800"
        }`}>
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">Manage student fee records and payments</p>
        </div>
        
        {/* Add New Fee button - Available to both Admin and Staff */}
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Fee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Fees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalFees}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Paid Fees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{paidFees.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Unpaid Fees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{unpaidFees.length}</p>
              {overdueFees > 0 && (
                <p className="text-xs text-red-600 mt-1">{overdueFees} overdue</p>
              )}
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Collected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                Rs {totalCollected.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DocumentArrowDownIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search CNIC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by CNIC
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter CNIC"
                value={searchCnic}
                onChange={(e) => setSearchCnic(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
          
          {/* Search Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Student Name
            </label>
            <div className="relative">
              <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter student name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Month
            </label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">All Months</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchCnic || searchName || statusFilter !== "ALL" || monthFilter) && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredFees.length} of {fees.length} fee records
        </div>

        {/* Fees Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Month</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{fee.student.name}</div>
                        <div className="text-sm text-gray-500">CNIC: {fee.student.cnic}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{fee.month}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        Rs {fee.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        {formatDate(fee.dueDate)}
                      </div>
                      {fee.status === "UNPAID" && new Date(fee.dueDate) < new Date() && (
                        <span className="text-xs text-red-600 mt-1 block">Overdue</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fee.paymentDate ? (
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4 text-green-500" />
                          {formatDate(fee.paymentDate)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not paid yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        fee.status === "PAID"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {fee.status === "PAID" ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Paid
                          </>
                        ) : (
                          "Unpaid"
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Edit button - available for all roles */}
                        <button
                          onClick={() => openEditModal(fee)}
                          disabled={editingId === fee.id}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit Fee"
                        >
                          {editingId === fee.id ? (
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          ) : (
                            <PencilIcon className="h-4 w-4" />
                          )}
                          Edit
                        </button>
                        
                        {fee.status !== "PAID" ? (
                          <>
                            <button
                              onClick={() => markPaid(fee.id)}
                              disabled={markingPaidId === fee.id}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Mark as Paid"
                            >
                              {markingPaidId === fee.id ? (
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircleIcon className="h-4 w-4" />
                              )}
                              Mark Paid
                            </button>
                            
                            {/* Delete button - Admin only */}
                            {role === 'ADMIN' && (
                              <button
                                onClick={() => deleteFee(fee.id)}
                                disabled={deletingId === fee.id}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Fee Record"
                              >
                                {deletingId === fee.id ? (
                                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                  <TrashIcon className="h-4 w-4" />
                                )}
                                Delete
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => printReceipt(fee.id)}
                              disabled={printingId === fee.id}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Print Receipt"
                            >
                              {printingId === fee.id ? (
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                              ) : (
                                <PrinterIcon className="h-4 w-4" />
                              )}
                              Print
                            </button>
                            
                            <button
                              onClick={() => downloadReceipt(fee.id)}
                              disabled={downloadingId === fee.id}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Download Receipt"
                            >
                              {downloadingId === fee.id ? (
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                              ) : (
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              )}
                              Download
                            </button>
                            
                            {/* Delete button for paid fees - Admin only */}
                            {role === 'ADMIN' && (
                              <button
                                onClick={() => deleteFee(fee.id)}
                                disabled={deletingId === fee.id}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Fee Record"
                              >
                                {deletingId === fee.id ? (
                                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                  <TrashIcon className="h-4 w-4" />
                                )}
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <BanknotesIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No fees found</h3>
                      <p className="text-gray-500">
                        {searchCnic || searchName || statusFilter !== "ALL" || monthFilter
                          ? "Try adjusting your search or filters"
                          : "No fee records available. Add your first fee record."}
                      </p>
                      {(searchCnic || searchName || statusFilter !== "ALL" || monthFilter) && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fee Modal - Available to both Admin and Staff */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PlusIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add New Fee</h2>
                    <p className="text-gray-600 text-sm">Create a new fee record for student</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={addFee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student *
                  </label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    <option value="">Choose a student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - CNIC: {s.cnic}
                      </option>
                    ))}
                  </select>
                  {students.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No active students available. Please add students first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Rs) *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-medium"
                  >
                    Add Fee Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fee Modal - Available for all roles */}
      {showEditModal && editingFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PencilIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Fee</h2>
                    <p className="text-gray-600 text-sm">Update fee record</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingFee(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={editFee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student *
                  </label>
                  <select
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    <option value="">Choose a student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - CNIC: {s.cnic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <input
                    type="month"
                    value={editMonth}
                    onChange={(e) => setEditMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (Rs) *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingFee(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editingId === editingFee.id}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-medium disabled:opacity-50"
                  >
                    {editingId === editingFee.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Updating...
                      </span>
                    ) : (
                      'Update Fee'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}