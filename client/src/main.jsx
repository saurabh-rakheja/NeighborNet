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
  const hasNGOCapabilities = user?.organization || user?.role === "ngo";
  const hasVolunteerCapabilities =
    user?.skills?.length > 0 || user?.role === "volunteer";

  // If user has both capabilities, show a unified dashboard with both feature sets
  // Otherwise, prioritize the capability they have
  if (hasNGOCapabilities && hasVolunteerCapabilities) {
    console.log("User has both NGO and volunteer capabilities");
    // In the future, we could create a unified dashboard component, but for now use the NGO dashboard
    return <NGODashboard />;
  } else if (hasNGOCapabilities) {
    console.log("User has NGO capabilities");
    return <NGODashboard />;
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
      </Route>

      {/* Auth Routes */}
      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Register />} />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Main dashboard (resolves to NGO or Volunteer dashboard based on role) */}
          <Route path="dashboard" element={<DashboardResolver />} />

          {/* Common routes for both roles */}
          <Route path="dashboard/events" element={<Events />} />
          <Route path="dashboard/events/:id" element={<EventDetail />} />
          <Route path="dashboard/my-shifts" element={<MyShifts />} />

          {/* NGO specific routes */}
          <Route path="dashboard/create-event" element={<CreateEvent />} />
          <Route
            path="dashboard/events/:eventId/shifts/create"
            element={<CreateShift />}
          />
          <Route
            path="dashboard/manage-volunteers"
            element={<VolunteerList />}
          />
          <Route path="dashboard/applications" element={<Applications />} />
          <Route path="dashboard/messages" element={<Messages />} />

          {/* New NGO Routes - Added Components */}
          <Route
            path="dashboard/event-management"
            element={<EventManagement />}
          />
          <Route path="dashboard/analytics" element={<NGOAnalytics />} />

          {/* Volunteer specific routes */}
          <Route
            path="dashboard/volunteer-profile"
            element={<VolunteerProfile />}
          />
          <Route path="dashboard/impact" element={<VolunteerImpact />} />
          <Route path="dashboard/skills" element={<Skills />} />
          <Route path="dashboard/certificates" element={<Certificates />} />
          <Route path="dashboard/training" element={<Training />} />

          {/* New Volunteer Routes - Added Components */}
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
