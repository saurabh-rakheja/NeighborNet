import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoute = () => {
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuthStatus();
      setIsChecking(false);
    };

    verifyAuth();
  }, [checkAuthStatus]);

  // Show loading state while checking auth status
  if (isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto w-12 h-12 border-4 border-indigo-200 rounded-full border-t-indigo-600 animate-spin"></div>
          <p className="text-gray-500">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for post-login redirect
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
