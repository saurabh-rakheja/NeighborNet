import React, { useState, useEffect } from "react";

import { Link, useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiMail } from "react-icons/fi";
import useAuthStore from "../../../store/authStore";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { isLoading, error, requestPasswordReset, clearError } = useAuthStore();

   const navigate = useNavigate();

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const validateEmail = () => {
    if (!email) {
      setValidationError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateEmail()) {
      return;
    }


    try {
      AuthStore.sen
      useAuthStore.requestPasswordReset(email); // Call the requestPasswordReset function from the store
      // Handle success response here if needed
      setSubmitted(true); // Set submitted to true to show success message
      setEmail(""); // Clear the email input field
      navigate("/auth/login");
    } catch (err) {
      console.error("Password reset request failed:", err);
    }
  };

  return (
    <div className="max-w-md w-full p-6 bg-white/90 backdrop-blur-lg shadow-xl rounded-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          {submitted ? "Check Your Email" : "Forgot Password"}
        </h1>
        <p className="text-gray-600">
          {submitted
            ? "We've sent password reset instructions to your email."
            : "Enter your email address and we'll send you instructions to reset your password."}
        </p>
      </div>

      {!submitted ? (
        <>
          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-sm rounded-xl border border-red-200 flex items-start animate-fadeIn">
              <FiAlertCircle className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3.5 border ${
                    validationError ? "border-red-500" : "border-gray-200"
                  } bg-white/70 backdrop-blur-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
                  placeholder="name@example.com"
                />
                <FiMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {validationError && (
                <div className="mt-2 text-sm text-red-600">
                  {validationError}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </button>
          </form>
        </>
      ) : (
        <div className="mb-6 p-4 bg-green-50/80 text-green-700 text-sm rounded-xl border border-green-200 flex items-start">
          <FiMail className="mr-2 flex-shrink-0 text-xl mt-0.5" />
          <div>
            <p className="font-medium">Check your inbox</p>
            <p className="mt-1">
              We've sent password reset instructions to {email}. If you don't
              see it, please check your spam folder.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-1" /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
