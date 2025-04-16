import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import {
  FiCheckSquare,
  FiArrowRight,
  FiAlertCircle,
  FiUser,
  FiBriefcase,
  FiInfo,
} from "react-icons/fi";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    organization: "",
    country: "India",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  // Get auth store
  const { isLoading, error, register, isAuthenticated, clearError } =
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

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    // If name is being updated and user is an NGO, update organization name too
    if (e.target.name === "name" && formData.role === "ngo") {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: value,
        organization: value,
      }));
    } else {
      setFormData({ ...formData, [e.target.name]: value });
    }

    // Clear validation error when field is modified
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  // Handle role selection with special logic for NGO
  const handleRoleSelect = (role) => {
    if (role === "ngo") {
      // When selecting NGO, use the name as organization name but don't set it directly on formData
      // The backend will handle placing it in the ngoInfo object
      setFormData({ ...formData, role, organization: formData.name });
    } else {
      // For volunteer, clear organization field
      setFormData({ ...formData, role, organization: "" });
    }

    // Clear role error if exists
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (/[<>'"&]/.test(formData.name)) {
      newErrors.name = "Name contains invalid characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    // Organization validation is automatic for NGO

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the Terms of Service";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // For NGO role, ensure organization name is set to name if empty
    if (formData.role === "ngo" && !formData.organization.trim()) {
      setFormData((prev) => ({ ...prev, organization: prev.name }));
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Log form data before submission for debugging
      console.log("Submitting registration data:", {
        ...formData,
        password: "[REDACTED]",
        confirmPassword: "[REDACTED]",
      });

      // We pass the organization field directly - the backend will structure it properly
      // Submit with consolidated data
      const response = await register(formData);

      if (response.success) {
        // Navigation is handled by the effect above
        console.log("Registration successful", response);
        if (formData.role === 'volunteer') {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error("Registration failed:", response.message);
        // Error will be shown from the authStore error state
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Set a local error if the global error state doesn't capture it
      if (!error) {
        setErrors((prev) => ({
          ...prev,
          form: "An unexpected error occurred. Please check your network connection and try again.",
        }));
      }
    }
  };

  // Determine labels and placeholders based on role
  const getFieldConfig = () => {
    if (formData.role === "ngo") {
      return {
        nameLabel: "Organization Name",
        namePlaceholder: "Enter your organization name",
        emailLabel: "Organization Email",
        emailPlaceholder: "org@example.com",
        createButtonText: "Create Organization Account",
      };
    } else {
      return {
        nameLabel: "Full Name",
        namePlaceholder: "Enter your full name",
        emailLabel: "Email Address",
        emailPlaceholder: "name@example.com",
        createButtonText: "Create Volunteer Account",
      };
    }
  };

  const fieldConfig = getFieldConfig();

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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-800 mb-3 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-gray-600">
              {formData.role === "ngo"
                ? "Register your organization to find dedicated volunteers"
                : "Join our volunteer community and start making a difference"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-sm rounded-xl border border-red-200 flex items-start animate-fadeIn">
              <FiAlertCircle className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {errors.form && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 text-sm rounded-xl border border-red-200 flex items-start animate-fadeIn">
              <FiAlertCircle className="mr-2 flex-shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {fieldConfig.nameLabel}
              </label>
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 border ${
                    errors.name ? "border-red-500" : "border-gray-200"
                  } bg-white/70 backdrop-blur-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
                  placeholder={fieldConfig.namePlaceholder}
                />
              </div>
              {errors.name && (
                <div className="mt-2 text-sm text-red-600">{errors.name}</div>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {fieldConfig.emailLabel}
              </label>
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3.5 border ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } bg-white/70 backdrop-blur-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
                  placeholder={fieldConfig.emailPlaceholder}
                />
              </div>
              {errors.email && (
                <div className="mt-2 text-sm text-red-600">{errors.email}</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 border ${
                      errors.password ? "border-red-500" : "border-gray-200"
                    } bg-white/70 backdrop-blur-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
                    placeholder="Create a password"
                  />
                </div>
                {errors.password && (
                  <div className="mt-2 text-sm text-red-600">
                    {errors.password}
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
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3.5 border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-200"
                    } bg-white/70 backdrop-blur-sm rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200`}
                    placeholder="Confirm password"
                  />
                </div>
                {errors.confirmPassword && (
                  <div className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am registering as a:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => handleRoleSelect("volunteer")}
                  className={`cursor-pointer border ${
                    formData.role === "volunteer"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50"
                  } rounded-xl p-3 transition-all duration-200 flex items-center`}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${
                      formData.role === "volunteer"
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-gray-100 text-gray-500"
                    } flex items-center justify-center mr-2`}
                  >
                    <FiUser size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-800">
                      Volunteer
                    </div>
                    <div className="text-xs text-gray-500">
                      Help and contribute
                    </div>
                  </div>
                  {formData.role === "volunteer" && (
                    <div className="ml-auto text-indigo-600">
                      <FiCheckSquare size={16} />
                    </div>
                  )}
                </div>

                <div
                  onClick={() => handleRoleSelect("ngo")}
                  className={`cursor-pointer border ${
                    formData.role === "ngo"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                  } rounded-xl p-3 transition-all duration-200 flex items-center`}
                >
                  <div
                    className={`w-8 h-8 rounded-full ${
                      formData.role === "ngo"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    } flex items-center justify-center mr-2`}
                  >
                    <FiBriefcase size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-800">
                      Organization
                    </div>
                    <div className="text-xs text-gray-500">
                      Need volunteers (uses your name as organization)
                    </div>
                  </div>
                  {formData.role === "ngo" && (
                    <div className="ml-auto text-blue-600">
                      <FiCheckSquare size={16} />
                    </div>
                  )}
                </div>
              </div>
              {errors.role && (
                <div className="mt-2 text-sm text-red-600">{errors.role}</div>
              )}
            </div>
            
            <div className="text-xs text-gray-500 p-2 border border-gray-200 rounded-md bg-gray-50">
              <FiInfo className="inline-block mr-1" /> Your account will be registered with India as the default country.
            </div>

            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-4 w-4 mt-1 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-2 block text-sm text-gray-600"
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <div className="mt-2 text-sm text-red-600">
                {errors.agreeToTerms}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-medium text-white transition-all duration-300 ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : formData.role === "ngo"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center">
                  {fieldConfig.createButtonText}
                  <FiArrowRight className="ml-2" />
                </span>
              )}
            </button>

            {/* Already have an account? */}
            <div className="text-center mt-5">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Hidden in production, useful for dev/test environments */}
            {process.env.NODE_ENV !== "production" && (
              <div className="mt-8 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "http://localhost:5000/api/auth/health-check"
                      );
                      const data = await response.json();
                      alert(
                        `Server status: ${response.status} ${
                          response.statusText
                        }\n\nResponse: ${JSON.stringify(data)}`
                      );
                    } catch (error) {
                      alert(
                        `Server connection failed: ${error.message}\n\nPlease ensure the server is running on http://localhost:5000`
                      );
                    }
                  }}
                  className="text-xs text-gray-500 hover:text-indigo-600"
                >
                  Diagnose Server Connection
                </button>
              </div>
            )}
          </form>
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
              {formData.role === "ngo"
                ? "Find Dedicated Volunteers For Your Cause"
                : "Make a Meaningful Impact in Your Community"}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {formData.role === "ngo"
                ? "Post opportunities, manage volunteers, and track your organization's impact"
                : "Connect with volunteering opportunities, track your hours, and see the difference you're making"}
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

export default Register;
