import { useState, useEffect } from "react";
import { useNavigate, Link, useParams, useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  KeyIcon,
  LockClosedIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [token, setToken] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Extract token from URL parameters or query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryToken = searchParams.get('token');
    
    if (queryToken) {
      setToken(queryToken);
    } else {
      setError("Invalid reset link. No token found.");
      setTokenValid(false);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/auth/reset-password", {
        token: token.trim(),
        newPassword: password
      });
      
      setSuccess(true);
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Password reset successful! You can now login with your new password."
          }
        });
      }, 3000);
      
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object' && errorData.message) {
        setError(errorData.message);
      } else if (typeof errorData === 'string') {
        setError(errorData);
      } else {
        setError("Failed to reset password. Please try again.");
      }
      
      // Check if token is invalid
      const lowerCaseError = (errorData?.message || "").toLowerCase();
      if (lowerCaseError.includes("invalid") || lowerCaseError.includes("expired")) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl mb-4">
              <ExclamationCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h1>
            <p className="text-gray-600 mt-1">This password reset link is no longer valid</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Reset link expired or invalid</span>
                </div>
                <p className="text-sm text-red-700">
                  Password reset links expire after 30 minutes for security reasons.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">What would you like to do?</p>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                  Request New Reset Link
                </Link>
                
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-600 hover:bg-gray-600 hover:text-white text-gray-600 rounded-lg font-medium transition-colors"
                >
                  Back to Login
                </Link>
                
                <Link
                  to="/"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg font-medium transition-colors"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-600">
                Need help?{" "}
                <a 
                  href="mailto:support@officershostels.com" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-1">Create a new password for your account</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Set New Password
            </h2>
            <p className="text-gray-600 mb-6">
              Enter and confirm your new password below.
            </p>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium">Password Reset Successful</p>
                    <p className="text-green-600 text-sm mt-1">
                      Your password has been updated successfully. You will be redirected to login shortly.
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-green-700 text-center">
                        Redirecting to login in 3 seconds...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Reset Failed</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {!success && tokenValid && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={loading}
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                      disabled={loading}
                      minLength="6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className={`h-3 w-3 mt-0.5 flex-shrink-0 ${
                        password.length >= 6 ? "text-green-500" : "text-gray-400"
                      }`} />
                      <span>At least 6 characters long</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className={`h-3 w-3 mt-0.5 flex-shrink-0 ${
                        password && confirmPassword && password === confirmPassword ? "text-green-500" : "text-gray-400"
                      }`} />
                      <span>Passwords must match</span>
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <ArrowRightIcon className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>

          {/* Information Section */}
          <div className="bg-blue-50 px-8 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <ExclamationCircleIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium mb-1">Security Note</p>
                <p className="text-xs text-gray-600">
                  After resetting, use your new password to login. Old passwords will no longer work.
                </p>
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