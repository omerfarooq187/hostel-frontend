import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
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
  PencilIcon,
} from "@heroicons/react/24/outline";

export default function FeesPage() {
  const { role } = useAuth();
  const hostelId = localStorage.getItem("selectedHostelId");

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  
  const [searchCnic, setSearchCnic] = useState("");
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [monthFilter, setMonthFilter] = useState(currentMonth);

  const [downloadingId, setDownloadingId] = useState(null);
  const [printingId, setPrintingId] = useState(null);
  const [markingPaidId, setMarkingPaidId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [editStudentId, setEditStudentId] = useState("");
  const [editMonth, setEditMonth] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [generating, setGenerating] = useState(false);
  const [roomNumbers, setRoomNumbers] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

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

  useEffect(() => {
    if (fees.length === 0) return;
    const studentIds = [...new Set(fees.map(fee => fee.student.id))];
    if (studentIds.length === 0) return;

    const fetchRoomNumbers = async () => {
      try {
        const response = await api.post("/api/admin/allocations/by-students", studentIds);
        const map = {};
        response.data.forEach(item => {
          map[item.studentId] = item.roomNumber || "-";
        });
        setRoomNumbers(map);
      } catch (error) {
        console.error("Failed to fetch room numbers", error);
        const fallbackMap = {};
        studentIds.forEach(id => { fallbackMap[id] = "-"; });
        setRoomNumbers(fallbackMap);
      }
    };
    fetchRoomNumbers();
  }, [fees]);

  const handleGenerateFees = async () => {
    if (!hostelId) {
      showAlert("error", "No hostel selected");
      return;
    }
    setGenerating(true);
    try {
      const response = await api.post(`/api/admin/fee/generate/hostel/${hostelId}`);
      const { feesGenerated } = response.data;
      showAlert("success", `Successfully generated ${feesGenerated} fee records for the current month.`);
      await fetchData();
      setMonthFilter(currentMonth);
    } catch (error) {
      console.error("Failed to generate fees:", error);
      const message = error.response?.data?.message || "Failed to generate fees. Please try again.";
      showAlert("error", message);
    } finally {
      setGenerating(false);
    }
  };

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

  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    const paidSoFar = fee.paidAmount || 0;
    const remaining = fee.amount - paidSoFar;
    setPaymentAmount(remaining.toString());
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedFee) return;
    
    const paidAmount = parseFloat(paymentAmount);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      showAlert("error", "Please enter a valid payment amount");
      return;
    }
    
    const remaining = selectedFee.amount - (selectedFee.paidAmount || 0);
    if (paidAmount > remaining) {
      showAlert("error", `Payment amount cannot exceed remaining amount: Rs ${remaining.toLocaleString()}`);
      return;
    }
    
    setProcessingPayment(true);
    try {
      const response = await api.put(`/api/admin/fee/${selectedFee.id}/pay-partial`, null, {
        params: { 
          paidAmount: paidAmount,
          hostelId: hostelId 
        }
      });
      
      setFees(fees.map(f => f.id === selectedFee.id ? response.data : f));
      setShowPaymentModal(false);
      setSelectedFee(null);
      setPaymentAmount("");
      
      if (paidAmount >= remaining) {
        showAlert("success", "Fee fully paid successfully!");
      } else {
        showAlert("success", `Payment of Rs ${paidAmount.toLocaleString()} recorded successfully! Remaining: Rs ${(remaining - paidAmount).toLocaleString()}`);
      }
    } catch (error) {
      console.error("Failed to process payment", error);
      showAlert("error", error.response?.data?.message || "Failed to process payment");
    } finally {
      setProcessingPayment(false);
    }
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
          status: "UNPAID",
          paidAmount: 0
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

  const uniqueMonths = useMemo(() => {
    const monthsFromFees = fees.map(f => f.month);
    const allMonths = [...new Set([...monthsFromFees, currentMonth])];
    return allMonths.sort().reverse();
  }, [fees, currentMonth]);

  const filteredFees = useMemo(() => {
    const result = fees.filter(f => {
      const matchesCnic = searchCnic 
        ? f.student.cnic?.toLowerCase().includes(searchCnic.toLowerCase())
        : true;
      const matchesName = searchName
        ? f.student.name?.toLowerCase().includes(searchName.toLowerCase())
        : true;
      const matchesStatus = statusFilter !== "ALL"
        ? f.status === statusFilter
        : true;
      const matchesMonth = f.month === monthFilter;
      return matchesCnic && matchesName && matchesStatus && matchesMonth;
    });
    return result;
  }, [fees, searchCnic, searchName, statusFilter, monthFilter]);

  const totalFees = filteredFees.length;
  const paidFees = filteredFees.filter(f => f.status === "PAID");
  const unpaidFees = filteredFees.filter(f => f.status === "UNPAID");
  const partialFees = filteredFees.filter(f => f.status === "PARTIAL");
  const totalCollected = filteredFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
  const overdueFees = unpaidFees.filter(f => new Date(f.dueDate) < new Date()).length;

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFees = filteredFees.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchCnic, searchName, statusFilter, monthFilter]);

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
    setMonthFilter(currentMonth);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">Manage student fee records and payments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateFees}
            disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {generating ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-4 w-4" />
                Generate Monthly Fees
              </>
            )}
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Add New Fee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Partial Paid Fees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{partialFees.length}</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by CNIC</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter CNIC"
                value={searchCnic}
                onChange={(e) => setSearchCnic(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Student Name</label>
            <div className="relative">
              <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter student name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Month</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-sm"
            >
              {uniqueMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchCnic || searchName || statusFilter !== "ALL" || monthFilter !== currentMonth) && (
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          {monthFilter === "ALL" ? (
            `Showing ${filteredFees.length} of ${fees.length} total fee records`
          ) : (
            `Showing ${filteredFees.length} fee record${filteredFees.length !== 1 ? 's' : ''} for month: ${monthFilter}`
          )}
        </div>

        {/* Fees Table - Compact Design with Larger Action Buttons */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 mt-4">
          <table className="min-w-[1200px] w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Month</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Room</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paid</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remaining</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Date</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedFees.length > 0 ? (
                paginatedFees.map((fee) => {
                  const paidAmount = fee.paidAmount || 0;
                  const remainingAmount = fee.amount - paidAmount;
                  const roomNo = roomNumbers[fee.student.id] || "-";
                  const isFullyPaid = remainingAmount <= 0;
                  
                  return (
                    <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-gray-900">{fee.student.name}</div>
                        <div className="text-xs text-gray-500">{fee.student.cnic}</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">{fee.month}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold">Rs {fee.amount.toLocaleString()}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">{roomNo}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-green-600 font-semibold">Rs {paidAmount.toLocaleString()}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-red-600">Rs {remainingAmount.toLocaleString()}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="text-sm">{formatDate(fee.dueDate)}</div>
                        {!isFullyPaid && new Date(fee.dueDate) < new Date() && (
                          <span className="text-xs text-red-600">Overdue</span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                        {fee.paymentDate ? formatDate(fee.paymentDate) : "-"}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isFullyPaid
                            ? "bg-green-100 text-green-800"
                            : paidAmount > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                        }`}>
                          {isFullyPaid ? "Paid" : paidAmount > 0 ? "Partial" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(fee)}
                            disabled={editingId === fee.id}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            title="Edit"
                          >
                            {editingId === fee.id ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <PencilIcon className="h-4 w-4" />
                            )}
                          </button>
                          
                          {!isFullyPaid && (
                            <button
                              onClick={() => openPaymentModal(fee)}
                              disabled={markingPaidId === fee.id}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                              title="Pay"
                            >
                              <BanknotesIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {(isFullyPaid || paidAmount > 0) && (
                            <>
                              <button
                                onClick={() => printReceipt(fee.id)}
                                disabled={printingId === fee.id}
                                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                title="Print"
                              >
                                <PrinterIcon className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => downloadReceipt(fee.id)}
                                disabled={downloadingId === fee.id}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                title="Download"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {role === 'ADMIN' && (
                            <button
                              onClick={() => deleteFee(fee.id)}
                              disabled={deletingId === fee.id}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <BanknotesIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No fees found</h3>
                      <p className="text-gray-500 text-sm">
                        {searchCnic || searchName || statusFilter !== "ALL" || monthFilter !== currentMonth
                          ? "Try adjusting your search or filters"
                          : `No fee records available for ${currentMonth}. Add a new fee record or generate monthly fees.`}
                      </p>
                      {(searchCnic || searchName || statusFilter !== "ALL" || monthFilter !== currentMonth) && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredFees.length)} of {filteredFees.length}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 border rounded-lg text-sm ${
                      currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Make Payment</h2>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <div className="flex justify-between mb-2">
                    <span>Student:</span>
                    <span className="font-semibold">{selectedFee.student.name}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Month:</span>
                    <span className="font-semibold">{selectedFee.month}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Total Fee:</span>
                    <span>Rs {selectedFee.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Already Paid:</span>
                    <span className="text-green-600">Rs {(selectedFee.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Remaining:</span>
                    <span className="font-bold text-red-600">Rs {(selectedFee.amount - (selectedFee.paidAmount || 0)).toLocaleString()}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Amount (Rs)</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    min="0"
                    max={selectedFee.amount - (selectedFee.paidAmount || 0)}
                    step="1"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={processingPayment}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {processingPayment ? "Processing..." : "Record Payment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Fee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
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
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={addFee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Student *</label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    <option value="">Choose a student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - CNIC: {s.cnic}</option>
                    ))}
                  </select>
                  {students.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">No active students available. Please add students first.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Rs) *</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    min="0"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-medium">
                    Add Fee Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {showEditModal && editingFee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
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
                <button onClick={() => { setShowEditModal(false); setEditingFee(null); }} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={editFee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Student *</label>
                  <select
                    value={editStudentId}
                    onChange={(e) => setEditStudentId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    <option value="">Choose a student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - CNIC: {s.cnic}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month *</label>
                  <input
                    type="month"
                    value={editMonth}
                    onChange={(e) => setEditMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount (Rs) *</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                    min="0"
                    step="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingFee(null); }} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    Cancel
                  </button>
                  <button type="submit" disabled={editingId === editingFee.id} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-medium disabled:opacity-50">
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