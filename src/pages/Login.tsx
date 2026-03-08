import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/ogoh_logo.png";
import {
  EnvelopeIcon,
  KeyIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  EnvelopeOpenIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResendOption, setShowResendOption] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowResendOption(false);
    setResendSuccess(false);

    try {
      const res = await api.post("/api/auth/login", {
        email,
        password
      });

      // store token via context
      login(res.data.token, res.data.role);

      // redirect by role
      if (res.data.role === "ADMIN" || res.data.role ==="STAFF") {
        navigate("/admin/login");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid email or password. Please try again.";
      
      // Check if error is related to email verification
      const lowerCaseError = errorMessage.toLowerCase();
      if (lowerCaseError.includes("verify") || 
          lowerCaseError.includes("verified") || 
          lowerCaseError.includes("verification") ||
          lowerCaseError.includes("email not verified")) {
        
        setError("Email verification required. Please verify your email before logging in.");
        setShowResendOption(true);
        
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    setResending(true);
    setError("");
    setResendSuccess(false);

    try {
      await api.post("/api/auth/resend-verification", { email });
      setResendSuccess(true);
      setError("");
      setShowResendOption(false);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object' && errorData.message) {
        setError(errorData.message);
      } else if (typeof errorData === 'string') {
        setError(errorData);
      } else {
        setError("Failed to resend verification email.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3">
            <img src={logo} className="h-20 w-20 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Officers Group of Hostels</h1>
          <p className="text-gray-600 mt-1">Management System Login</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 mb-6">
              Sign in to access your account
            </p>

            {/* Success Message for Resend */}
            {resendSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <EnvelopeOpenIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium">Verification Email Sent</p>
                    <p className="text-green-600 text-sm mt-1">
                      A new verification link has been sent to your email. Please check your inbox and verify your email before logging in.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                showResendOption ? "bg-orange-50 border border-orange-200" : "bg-red-50 border border-red-200"
              }`}>
                <LockClosedIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  showResendOption ? "text-orange-600" : "text-red-600"
                }`} />
                <div className="flex-1">
                  <p className={`font-medium ${
                    showResendOption ? "text-orange-800" : "text-red-800"
                  }`}>
                    {showResendOption ? "Verification Required" : "Login Failed"}
                  </p>
                  <p className={`text-sm mt-1 ${
                    showResendOption ? "text-orange-700" : "text-red-600"
                  }`}>
                    {error}
                  </p>
                  
                  {/* Resend Verification Option */}
                  {showResendOption && (
                    <div className="mt-4">
                      <div className="flex items-center gap-3 mb-3">
                        <ExclamationCircleIcon className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-700">
                          Didn't receive verification email?
                        </span>
                      </div>
                      <button
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {resending ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <EnvelopeIcon className="h-4 w-4" />
                            Resend Verification Email
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                    disabled={loading || resending}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    required
                    disabled={loading || resending}
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || resending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="space-y-4">
                <p className="text-center text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
                  >
                    Create account
                  </Link>
                </p>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-center text-sm text-gray-600">
                    New to Officers Hostel?{" "}
                    <Link
                      to="/"
                      className="text-orange-600 hover:text-orange-800 font-medium"
                    >
                      Learn more about our services
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Officers Group of Hostels
          </p>
        </div>
      </div>
    </div>
  );
}