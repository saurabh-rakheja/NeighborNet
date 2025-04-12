import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./components/pages/layouts/MainLayout";
import DashboardLayout from "./components/pages/layouts/DashboardLayout";

// Pages
import LandingPage from "./components/pages/LandingPage";
import Login from "./components/pages/auth/Login";
import Register from "./components/pages/auth/Register";
import AboutUs from "./components/pages/AboutUs";
import ContactUs from "./components/pages/ContactUs";
import NotFound from "./components/pages/NotFound";

// Dashboard Pages
import Dashboard from "./components/pages/dashboard/Dashboard";
import NGODashboard from "./components/pages/dashboard/NGODashboard";
import VolunteerDashboard from "./components/pages/dashboard/VolunteerDashboard";
import Events from "./components/pages/dashboard/Events";
import EventDetail from "./components/pages/dashboard/EventDetail";
import MyShifts from "./components/pages/dashboard/MyShifts";
import CreateEvent from "./components/pages/dashboard/CreateEvent";

// Auth
import useAuthStore from "./store/authStore";

// Component Placeholders for future implementation
const ManageVolunteers = () => <div>Manage Volunteers (Coming Soon)</div>;
const Analytics = () => <div>Analytics (Coming Soon)</div>;
const Applications = () => <div>Applications (Coming Soon)</div>;
const Skills = () => <div>Skills Development (Coming Soon)</div>;
const Certificates = () => <div>Certificates (Coming Soon)</div>;
const Training = () => <div>Training (Coming Soon)</div>;
const Impact = () => <div>Impact Reporting (Coming Soon)</div>;

// Simple role-based route guard component
const NGORoute = ({ element }) => {
  const { user, isLoading } = useAuthStore();

  // If still loading auth state, show a loading indicator
  if (isLoading) {
    return <div className="p-4 text-center">Checking permissions...</div>;
  }

  // If not authenticated or wrong role, redirect
  if (!user || user.role !== "ngo") {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

// Volunteer-specific route guard
const VolunteerRoute = ({ element }) => {
  const { user, isLoading } = useAuthStore();

  // If still loading auth state, show a loading indicator
  if (isLoading) {
    return <div className="p-4 text-center">Checking permissions...</div>;
  }

  // If not authenticated or wrong role, redirect
  if (!user || user.role !== "volunteer") {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

function App() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    checkAuthStatus,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on application startup
    const initAuth = async () => {
      await checkAuthStatus();
      setIsLoading(false);
    };

    initAuth();
  }, [checkAuthStatus]);

  // Show loading while checking auth
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      {isAuthenticated ? (
        <Routes>
          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Dashboard layout with nested routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />

            {/* Common dashboard routes */}
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="my-shifts" element={<MyShifts />} />

            {/* NGO-specific routes */}
            <Route
              path="create-event"
              element={<NGORoute element={<CreateEvent />} />}
            />
            <Route
              path="manage-volunteers"
              element={<NGORoute element={<ManageVolunteers />} />}
            />
            <Route
              path="analytics"
              element={<NGORoute element={<Analytics />} />}
            />
            <Route
              path="applications"
              element={<NGORoute element={<Applications />} />}
            />

            {/* Volunteer-specific routes */}
            <Route
              path="skills"
              element={<VolunteerRoute element={<Skills />} />}
            />
            <Route
              path="certificates"
              element={<VolunteerRoute element={<Certificates />} />}
            />
            <Route
              path="training"
              element={<VolunteerRoute element={<Training />} />}
            />
            <Route
              path="impact"
              element={<VolunteerRoute element={<Impact />} />}
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      ) : (
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="auth/login" element={<Login />} />
            <Route path="auth/register" element={<Register />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="contact" element={<ContactUs />} />
          </Route>

          {/* Redirect to login if trying to access protected routes */}
          <Route path="/dashboard/*" element={<Navigate to="/auth/login" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
