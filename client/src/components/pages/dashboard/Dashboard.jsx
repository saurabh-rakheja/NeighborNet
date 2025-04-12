import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import VolunteerDashboard from "./VolunteerDashboard";
import NGODashboard from "./NGODashboard";

const Dashboard = () => {
  const { user, isLoading } = useAuthStore();

  // Ensure user has completed required profile setup
  useEffect(() => {
    // You could add logic here to check if user has completed required profile steps
    // and redirect to profile completion if needed
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Route to the appropriate dashboard based on user role
  switch (user.role) {
    case "volunteer":
      return <VolunteerDashboard />;
    case "ngo":
      return <NGODashboard />;
    case "admin":
      // If you implement an admin dashboard later, return it here
      return (
        <div className="container mx-auto p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mb-6">
              The admin dashboard is currently under development. Check back
              soon!
            </p>
          </div>
        </div>
      );
    default:
      // Handle case where role is undefined/unknown
      return (
        <div className="container mx-auto p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">
              Welcome to NeighborNet
            </h1>
            <p className="text-gray-600 mb-6">
              Your account type hasn't been configured yet. Please contact
              support.
            </p>
            <a
              href="mailto:support@neighbornet.org"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      );
  }
};

export default Dashboard;
