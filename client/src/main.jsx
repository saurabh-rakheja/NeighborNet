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
import ForgotPassword from "./components/pages/auth/ForgotPassword";
import ResetPassword from "./components/pages/auth/ResetPassword";
import AuthLayout from "./components/pages/auth/AuthLayout";
import DashboardLayout from "./components/pages/layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingLayout from "./components/pages/layouts/LandingLayout";

// Public pages
import PublicEvents from "./components/pages/public/PublicEvents";
import PublicEventDetails from "./components/pages/public/EventDetails";

// Dashboard components
import Events from "./components/pages/dashboard/volunteer/Events";
import EventDetail from "./components/pages/dashboard/volunteer/EventDetail";
import VolunteerProfile from "./components/pages/dashboard/volunteer/VolunteerProfile";
import VolunteerImpact from "./components/pages/dashboard/volunteer/VolunteerImpact";
import AdminPanel from "./components/pages/dashboard/admin/AdminPanel";
import VolunteerList from "./components/pages/dashboard/admin/VolunteerList";
import VolunteerOnboarding from "./components/pages/onboarding/VolunteerOnboarding";
import VolunteerSettings from "./components/pages/dashboard/volunteer/VolunteerSettings";
import HelpCenter from "./components/pages/dashboard/volunteer/HelpCenter";

import AdminReports from "./components/pages/dashboard/admin/AdminReports";

// New components we've added
import OpportunitySearch from "./components/pages/dashboard/volunteer/OpportunitySearch";
import MyApplications from "./components/pages/dashboard/volunteer/MyApplications";

// Role-specific dashboards
import NGODashboard from "./components/pages/dashboard/NGODashboard";
import VolunteerDashboard from "./components/pages/dashboard/volunteer/VolunteerDashboard";

// Auth store for role-based routing
import useAuthStore from "./store/authStore";

// Dashboard resolver component to redirect based on user capabilities
const DashboardResolver = () => {
  const { user } = useAuthStore.getState();

  console.log("Current user data:", user);

  // Check for NGO and volunteer capabilities based on user data
  const hasNGOCapabilities =
    user?.ngoInfo?.organization || user?.role === "ngo";

  // If user has NGO capabilities, redirect to the appropriate dashboard
  if (hasNGOCapabilities) {
    console.log("User has NGO capabilities, redirecting to NGO dashboard");
    return <Navigate to="/ngo-dashboard" replace />;
  } else {
    console.log("User has volunteer capabilities or no specific capabilities");
    return <VolunteerDashboard />;
  }
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public Routes */}
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="events" element={<PublicEvents />} />
        <Route path="events/:id" element={<PublicEventDetails />} />
      </Route>

      {/* Auth Routes */}
      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
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

          {/* Volunteer specific routes */}
          <Route path="dashboard/profile" element={<VolunteerProfile />} />
          <Route path="dashboard/impact" element={<VolunteerImpact />} />
          <Route
            path="dashboard/find-opportunities"
            element={<OpportunitySearch />}
          />
          <Route path="dashboard/applications" element={<MyApplications />} />
          <Route path="dashboard/settings" element={<VolunteerSettings />} />
          <Route path="dashboard/help" element={<HelpCenter />} />

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
