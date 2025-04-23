import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiAlertCircle, FiCheck, FiLock } from "react-icons/fi";
import useAuthStore from "../../../store/authStore";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { isLoading, error, resetPassword, clearError } = useAuthStore();

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Redirect to login after successful reset
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const validateForm = () => {
    const errors = {};

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      // Reset password with token
      const response = await resetPassword(token, password);

      if (response.success) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Password reset failed:", err);
    }
  };

  return (
    <div className="max-w-md w-full p-6 bg-white/90 backdrop-blur-lg shadow-xl rounded-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          {success ? "Password Reset Successful" : "Reset Your Password"}
        </h1>
        <p className="text-gray-600">
          {success
            ? "Your password has been successfully reset."
            : "Please enter a new password for your account."}
        </p>
      </div>

      {success ? (
        <div className="mb-6 p-4 bg-green-50/80 text-green-700 text-sm rounded-xl border border-green-200 flex items-start">
          <FiCheck className="mr-2 flex-shrink-0 text-xl mt-0.5" />
          <div>
            <p className="font-medium">Password reset complete</p>
            <p className="mt-1">
              Your password has been reset successfully. You will be redirected
              to the login page.
            </p>
          </div>
        </div>
      ) : (
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
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 border ${
                    validationErrors.password
                      ? "border-red-500"
                      : "border-gray-200"
                  } bg-white/70 backdrop-blur-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
                  placeholder="Enter new password"
                />
                <FiLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {validationErrors.password && (
                <div className="mt-2 text-sm text-red-600">
                  {validationErrors.password}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 border ${
                    validationErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-200"
                  } bg-white/70 backdrop-blur-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
                  placeholder="Confirm new password"
                />
                <FiLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {validationErrors.confirmPassword && (
                <div className="mt-2 text-sm text-red-600">
                  {validationErrors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </>
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

export default ResetPassword;
