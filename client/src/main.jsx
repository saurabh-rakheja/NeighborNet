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
import Dashboard from "./components/pages/dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingLayout from "./components/pages/layouts/LandingLayout";
import Events from "./components/pages/dashboard/Events";
import EventDetail from "./components/pages/dashboard/EventDetail";
import VolunteerProfile from "./components/pages/dashboard/VolunteerProfile";
import AdminPanel from "./components/pages/dashboard/AdminPanel";
import MyShifts from "./components/pages/dashboard/MyShifts";
import CreateEvent from "./components/pages/dashboard/CreateEvent";
import CreateShift from "./components/pages/dashboard/CreateShift";
import VolunteerList from "./components/pages/dashboard/VolunteerList";
import AdminReports from "./components/pages/dashboard/AdminReports";

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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/events" element={<Events />} />
          <Route path="dashboard/events/create" element={<CreateEvent />} />
          <Route path="dashboard/events/:id" element={<EventDetail />} />
          <Route path="dashboard/events/:eventId/shifts/create" element={<CreateShift />} />
          <Route path="dashboard/volunteer-profile" element={<VolunteerProfile />} />
          <Route path="dashboard/admin" element={<AdminPanel />} />
          <Route path="dashboard/admin/volunteers" element={<VolunteerList />} />
          <Route path="dashboard/admin/reports" element={<AdminReports />} />
          <Route path="dashboard/my-shifts" element={<MyShifts />} />
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
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
  </StrictMode>
);
