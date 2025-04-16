import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LandingPage from "./components/pages/LandingPage";
import Login from "./components/pages/auth/Login";
import Register from "./components/pages/auth/Register";
import AuthLayout from "./components/pages/auth/AuthLayout";
import DashboardLayout from "./components/pages/layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingLayout from "./components/pages/layouts/LandingLayout";

// Dashboard components
import Events from "./components/pages/dashboard/Events";
import EventDetail from "./components/pages/dashboard/EventDetail";
import VolunteerProfile from "./components/pages/dashboard/VolunteerProfile";
import VolunteerImpact from "./components/pages/dashboard/VolunteerImpact";
import AdminPanel from "./components/pages/dashboard/AdminPanel";
import MyShifts from "./components/pages/dashboard/MyShifts";
import CreateEvent from "./components/pages/dashboard/CreateEvent";
import CreateShift from "./components/pages/dashboard/CreateShift";
import VolunteerList from "./components/pages/dashboard/VolunteerList";

import AdminReports from "./components/pages/dashboard/AdminReports";

// New components we've added
import EventManagement from "./components/pages/dashboard/EventManagement";
import OpportunitySearch from "./components/pages/dashboard/OpportunitySearch";
import NGOAnalytics from "./components/pages/dashboard/ngo/NGOAnalytics";

// Role-specific dashboards
import NGODashboard from "./components/pages/dashboard/NGODashboard";
import VolunteerDashboard from "./components/pages/dashboard/VolunteerDashboard";

// Auth store for role-based routing
import useAuthStore from "./store/authStore";

// Placeholder components for features not yet implemented
const Applications = () => (
  <div className="p-8 text-center text-gray-600">
    Volunteer Applications (Coming Soon)
  </div>
);
const Skills = () => (
  <div className="p-8 text-center text-gray-600">
    Skills Development (Coming Soon)
  </div>
);
const Certificates = () => (
  <div className="p-8 text-center text-gray-600">
    Certificates & Badges (Coming Soon)
  </div>
);
const Training = () => (
  <div className="p-8 text-center text-gray-600">
    Training Programs (Coming Soon)
  </div>
);
const Messages = () => (
  <div className="p-8 text-center text-gray-600">
    Messaging Center (Coming Soon)
  </div>
);

// Dashboard resolver component to redirect based on user capabilities
const DashboardResolver = () => {
  const { user } = useAuthStore.getState();

  console.log("Current user data:", user);

  // Check for NGO and volunteer capabilities based on user data
  const hasNGOCapabilities = 
    user?.ngoInfo?.organization || 
    user?.role === "ngo";
    
  const hasVolunteerCapabilities =
    user?.volunteerInfo?.skills?.length > 0 || 
    user?.role === "volunteer";

  // If user has both capabilities, redirect to the appropriate dashboard
  // Otherwise, prioritize the capability they have
  if (hasNGOCapabilities) {
    console.log("User has NGO capabilities, redirecting to NGO dashboard");
    return <Navigate to="/ngo-dashboard" replace />;
  } else {
    console.log("User has volunteer capabilities or no specific capabilities");
    return <VolunteerDashboard />;
  }
};

import VolunteerOnboarding from "./components/pages/onboarding/VolunteerOnboarding";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public Routes */}
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Register />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        {/* NGO Dashboard with its own layout and child routes */}
        <Route path="ngo-dashboard/*" element={<NGODashboard />} />
        
        {/* Standard Dashboard Layout for Volunteer */}
        <Route element={<DashboardLayout />}>
          {/* Main dashboard (resolves to Volunteer dashboard since NGO users are redirected) */}
          <Route path="dashboard" element={<DashboardResolver />} />

          {/* Common routes */}
          <Route path="dashboard/events" element={<Events />} />
          <Route path="dashboard/events/:id" element={<EventDetail />} />
          <Route path="dashboard/my-shifts" element={<MyShifts />} />

          {/* Volunteer specific routes */}
          <Route
            path="dashboard/profile"
            element={<VolunteerProfile />}
          />
          <Route path="dashboard/impact" element={<VolunteerImpact />} />
          <Route path="dashboard/skills" element={<Skills />} />
          <Route path="dashboard/certificates" element={<Certificates />} />
          <Route path="dashboard/training" element={<Training />} />
          <Route
            path="dashboard/find-opportunities"
            element={<OpportunitySearch />}
          />

          {/* Admin routes */}
          <Route path="dashboard/admin" element={<AdminPanel />} />
          <Route
            path="dashboard/admin/volunteers"
            element={<VolunteerList />}
          />
          <Route path="dashboard/admin/reports" element={<AdminReports />} />

          <Route path="onboarding" element={<VolunteerOnboarding />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
    />
  </StrictMode>
);
