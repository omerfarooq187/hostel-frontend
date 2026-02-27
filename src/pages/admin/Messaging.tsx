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

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // You need to implement this endpoint on the backend
      // It should return a list of all users (id, name, email)
      const res = await api.get("/api/admin/students/without-user", {
        params: { hostelId },
      });
      console.log(res.data)
      // Transform for react-select
      const options = res.data.map((student) => ({
        value: student.user.id,
        label: `${student.user.name} (${student.user.email})`,
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

      const res = await api.post("/api/admin/messaging/send", payload);

      showAlert("success", "Message sent successfully!");
      // Clear form except recipient type
      setSubject("");
      setBody("");
      setSelectedUser(null);
    } catch (err) {
      console.error("Failed to send message", err);
      showAlert("error", err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg ${
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
                  Select User *
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
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: User list includes staff and students.
                </p>
              </div>
            )}

            {recipientType === "active" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800">
                  <UserGroupIcon className="h-5 w-5 inline mr-2" />
                  This message will be sent to all <strong>active students</strong>.
                </p>
              </div>
            )}

            {recipientType === "all" && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-purple-800">
                  <UsersIcon className="h-5 w-5 inline mr-2" />
                  This message will be sent to <strong>all students</strong> (active and inactive).
                </p>
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50"
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