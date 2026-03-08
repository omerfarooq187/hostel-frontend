import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  LockClosedIcon,
  CheckCircleIcon,
  EnvelopeOpenIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [resending, setResending] = useState(false);

  // CNIC validation - only numbers, max 13 digits
  const handleCnicChange = (e) => {
    const value = e.target.value;
    // Allow only digits
    if (value === "" || /^\d+$/.test(value)) {
      // Limit to 13 digits
      if (value.length <= 13) {
        setCnic(value);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setVerificationSent(false);

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

    // CNIC validation
    if (cnic.length !== 13) {
      setError("CNIC must be exactly 13 digits");
      setLoading(false);
      return;
    }

    try {
      // Backend returns: { "message": "Account created. Please verify your email" }
      const response = await api.post("/api/auth/signup", { 
        name, 
        email,
        cnic,
        password 
      });
      
      setVerificationSent(true);
      setSuccess(response.data?.message || "Verification email sent! Please check your inbox.");
      
    } catch (err) {
      // Handle JSON error response: { "message": "Email already registered" }
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object' && errorData.message) {
        setError(errorData.message);
      } else if (typeof errorData === 'string') {
        setError(errorData);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setError("");
    
    try {
      // Backend returns: { "message": "Verification email resent" }
      const response = await api.post("/api/auth/resend-verification", { email });
      setSuccess(response.data?.message || "Verification email resent! Please check your inbox.");
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
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl mb-4">
            <BuildingOfficeIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join Officers Group of Hostels</h1>
          <p className="text-gray-600 mt-1">Create your account</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {verificationSent ? "Check Your Email" : "Create Account"}
            </h2>
            <p className="text-gray-600 mb-6">
              {verificationSent 
                ? "We've sent a verification link to your email" 
                : "Register to request hostel accommodation"}
            </p>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium">Registration Successful</p>
                    <p className="text-green-600 text-sm mt-1">{success}</p>
                    
                    {verificationSent && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <EnvelopeOpenIcon className="h-4 w-4" />
                          <span>Check your email inbox</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <ExclamationCircleIcon className="h-4 w-4" />
                          <span>Link expires in 24 hours</span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600">
                              Didn't receive email?
                            </span>
                            <button
                              onClick={handleResendVerification}
                              disabled={resending}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {resending ? (
                                <>
                                  <ArrowPathIcon className="h-3 w-3 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <EnvelopeIcon className="h-3 w-3" />
                                  Resend Email
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <LockClosedIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Registration Failed</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {!verificationSent && (
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

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
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* CNIC Field - Updated with validation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNIC (13 digits)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <IdentificationIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0000000000000"
                      value={cnic}
                      onChange={handleCnicChange}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                      disabled={loading}
                      maxLength={13}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Enter 13 digits without dashes
                    </p>
                    <p className={`text-xs ${cnic.length === 13 ? 'text-green-600' : 'text-orange-600'}`}>
                      {cnic.length}/13 digits
                    </p>
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
                      minLength="6"
                      disabled={loading}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      required
                      minLength="6"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Terms Note */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Important Notes:</p>
                    <ul className="space-y-2 text-xs text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>You'll receive a verification email immediately</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>Verification link expires in 24 hours</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircleIcon className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>Account requires admin approval after email verification</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Register Account
                      <ArrowRightIcon className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
                >
                  Sign In
                </Link>
              </p>
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