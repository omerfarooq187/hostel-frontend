import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  EnvelopeIcon,
  UserIcon,
  UserGroupIcon,
  UsersIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import Select from "react-select";

export default function MessagingPage() {
  const hostelId = localStorage.getItem("selectedHostelId");

  // Recipient type: 'individual', 'active', 'all'
  const [recipientType, setRecipientType] = useState("individual");

  // Individual user selection
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Stats for messaging
  const [stats, setStats] = useState({
    activeStudents: 0,
    totalStudents: 0
  });

  // Message fields
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // UI states
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  // Load users when individual tab is selected
  useEffect(() => {
    if (recipientType === "individual") {
      loadUsers();
    }
  }, [recipientType]);

  // Load stats for messaging
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // You need to implement this endpoint or use existing ones
      const [activeRes, allRes] = await Promise.all([
        api.get("/api/admin/students", { params: { hostelId } }),
        api.get("/api/admin/students/all-including-inactive", { params: { hostelId } })
      ]);
      
      setStats({
        activeStudents: activeRes.data.length,
        totalStudents: allRes.data.length
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // Get all students with user accounts
      const res = await api.get("/api/admin/students/without-user", {
        params: { hostelId },
      });
      
      // Transform for react-select
      const options = res.data
        .filter(student => student.user) // Ensure user exists
        .map((student) => ({
          value: student.user.id,
          label: `${student.user.name} (${student.user.email})`,
          email: student.user.email
        }));
      
      setUsers(options);
    } catch (err) {
      console.error("Failed to load users", err);
      showAlert("error", "Could not load user list");
    } finally {
      setLoadingUsers(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "", message: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!subject.trim() || !body.trim()) {
      showAlert("error", "Subject and body are required");
      return;
    }

    if (recipientType === "individual" && !selectedUser) {
      showAlert("error", "Please select a user");
      return;
    }

    setSending(true);

    try {
      const payload = {
        subject,
        body,
      };

      if (recipientType === "individual") {
        payload.userId = selectedUser.value;
      } else if (recipientType === "active") {
        payload.activeOnly = true;
      } else if (recipientType === "all") {
        payload.allStudents = true;
      }

      const res = await api.post(`/api/admin/messaging/send?hostelId=${hostelId}`, payload);
      
      showAlert("success", res.data || "Message sent successfully!");
      
      // Clear form except recipient type
      setSubject("");
      setBody("");
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to send message", err);
      const errorMsg = err.response?.data || err.response?.data?.message || "Failed to send message";
      showAlert("error", errorMsg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg animate-slide-in ${
            alert.type === "success"
              ? "bg-green-100 border border-green-400 text-green-800"
              : "bg-red-100 border border-red-400 text-red-800"
          }`}
        >
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <EnvelopeIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Messaging Center</h1>
            <p className="text-purple-100 mt-1">
              Send emails to individuals or groups
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeStudents}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="p-6">
          {/* Recipient Type Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { id: "individual", label: "Individual", icon: UserIcon },
              { id: "active", label: "Active Students", icon: UserGroupIcon },
              { id: "all", label: "All Students", icon: UsersIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRecipientType(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  recipientType === tab.id
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Selection */}
            {recipientType === "individual" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Student *
                </label>
                <Select
                  options={users}
                  value={selectedUser}
                  onChange={setSelectedUser}
                  isLoading={loadingUsers}
                  placeholder="Search by name or email..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable
                  required
                  noOptionsMessage={() => "No students with accounts found"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only students with user accounts can receive emails.
                </p>
              </div>
            )}

            {recipientType === "active" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <UserGroupIcon className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-green-800 font-medium">
                      Sending to Active Students
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      This message will be sent to <strong>{stats.activeStudents} active students</strong> who have user accounts.
                      Inactive students will not receive this message.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {recipientType === "all" && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <UsersIcon className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-purple-800 font-medium">
                      Sending to All Students
                    </p>
                    <p className="text-purple-700 text-sm mt-1">
                      This message will be sent to <strong>{stats.totalStudents} students</strong> (both active and inactive) 
                      who have user accounts. Students without accounts will not receive emails.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="Enter email subject"
                required
              />
            </div>

            {/* Body */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                Message Body *
              </label>
              <textarea
                id="body"
                rows="8"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                placeholder="Write your message here..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}