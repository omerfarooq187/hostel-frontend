import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ShoppingCartIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalculatorIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  HashtagIcon,
  ReceiptPercentIcon,
  BanknotesIcon,
  TagIcon,
  CreditCardIcon,
  UserIcon,               // added for expense per head (if needed elsewhere)
} from "@heroicons/react/24/outline";

export default function KitchenInventoryPage() {
  const hostelId = localStorage.getItem("selectedHostelId");
  
  // Main tabs: Issue (like checkout), Purchase (like ordering), Reports, Other Expenses
  const [activeTab, setActiveTab] = useState("issue"); // issue, purchase, reports, other
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Issue Summary (Left Panel: Items, Right Panel: Issue Summary)
  const [issueSummary, setIssueSummary] = useState([]);
  const [issuePurpose, setIssuePurpose] = useState("Lunch");
  const [issueRemarks, setIssueRemarks] = useState("");
  
  // Purchase Summary (Left Panel: Items, Right Panel: Purchase Summary)
  const [purchaseSummary, setPurchaseSummary] = useState([]);
  const [purchaseSupplier, setPurchaseSupplier] = useState("");
  const [purchaseRemarks, setPurchaseRemarks] = useState("");
  
  // New Item
  const [newItem, setNewItem] = useState({
    itemName: "",
    unit: "kg"
  });
  
  // Reports
  const [dailyExpenseDate, setDailyExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyExpenseData, setDailyExpenseData] = useState(null);
  const [loadingExpense, setLoadingExpense] = useState(false);

  const [monthlyExpense, setMonthlyExpense] = useState(null);
  const [loadingMonthlyExpense, setLoadingMonthlyExpense] = useState(false);

  const [weeklyStartDate, setWeeklyStartDate] = useState(() => {
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return monday.toISOString().split('T')[0];
  });
  
  const [monthlyDate, setMonthlyDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Other Expenses state
  const [otherExpenseForm, setOtherExpenseForm] = useState({
    title: "",
    category: "Maintenance",
    amount: "",
    remarks: ""
  });
  const [otherExpenseDate, setOtherExpenseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [otherExpensesList, setOtherExpensesList] = useState([]);
  const [otherExpensesTotal, setOtherExpensesTotal] = useState(0);
  const [loadingOtherExpenses, setLoadingOtherExpenses] = useState(false);
  const [submittingOther, setSubmittingOther] = useState(false);

  const categoryOptions = [
    "Maintenance", "Utilities", "Cleaning", "Stationery", "Miscellaneous", "Other"
  ];
  
  // Alerts
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  // Load inventory
  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/inventory/search", {
        params: { itemName: "", hostelId }
      });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to load inventory", err);
      showAlert("error", "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentMonthExpense = async () => {
    setLoadingMonthlyExpense(true);
    try {
      const now = new Date();
      const month = now.toISOString().slice(0,7);
      const res = await api.get("/api/admin/inventory/expenses/monthly", {
        params: { month, hostelId }
      });
      setMonthlyExpense(res.data);
      console.log(monthlyExpense)
      console.log(res.data.consumptionExpense)
    } catch (err) {
      console.error("Failed to load monthly expense", err);
      showAlert("error", "Failed to load monthly expense");
    } finally {
      setLoadingMonthlyExpense(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadInventory();
    loadCurrentMonthExpense();
  }, []);

  // Load expense report
  const loadDailyExpense = async () => {
    setLoadingExpense(true);
    try {
      const res = await api.get("/api/admin/inventory/expenses/daily", {
        params: { date: dailyExpenseDate }
      });
      setDailyExpenseData(res.data);
    } catch (err) {
      console.error("Failed to load daily expense", err);
      showAlert("error", "Failed to load daily expense report");
    } finally {
      setLoadingExpense(false);
    }
  };

  // Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/admin/inventory", newItem, {
        params: { hostelId }
      });
      setNewItem({ itemName: "", unit: "kg" });
      setShowAddModal(false);
      loadInventory();
      showAlert("success", "Item added successfully with auto-generated code");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to add item");
    }
  };

  // Delete item
  const handleDeleteItem = async () => {
    try {
      await api.delete(`/api/admin/inventory/${itemToDelete.id}`);
      setShowDeleteModal(false);
      setItemToDelete(null);
      loadInventory();
      showAlert("success", "Item deleted successfully");
    } catch (err) {
      showAlert("error", "Failed to delete item");
    }
  };

  // Issue Stock Functions
  const addToIssueSummary = (item) => {
    const existingItem = issueSummary.find(summaryItem => summaryItem.id === item.id);
    
    if (existingItem) {
      // Increment quantity if already in summary
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > item.quantity) {
        showAlert("error", `Cannot issue more than available stock (${item.quantity} ${item.unit})`);
        return;
      }
      
      setIssueSummary(issueSummary.map(summaryItem =>
        summaryItem.id === item.id
          ? { ...summaryItem, quantity: newQuantity }
          : summaryItem
      ));
    } else {
      // Add new item to summary
      if (item.quantity <= 0) {
        showAlert("error", "Item is out of stock");
        return;
      }
      
      setIssueSummary([
        ...issueSummary,
        {
          ...item,
          quantity: 1
        }
      ]);
    }
    showAlert("info", `${item.itemName} added for issuing`);
  };

  const updateIssueQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromIssueSummary(itemId);
      return;
    }
    
    const item = items.find(i => i.id === itemId);
    if (item && quantity > item.quantity) {
      showAlert("error", `Cannot issue more than available stock (${item.quantity} ${item.unit})`);
      return;
    }
    
    setIssueSummary(issueSummary.map(summaryItem =>
      summaryItem.id === itemId
        ? { ...summaryItem, quantity: parseFloat(quantity) || 1 }
        : summaryItem
    ));
  };

  const removeFromIssueSummary = (itemId) => {
    setIssueSummary(issueSummary.filter(item => item.id !== itemId));
  };

  const clearIssueSummary = () => {
    setIssueSummary([]);
    setIssuePurpose("Lunch");
    setIssueRemarks("");
    showAlert("info", "Issue summary cleared");
  };

  const handleIssueStock = async () => {
    if (issueSummary.length === 0) {
      showAlert("error", "Please add items to issue");
      return;
    }

    try {
      for (const summaryItem of issueSummary) {
        await api.post(`/api/admin/inventory/${summaryItem.id}/consume`, null, {
          params: {
            quantity: summaryItem.quantity,
            purpose: issuePurpose,
            remarks: issueRemarks || `Bulk issue`
          }
        });
      }
      
      showAlert("success", `Issued ${issueSummary.length} item(s) for ${issuePurpose}`);
      setIssueSummary([]);
      setIssueRemarks("");
      loadInventory();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to issue stock");
    }
  };

  // Purchase Stock Functions
  const addToPurchaseSummary = (item) => {
    const existingItem = purchaseSummary.find(summaryItem => summaryItem.id === item.id);
    
    if (existingItem) {
      // Increment quantity
      setPurchaseSummary(purchaseSummary.map(summaryItem =>
        summaryItem.id === item.id
          ? { 
              ...summaryItem, 
              quantity: summaryItem.quantity + 1,
              total: (summaryItem.quantity + 1) * (summaryItem.pricePerUnit || 0)
            }
          : summaryItem
      ));
    } else {
      // Add new item with default price
      setPurchaseSummary([
        ...purchaseSummary,
        {
          ...item,
          quantity: 1,
          pricePerUnit: item.averageCost || 0,
          total: item.averageCost || 0
        }
      ]);
    }
    showAlert("info", `${item.itemName} added for purchase`);
  };

  const updatePurchaseQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromPurchaseSummary(itemId);
      return;
    }
    
    setPurchaseSummary(purchaseSummary.map(summaryItem =>
      summaryItem.id === itemId
        ? { 
            ...summaryItem, 
            quantity: parseFloat(quantity) || 1,
            total: (parseFloat(quantity) || 1) * (summaryItem.pricePerUnit || 0)
          }
        : summaryItem
    ));
  };

  const updatePurchasePrice = (itemId, price) => {
    setPurchaseSummary(purchaseSummary.map(summaryItem =>
      summaryItem.id === itemId
        ? { 
            ...summaryItem, 
            pricePerUnit: parseFloat(price) || 0,
            total: summaryItem.quantity * (parseFloat(price) || 0)
          }
        : summaryItem
    ));
  };

  const removeFromPurchaseSummary = (itemId) => {
    setPurchaseSummary(purchaseSummary.filter(item => item.id !== itemId));
  };

  const clearPurchaseSummary = () => {
    setPurchaseSummary([]);
    setPurchaseSupplier("");
    setPurchaseRemarks("");
    showAlert("info", "Purchase summary cleared");
  };

  const handlePurchaseStock = async () => {
    if (purchaseSummary.length === 0) {
      showAlert("error", "Please add items to purchase");
      return;
    }

    try {
      for (const summaryItem of purchaseSummary) {
        await api.post(`/api/admin/inventory/${summaryItem.id}/purchase`, null, {
          params: {
            quantity: summaryItem.quantity,
            pricePerUnit: summaryItem.pricePerUnit,
            supplier: purchaseSupplier || "",
            remarks: purchaseRemarks || `Bulk purchase`
          }
        });
      }
      
      showAlert("success", `Purchased ${purchaseSummary.length} item(s) successfully`);
      setPurchaseSummary([]);
      setPurchaseSupplier("");
      setPurchaseRemarks("");
      loadInventory();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to purchase stock");
    }
  };

  // Download Reports
  const downloadDailyPDF = async () => {
    try {
      const res = await api.get("/api/admin/inventory/report/daily/pdf", {
        responseType: "blob",
        params: { hostelId, date: dailyExpenseDate }
      });
      
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-inventory-report-${dailyExpenseDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download daily PDF", err);
      showAlert("error", "Failed to download daily report");
    }
  };

  const downloadWeeklyPDF = async () => {
    try {
      const res = await api.get("/api/admin/inventory/report/weekly/pdf", {
        responseType: "blob",
        params: { hostelId, startDate: weeklyStartDate }
      });
      
      const endDate = new Date(weeklyStartDate);
      endDate.setDate(endDate.getDate() + 6);
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `weekly-inventory-report-${weeklyStartDate}-${formattedEndDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download weekly PDF", err);
      showAlert("error", "Failed to download weekly report");
    }
  };

  const downloadMonthlyPDF = async () => {
    try {
      const [year, month] = monthlyDate.split('-');
      
      const res = await api.get("/api/admin/inventory/report/monthly/pdf", {
        responseType: "blob",
        params: { 
          hostelId,
          year: parseInt(year),
          month: parseInt(month)
        }
      });
      
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly-inventory-report-${year}-${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download monthly PDF", err);
      showAlert("error", "Failed to download monthly report");
    }
  };

  const downloadDailyExcel = async () => {
    try {
      const res = await api.get("/api/admin/inventory/report/daily/excel", {
        responseType: "blob",
        params: { hostelId, date: dailyExpenseDate }
      });
      
      const blob = new Blob([res.data], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-inventory-report-${dailyExpenseDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download daily Excel", err);
      showAlert("error", "Failed to download daily Excel report");
    }
  };

  const downloadWeeklyExcel = async () => {
    try {
      const res = await api.get("/api/admin/inventory/report/weekly/excel", {
        responseType: "blob",
        params: { hostelId, startDate: weeklyStartDate }
      });
      
      const endDate = new Date(weeklyStartDate);
      endDate.setDate(endDate.getDate() + 6);
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const blob = new Blob([res.data], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `weekly-inventory-report-${weeklyStartDate}-${formattedEndDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download weekly Excel", err);
      showAlert("error", "Failed to download weekly Excel report");
    }
  };

  const downloadMonthlyExcel = async () => {
    try {
      const [year, month] = monthlyDate.split('-');
      
      const res = await api.get("/api/admin/inventory/report/monthly/excel", {
        responseType: "blob",
        params: { 
          hostelId,
          year: parseInt(year),
          month: parseInt(month)
        }
      });
      
      const blob = new Blob([res.data], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly-inventory-report-${year}-${month}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download monthly Excel", err);
      showAlert("error", "Failed to download monthly Excel report");
    }
  };

  // Other Expenses functions
  const loadOtherExpenses = async () => {
    setLoadingOtherExpenses(true);
    try {
      // Daily total
      const totalRes = await api.get("/api/admin/other-expenses/daily", {
        params: { hostelId, date: otherExpenseDate }
      });
      setOtherExpensesTotal(totalRes.data);

      // List for the same day (range with equal start and end)
      const listRes = await api.get("/api/admin/other-expenses/range", {
        params: {
          hostelId,
          startDate: otherExpenseDate,
          endDate: otherExpenseDate
        }
      });
      setOtherExpensesList(listRes.data);
    } catch (err) {
      console.error("Failed to load other expenses", err);
      showAlert("error", "Failed to load other expenses");
    } finally {
      setLoadingOtherExpenses(false);
    }
  };

  const handleAddOtherExpense = async (e) => {
    e.preventDefault();
    if (!otherExpenseForm.title || !otherExpenseForm.amount) {
      showAlert("error", "Please fill title and amount");
      return;
    }
    setSubmittingOther(true);
    try {
      await api.post("/api/admin/other-expenses", {
        title: otherExpenseForm.title,
        category: otherExpenseForm.category,
        amount: parseFloat(otherExpenseForm.amount),
        remarks: otherExpenseForm.remarks
      }, {
        params: { hostelId }
      });
      showAlert("success", "Expense added successfully");
      setOtherExpenseForm({ title: "", category: "Maintenance", amount: "", remarks: "" });
      loadOtherExpenses(); // refresh the list for the current date
    } catch (err) {
      console.error("Failed to add other expense", err);
      showAlert("error", "Failed to add expense");
    } finally {
      setSubmittingOther(false);
    }
  };

  // Load other expenses when the tab becomes active
  useEffect(() => {
    if (activeTab === "other") {
      loadOtherExpenses();
    }
  }, [activeTab, otherExpenseDate]); // reload when date changes while on the tab

  // Filter items
  const filteredItems = items.filter(item => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return item.itemName.toLowerCase().includes(term) ||
           item.itemCode?.toLowerCase().includes(term);
  });

  // Statistics
  const lowStockItems = items.filter(item => item.quantity <= 10);
  const outOfStockItems = items.filter(item => item.quantity === 0);
  const totalInventoryValue = items.reduce((sum, item) => sum + (item.quantity * (item.averageCost || 0)), 0);

  // Summary totals
  const issueSummaryTotalQuantity = issueSummary.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const purchaseSummaryTotalValue = purchaseSummary.reduce((sum, item) => sum + (item.total || 0), 0);

  // Unit options
  const unitOptions = ["kg", "g", "l", "ml", "pcs", "pack", "dozen", "bottle", "can", "box"];
  const purposeOptions = ["Breakfast", "Lunch", "Dinner", "Snacks", "Special Meal", "Kitchen Staff", "Cleaning", "Maintenance", "Other"];

  if (loading && items.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl"></div>
        <div className="grid grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg ${
          alert.type === "success" ? "bg-green-100 border border-green-400 text-green-800" :
          alert.type === "error" ? "bg-red-100 border border-red-400 text-red-800" :
          "bg-blue-100 border border-blue-400 text-blue-800"
        }`}>
          <div className="flex items-center gap-3">
            {alert.type === "success" ? <CheckCircleIcon className="h-6 w-6" /> :
             alert.type === "error" ? <ExclamationCircleIcon className="h-6 w-6" /> :
             <LightBulbIcon className="h-6 w-6" />}
            <span className="font-medium">{alert.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Kitchen Inventory Management</h1>
            <p className="text-blue-100 mt-1">Streamlined inventory management for kitchens</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={loadInventory}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Refresh Stock
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-blue-50 text-blue-700 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Add New Item
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar - NOW 4 COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Items */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700 font-medium">Total Items</div>
              <div className="text-2xl font-bold text-blue-900">{items.length}</div>
            </div>
            <TagIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Stock Value */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-700 font-medium">Stock Value</div>
              <div className="text-2xl font-bold text-green-900">Rs {totalInventoryValue.toLocaleString()}</div>
            </div>
            <BanknotesIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Current Month Expense */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-700 font-medium">Monthly Expense</div>
              <div className="text-2xl font-bold text-purple-900">
                {loadingMonthlyExpense ? '...' : `Rs ${monthlyExpense?.consumptionExpense?.toLocaleString() || 0}`}
              </div>
            </div>
            <CalendarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-orange-700 font-medium">Low Stock Items</div>
              <div className="text-2xl font-bold text-orange-900">{lowStockItems.length}</div>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="flex border-b border-gray-200">
          {["issue", "purchase", "reports", "other"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab === "issue" ? "Issue Stock" : 
               tab === "purchase" ? "Purchase Stock" : 
               tab === "reports" ? "Reports & Analytics" :
               "Other Expenses"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "issue" ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Panel - Available Items */}
              <div className="lg:w-2/3">
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Available Stock Items</h2>
                    <div className="relative w-64">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search items by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-2">
                  {filteredItems.map((item) => {
                    const isLowStock = item.quantity <= 10;
                    const isOutOfStock = item.quantity === 0;
                    
                    return (
                      <div
                        key={item.id}
                        className={`bg-white border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer ${
                          isOutOfStock ? 'border-red-300 bg-red-50' :
                          isLowStock ? 'border-orange-300 bg-orange-50' :
                          'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => addToIssueSummary(item)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="p-1 bg-blue-100 rounded">
                                <HashtagIcon className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <span className="font-bold text-blue-800 text-sm font-mono">
                                {item.itemCode}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">{item.itemName}</h3>
                          </div>
                          
                          <div className={`text-right font-bold ${
                            isOutOfStock ? 'text-red-600' :
                            isLowStock ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {item.quantity}
                            <div className="text-xs text-gray-500">{item.unit}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {isOutOfStock ? (
                              <span className="text-red-600 font-medium">Out of Stock</span>
                            ) : isLowStock ? (
                              <span className="text-orange-600 font-medium">Low Stock</span>
                            ) : (
                              <span className="text-green-600 font-medium">Available</span>
                            )}
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToIssueSummary(item);
                            }}
                            disabled={isOutOfStock}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              isOutOfStock
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            Issue
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel - Issue Summary */}
              <div className="lg:w-1/3">
                <div className="bg-gradient-to-b from-blue-50 to-blue-100 border border-blue-200 rounded-xl sticky top-4">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-200 rounded-lg">
                          <ReceiptPercentIcon className="h-6 w-6 text-blue-700" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Issue Summary</h2>
                          <p className="text-sm text-gray-600">Kitchen consumption summary</p>
                        </div>
                      </div>
                      
                      {issueSummary.length > 0 && (
                        <button
                          onClick={clearIssueSummary}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Summary Items */}
                    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                      {issueSummary.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No items selected</p>
                          <p className="text-sm text-gray-400 mt-1">Click items from the list to add</p>
                        </div>
                      ) : (
                        issueSummary.map((item) => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="font-medium text-gray-900">{item.itemName}</div>
                                <div className="text-sm text-gray-500">{item.itemCode}</div>
                              </div>
                              <button
                                onClick={() => removeFromIssueSummary(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateIssueQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateIssueQuantity(item.id, e.target.value)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                  min="0.1"
                                  step="0.1"
                                />
                                <button
                                  onClick={() => updateIssueQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded"
                                >
                                  +
                                </button>
                                <span className="text-sm text-gray-600 ml-2">{item.unit}</span>
                              </div>
                              
                              <div className="text-sm text-gray-500">
                                Max: {items.find(i => i.id === item.id)?.quantity || 0}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Summary Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Purpose
                        </label>
                        <select
                          value={issuePurpose}
                          onChange={(e) => setIssuePurpose(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {purposeOptions.map(purpose => (
                            <option key={purpose} value={purpose}>{purpose}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remarks (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Any notes..."
                          value={issueRemarks}
                          onChange={(e) => setIssueRemarks(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="pt-4 border-t border-blue-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Items Selected</span>
                          <span className="font-medium">{issueSummary.length}</span>
                        </div>
                        <div className="flex justify-between mb-4">
                          <span className="text-gray-600">Total Quantity</span>
                          <span className="font-bold">{issueSummaryTotalQuantity}</span>
                        </div>
                        
                        <button
                          onClick={handleIssueStock}
                          disabled={issueSummary.length === 0}
                          className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
                            issueSummary.length === 0
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                          }`}
                        >
                          {issueSummary.length === 0 ? 'No Items Selected' : `Issue ${issueSummary.length} Item(s)`}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "purchase" ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Panel - Items for Purchase */}
              <div className="lg:w-2/3">
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Items for Purchase</h2>
                    <div className="relative w-64">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search items to purchase..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-2">
                  {filteredItems.map((item) => {
                    const itemValue = (item.quantity * (item.averageCost || 0));
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => addToPurchaseSummary(item)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="p-1 bg-green-100 rounded">
                                <TagIcon className="h-3.5 w-3.5 text-green-600" />
                              </div>
                              <span className="font-bold text-green-800 text-sm font-mono">
                                {item.itemCode}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900">{item.itemName}</h3>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{item.quantity}</div>
                            <div className="text-xs text-gray-500">{item.unit}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Current Value:</span>
                            <span className="font-medium text-green-700">
                              Rs {itemValue.toLocaleString()}
                            </span>
                          </div>
                          
                          {item.averageCost && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Avg Cost:</span>
                              <span className="font-medium">Rs {item.averageCost.toFixed(2)}/{item.unit}</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToPurchaseSummary(item);
                          }}
                          className="w-full mt-4 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Purchase
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel - Purchase Summary */}
              <div className="lg:w-1/3">
                <div className="bg-gradient-to-b from-green-50 to-green-100 border border-green-200 rounded-xl sticky top-4">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-200 rounded-lg">
                          <CreditCardIcon className="h-6 w-6 text-green-700" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Purchase Summary</h2>
                          <p className="text-sm text-gray-600">Stock purchase summary</p>
                        </div>
                      </div>
                      
                      {purchaseSummary.length > 0 && (
                        <button
                          onClick={clearPurchaseSummary}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Purchase Summary Items */}
                    <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                      {purchaseSummary.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No items selected</p>
                          <p className="text-sm text-gray-400 mt-1">Click items from the list to add</p>
                        </div>
                      ) : (
                        purchaseSummary.map((item) => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-medium text-gray-900">{item.itemName}</div>
                                <div className="text-sm text-gray-500">{item.itemCode}</div>
                              </div>
                              <button
                                onClick={() => removeFromPurchaseSummary(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-600">Quantity:</label>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updatePurchaseQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updatePurchaseQuantity(item.id, e.target.value)}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                    min="0.1"
                                    step="0.1"
                                  />
                                  <button
                                    onClick={() => updatePurchaseQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded"
                                  >
                                    +
                                  </button>
                                  <span className="text-sm text-gray-600">{item.unit}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <label className="text-sm text-gray-600">Price/Unit:</label>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">Rs</span>
                                  <input
                                    type="number"
                                    value={item.pricePerUnit}
                                    onChange={(e) => updatePurchasePrice(item.id, e.target.value)}
                                    className="w-32 pl-6 pr-2 py-1 border border-gray-300 rounded text-right"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                                <span className="text-sm font-medium text-gray-700">Total:</span>
                                <span className="font-bold text-green-700">
                                  Rs {(item.quantity * item.pricePerUnit).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Purchase Summary Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Supplier (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Supplier name"
                          value={purchaseSupplier}
                          onChange={(e) => setPurchaseSupplier(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remarks (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Any notes..."
                          value={purchaseRemarks}
                          onChange={(e) => setPurchaseRemarks(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div className="pt-4 border-t border-green-200">
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Items Selected</span>
                            <span className="font-medium">{purchaseSummary.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Quantity</span>
                            <span className="font-medium">
                              {purchaseSummary.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Value</span>
                            <span className="font-bold text-green-700">
                              Rs {purchaseSummaryTotalValue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={handlePurchaseStock}
                          disabled={purchaseSummary.length === 0}
                          className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
                            purchaseSummary.length === 0
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                          }`}
                        >
                          {purchaseSummary.length === 0 ? 'No Items Selected' : `Purchase Rs ${purchaseSummaryTotalValue.toFixed(2)}`}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "reports" ? (
            /* Reports Tab */
            <div className="space-y-6">
              {/* Daily Expense Report */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Expense Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={dailyExpenseDate}
                        onChange={(e) => setDailyExpenseDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={loadDailyExpense}
                      disabled={loadingExpense}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loadingExpense ? "Loading..." : "Load Expense Report"}
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={downloadDailyPDF}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      Download PDF
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={downloadDailyExcel}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5" />
                      Download Excel
                    </button>
                  </div>
                </div>

                {dailyExpenseData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm font-medium">Purchase Expense</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">
                            Rs {dailyExpenseData.purchaseExpense.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm font-medium">Consumption Expense</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">
                            Rs {dailyExpenseData.consumptionExpense.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                          <ArrowTrendingDownIcon className="h-6 w-6 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-sm font-medium">Total Daily Expense</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">
                            Rs {dailyExpenseData.total.toFixed(2)}
                          </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                          <CalculatorIcon className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Weekly and Monthly Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Report</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date (Monday)
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          value={weeklyStartDate}
                          onChange={(e) => setWeeklyStartDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={downloadWeeklyPDF}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-colors"
                      >
                        <DocumentTextIcon className="h-5 w-5" />
                        PDF Report
                      </button>
                      <button
                        onClick={downloadWeeklyExcel}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-colors"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                        Excel Report
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Report</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Month
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="month"
                          value={monthlyDate}
                          onChange={(e) => setMonthlyDate(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={downloadMonthlyPDF}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-colors"
                      >
                        <ChartBarIcon className="h-5 w-5" />
                        PDF Report
                      </button>
                      <button
                        onClick={downloadMonthlyExcel}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-colors"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                        Excel Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Other Expenses Tab */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column – Add Expense Form */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add Other Expense</h3>
                <form onSubmit={handleAddOtherExpense} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Plumbing repair"
                      value={otherExpenseForm.title}
                      onChange={(e) => setOtherExpenseForm({ ...otherExpenseForm, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={otherExpenseForm.category}
                      onChange={(e) => setOtherExpenseForm({ ...otherExpenseForm, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (Rs) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={otherExpenseForm.amount}
                      onChange={(e) => setOtherExpenseForm({ ...otherExpenseForm, amount: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Any additional notes"
                      value={otherExpenseForm.remarks}
                      onChange={(e) => setOtherExpenseForm({ ...otherExpenseForm, remarks: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOther}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-medium disabled:opacity-50"
                  >
                    {submittingOther ? "Adding..." : "Add Expense"}
                  </button>
                </form>
              </div>

              {/* Right Column – View Expenses */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Daily Expenses</h3>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          value={otherExpenseDate}
                          onChange={(e) => setOtherExpenseDate(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <button
                        onClick={loadOtherExpenses}
                        disabled={loadingOtherExpenses}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loadingOtherExpenses ? "Loading..." : "Load"}
                      </button>
                    </div>
                  </div>

                  {loadingOtherExpenses ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">Total for {otherExpenseDate}</span>
                          <span className="text-2xl font-bold text-green-700">
                            Rs {otherExpensesTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {otherExpensesList.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No expenses recorded for this date.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {otherExpensesList.map((expense) => (
                            <div key={expense.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{expense.title}</h4>
                                  <p className="text-sm text-gray-600">
                                    {expense.category} • {expense.time?.substring(0,5)} 
                                    {expense.remarks && ` • ${expense.remarks}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-bold text-blue-600">
                                    Rs {expense.amount.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PlusIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
                    <p className="text-gray-600 text-sm">Item code will be auto-generated</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <HashtagIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Item Code</p>
                      <p className="text-sm text-blue-600">Will be auto-generated (e.g., 0001, 0002)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter item name"
                    value={newItem.itemName}
                    onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    {unitOptions.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-colors font-medium"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Delete Item</h2>
                    <p className="text-gray-600 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-red-800 mb-2">
                      Are you sure you want to delete this item?
                    </p>
                    <p className="text-red-600">
                      Item Code: <strong>{itemToDelete.itemCode}</strong><br />
                      Item Name: <strong>{itemToDelete.itemName}</strong><br />
                      Current Stock: <strong>{itemToDelete.quantity} {itemToDelete.unit}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteItem}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-colors font-medium"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}