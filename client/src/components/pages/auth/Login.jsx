import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiArrowRight, FiAlertCircle } from "react-icons/fi";
import useAuthStore from "../../../store/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Get auth store
  const { isLoading, error, login, isAuthenticated, clearError } =
    useAuthStore();

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const validateForm = () => {
    const errors = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
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
      // Pass email, password to login
      const response = await login(email, password);

      // Navigation is handled by the effect above
      if (!response.success) {
        console.error("Login failed:", response.message);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col md:flex-row">
      {/* Decorative shapes */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-x-1/4 translate-y-1/4"></div>

      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 relative z-10">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8 text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Sign in to continue to your volunteer dashboard
            </p>
          </div>

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
                    validationErrors.email
                      ? "border-red-500"
                      : "border-gray-200"
                  } bg-white/70 backdrop-blur-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
                  placeholder="name@example.com"
                />
              </div>
              {validationErrors.email && (
                <div className="mt-2 text-sm text-red-600">
                  {validationErrors.email}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
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
                  placeholder="Enter your password"
                />
              </div>
              {validationErrors.password && (
                <div className="mt-2 text-sm text-red-600">
                  {validationErrors.password}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-md"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <Link
                to="/auth/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-medium text-white transition-all duration-300 ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign In
                  <FiArrowRight className="ml-2" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/auth/signup"
                className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors duration-200 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image/Illustration */}
      <div className="hidden md:block w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="max-w-lg text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Make a Meaningful Impact in Your Community
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Connect with volunteering opportunities, track your hours, and see
              the difference you're making - all in one place.
            </p>
            <div className="grid grid-cols-3 gap-5">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">150K+</div>
                <div className="text-white/70 text-sm">Volunteer Hours</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">5,000+</div>
                <div className="text-white/70 text-sm">Events Organized</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">30K+</div>
                <div className="text-white/70 text-sm">Active Volunteers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
