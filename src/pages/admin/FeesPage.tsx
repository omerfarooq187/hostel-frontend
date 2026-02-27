import { useEffect, useState } from "react";
import api from "../../api/axios";
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
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

export default function FeesPage() {
  const hostelId = localStorage.getItem("selectedHostelId");

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchCnic, setSearchCnic] = useState("");
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // form state
  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

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

  const addFee = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(
        "/api/admin/fee",
        {
          student: { id: studentId },
          month,
          amount,
          dueDate,
          status: "UNPAID",
        },
        { params: { hostelId } }
      );
      setFees([...fees, res.data]);
      setShowModal(false);
    } catch (e) {
      console.error("Failed to add fee", e);
    }
  };

  const markPaid = async (feeId) => {
    const res = await api.put(`/api/admin/fee/${feeId}/pay`);
    setFees(fees.map(f => (f.id === feeId ? res.data : f)));
  };

  const downloadReceipt = async (feeId) => {
    try {
      const res = await api.get(`/api/admin/fee/${feeId}/receipt`, { 
        responseType: "blob" 
      });
      
      // Create blob URL
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Fee-Receipt-${feeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download receipt", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  const printReceipt = async (feeId) => {
    try {
      const res = await api.get(`/api/admin/fee/${feeId}/receipt`, { 
        responseType: "blob" 
      });
      
      // Create blob URL
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.focus();
        
        // Wait for the PDF to load, then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
        
        // Fallback in case onload doesn't fire
        setTimeout(() => {
          if (printWindow && !printWindow.closed) {
            printWindow.print();
          }
        }, 1000);
      } else {
        alert("Pop-up blocked! Please allow pop-ups for this site to print receipts.");
      }
      
      // Note: We don't revoke the URL immediately as it's used in the new window
      // The browser will clean it up when the window is closed
    } catch (error) {
      console.error("Failed to print receipt", error);
      alert("Failed to print receipt. Please try again.");
    }
  };

  const deleteFee = async (feeId) => {
    if (!window.confirm("Are you sure you want to delete this fee record?")) return;
    await api.delete(`/api/admin/fee/${feeId}`);
    setFees(fees.filter(f => f.id !== feeId));
  };

  // Filter fees by multiple criteria
  const filteredFees = fees.filter(f => {
    const matchesCnic = searchCnic 
      ? f.student.cnic.toLowerCase().includes(searchCnic.toLowerCase())
      : true;
    
    const matchesName = searchName
      ? f.student.name.toLowerCase().includes(searchName.toLowerCase())
      : true;
    
    const matchesStatus = statusFilter !== "ALL"
      ? f.status === statusFilter
      : true;
    
    return matchesCnic && matchesName && matchesStatus;
  });

  // Calculate statistics
  const paidFees = fees.filter(f => f.status === "PAID");
  const unpaidFees = fees.filter(f => f.status === "UNPAID");
  const totalCollected = paidFees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPending = unpaidFees.reduce((sum, fee) => sum + fee.amount, 0);

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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">Manage student fee records and payments</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Fee
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Fees</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{fees.length}</p>
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
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-red-600" />
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

      {/* Search and Filter Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search by CNIC No */}
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

          {/* Search by Name */}
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
        </div>

        {/* Fees Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {fee.student.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          CNIC: {fee.student.cnic}
                        </div>
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
                      <div className="text-sm text-gray-900">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </div>
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
                        {fee.status !== "PAID" ? (
                          <>
                            <button
                              onClick={() => markPaid(fee.id)}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                              title="Mark as Paid"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                              Mark Paid
                            </button>
                            <button
                              onClick={() => deleteFee(fee.id)}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                              title="Delete Fee Record"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="relative group">
                              <button
                                onClick={() => printReceipt(fee.id)}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                                title="Print Receipt"
                              >
                                <PrinterIcon className="h-4 w-4" />
                                Print
                              </button>
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                Opens print dialog
                              </div>
                            </div>
                            
                            <div className="relative group">
                              <button
                                onClick={() => downloadReceipt(fee.id)}
                                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                                title="Download Receipt"
                              >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                Download
                              </button>
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                                Save PDF to device
                              </div>
                            </div>
                            
                            <button
                              onClick={() => deleteFee(fee.id)}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                              title="Delete Fee Record"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <BanknotesIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No fees found</h3>
                      <p className="text-gray-500">
                        {searchCnic || searchName || statusFilter !== "ALL"
                          ? "Try adjusting your search or filter"
                          : "No fee records available. Add your first fee record."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fee Modal */}
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
                    Select Student
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
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
                    Amount (₹)
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
                    Due Date
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
    </div>
  );
}