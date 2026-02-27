import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  HomeIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function VerifyEmail() {
  const { token: paramToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  // Extract token from URL parameters OR query parameters
  const getToken = () => {
    // First try URL parameter (e.g., /verify-email/:token)
    if (paramToken) {
      return paramToken;
    }
    
    // Then try query parameter (e.g., /verify-email?token=...)
    const searchParams = new URLSearchParams(location.search);
    const queryToken = searchParams.get('token');
    if (queryToken) {
      return queryToken;
    }
    
    return null;
  };

  const token = getToken();

  useEffect(() => {
    if (!token) {
      setError("Verification link is invalid. No token found.");
      setLoading(false);
      return;
    }
    
    verifyToken(token);
  }, [token]);

  const verifyToken = async (tokenToVerify) => {
    try {
      // Clean the token - remove any trailing query parameters
      const cleanToken = tokenToVerify.split('?')[0];
      
      const response = await api.get(`/api/auth/verify-email/${cleanToken}`);
      // Backend returns: { "message": "...", "email": "..." }
      const { message, email: userEmail } = response.data;
      
      setSuccess(true);
      setVerificationMessage(message);
      setLoading(false);
      
      // Store email for resend option
      if (userEmail) {
        setEmail(userEmail);
      }
      
      // Auto redirect to login after 5 seconds
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            message: "Email verified successfully! You can now login." 
          } 
        });
      }, 5000);
      
    } catch (err) {
      // Handle JSON error response: { "message": "error message" }
      const errorData = err.response?.data;
      if (errorData && typeof errorData === 'object' && errorData.message) {
        setError(errorData.message);
      } else if (typeof errorData === 'string') {
        setError(errorData);
      } else {
        setError("Verification failed. The link may be expired or invalid.");
      }
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Email address is required to resend verification");
      return;
    }

    setResending(true);
    setError("");
    
    try {
      const response = await api.post("/api/auth/resend-verification", { email });
      // Backend returns: { "message": "Verification email resent" }
      setVerificationMessage(response.data?.message || "Verification email resent");
      setSuccess(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <ArrowPathIcon className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Verifying Email</h2>
          <p className="text-gray-600">Please wait while we verify your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
            success ? "bg-green-100" : "bg-red-100"
          }`}>
            {success ? (
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            ) : (
              <XCircleIcon className="h-10 w-10 text-red-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {success ? "Email Verified!" : "Verification Failed"}
          </h1>
          
          <p className="text-gray-600 mb-8">
            {success ? verificationMessage || "Your email has been successfully verified." : error}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      {verificationMessage || "Email verified successfully"}
                    </span>
                  </div>
                  {email && (
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700">Verified email: {email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <ExclamationCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700">Account pending admin approval</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                  Go to Login
                </Link>
                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-600 hover:bg-gray-600 hover:text-white text-gray-600 rounded-lg font-medium transition-colors"
                >
                  <HomeIcon className="h-5 w-5" />
                  Back to Home
                </Link>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 text-center">
                  Redirecting to login in 5 seconds...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-800">Verification failed</span>
                  </div>
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">What would you like to do?</p>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {resending ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="h-5 w-5" />
                        Try Resend Verification
                      </>
                    )}
                  </button>
                  
                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-600 hover:bg-gray-600 hover:text-white text-gray-600 rounded-lg font-medium transition-colors"
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                    Register Again
                  </Link>
                  
                  <Link
                    to="/"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 rounded-lg font-medium transition-colors"
                  >
                    <HomeIcon className="h-5 w-5" />
                    Back to Homepage
                  </Link>
                </div>
              </div>
            </div>
          )}

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