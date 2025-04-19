import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { FiBell, FiSettings, FiMenu, FiX } from "react-icons/fi";
import useAuthStore from "../../../store/authStore";
import NGOOverview from "./ngo/NGOOverview";
import NGOEvents from "./ngo/NGOEvents";
import NGOVolunteers from "./ngo/NGOVolunteers";
import NGOAnalytics from "./ngo/NGOAnalytics";
import CreateEvent from "./ngo/CreateEvent";
import NGOEventDetails from "./ngo/NGOEventDetails";
import NGOSidebar from "./ngo/NGOSidebar";
import NGOApplications from "./ngo/NGOApplications";
import NGOMessages from "./ngo/NGOMessages";
import VolunteerProfile from "./ngo/VolunteerProfile";
import { useState, useEffect } from "react";

const NGODashboard = () => {
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated and has NGO role
  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
    } else if (user.role !== "ngo" && !user.ngoInfo?.organization) {
      // If user is not an NGO, redirect to volunteer dashboard
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <NGOSidebar
          isMobile={false}
          onToggle={(collapsed) => setSidebarCollapsed(collapsed)}
        />
      </div>

      {/* Mobile header and menu button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b w-full">
        <h1 className="text-xl font-semibold text-indigo-700">NGO Portal</h1>
        <button
          onClick={toggleMobileMenu}
          className="text-gray-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-2"
        >
          {isMobileMenuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 z-30">
            <NGOSidebar
              isMobile={true}
              onToggle={(collapsed) => setSidebarCollapsed(collapsed)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Header */}
        <header className="hidden md:flex bg-white shadow-sm z-10 py-4 px-6 items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-800">
              {user?.ngoInfo?.organization || "NGO Dashboard"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
              <FiBell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
              <FiSettings className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium text-gray-700">
                {user?.name}
              </span>
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                {user?.name?.charAt(0) || "N"}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<NGOOverview />} />
            <Route path="/events" element={<NGOEvents />} />
            <Route path="/events/:id" element={<NGOEventDetails />} />
            <Route path="/events/:id/edit" element={<CreateEvent />} />
            <Route path="/volunteers" element={<NGOVolunteers />} />
            <Route path="/volunteers/:id" element={<VolunteerProfile />} />
            <Route path="/analytics" element={<NGOAnalytics />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/applications" element={<NGOApplications />} />
            <Route path="/messages" element={<NGOMessages />} />
            <Route
              path="/help"
              element={
                <div className="p-8 text-center text-gray-600">
                  Help Center (Coming Soon)
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="p-8 text-center text-gray-600">
                  Settings (Coming Soon)
                </div>
              }
            />
            <Route
              path="*"
              element={<Navigate to="/ngo-dashboard" replace />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default NGODashboard;
