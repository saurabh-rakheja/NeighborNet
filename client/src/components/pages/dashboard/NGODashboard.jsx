import React, { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiBarChart2,
  FiBriefcase,
  FiSettings,
  FiPlus,
  FiGrid,
  FiClock,
  FiHelpCircle,
  FiMessageSquare,
  FiBell,
} from "react-icons/fi";

// Import NGO specific components
import NGOAnalytics from "./ngo/NGOAnalytics";
import NGOEventManagement from "./ngo/NGOEventManagement";
import VolunteerManagement from "./ngo/VolunteerManagement";
import ManageEvents from "./ngo/ManageEvents";
import CreateEvent from "./ngo/CreateEvent";

// Placeholder components for features not yet implemented
const Applications = () => (
  <div className="p-8 text-center text-gray-600">
    Volunteer Applications (Coming Soon)
  </div>
);

const Messages = () => (
  <div className="p-8 text-center text-gray-600">
    Messaging Center (Coming Soon)
  </div>
);

const OpportunityManagement = () => (
  <div className="p-8 text-center text-gray-600">
    Opportunity Management (Coming Soon)
  </div>
);

const NGOSettings = () => (
  <div className="p-8 text-center text-gray-600">
    NGO Settings (Coming Soon)
  </div>
);

const EventDetail = () => (
  <div className="p-8 text-center text-gray-600">
    Event Details (Coming Soon)
  </div>
);

const EditEvent = () => (
  <div className="p-8 text-center text-gray-600">
    Edit Event (Coming Soon)
  </div>
);

const CreateShift = () => (
  <div className="p-8 text-center text-gray-600">
    Create Shift (Coming Soon)
  </div>
);

const NGODashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalHours: 0,
    activeVolunteers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    // Set active tab based on the current path
    const path = location.pathname.split("/").pop();
    if (path === "ngo-dashboard") {
      setActiveTab("home");
    } else {
      setActiveTab(path);
    }

    // Fetch NGO dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/ngo/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [location.pathname]);

  const navItems = [
    { name: "Home", path: "/ngo-dashboard", icon: <FiHome />, id: "home" },
    { name: "Events", path: "/ngo-dashboard/events", icon: <FiCalendar />, id: "events" },
    { name: "Volunteers", path: "/ngo-dashboard/volunteers", icon: <FiUsers />, id: "volunteers" },
    { name: "Impact Analytics", path: "/ngo-dashboard/analytics", icon: <FiBarChart2 />, id: "analytics" },
    { name: "Opportunities", path: "/ngo-dashboard/opportunities", icon: <FiBriefcase />, id: "opportunities" },
    { name: "Applications", path: "/ngo-dashboard/applications", icon: <FiGrid />, id: "applications" },
    { name: "Messages", path: "/ngo-dashboard/messages", icon: <FiMessageSquare />, id: "messages" },
    { name: "Settings", path: "/ngo-dashboard/settings", icon: <FiSettings />, id: "settings" },
  ];

  // Handler to navigate to different dashboard sections
  const handleNavigation = (path, id) => {
    navigate(path);
    setActiveTab(id);
  };

  // Main NGO Dashboard Home content
  const DashboardHome = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome, {user?.ngoInfo?.organization || user?.name}!
            </h1>
            <p className="opacity-90 mt-1">
              Manage your events, volunteers, and track your organization's impact
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => navigate("/ngo-dashboard/events/create")}
              className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg shadow font-medium transition-colors flex items-center"
            >
              <FiPlus className="mr-2" /> Create Event
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Volunteers</h3>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FiUsers />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : stats.totalVolunteers}
          </p>
          <p className="text-xs text-green-500 flex items-center mt-1">
            <span className="block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
            Active community
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Active Volunteers</h3>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <FiUsers />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : stats.activeVolunteers}
          </p>
          <p className="text-xs text-blue-500 flex items-center mt-1">
            <span className="block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
            Currently engaged
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <FiCalendar />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : stats.totalEvents}
          </p>
          <p className="text-xs text-gray-500 mt-1">All-time events</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Upcoming Events</h3>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <FiCalendar />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : stats.upcomingEvents}
          </p>
          <p className="text-xs text-purple-500 flex items-center mt-1">
            <span className="block w-2 h-2 rounded-full bg-purple-500 mr-1"></span>
            Scheduled
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Volunteer Hours</h3>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <FiClock />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : stats.totalHours}
          </p>
          <p className="text-xs text-red-500 flex items-center mt-1">
            <span className="block w-2 h-2 rounded-full bg-red-500 mr-1"></span>
            Total contribution
          </p>
        </div>
      </div>

      {/* Recent Events & Activities Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent & Upcoming Events */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent & Upcoming Events</h2>
            <Link
              to="/ngo-dashboard/events"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* This would be populated with actual events */}
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-medium text-gray-800">Community Cleanup</p>
                <p className="text-sm text-gray-500">Tomorrow, 9:00 AM - 12:00 PM</p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    12/20 volunteers
                  </span>
                </div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium text-gray-800">Food Drive</p>
                <p className="text-sm text-gray-500">Jun 15, 2:00 PM - 5:00 PM</p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    8/15 volunteers
                  </span>
                </div>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <p className="font-medium text-gray-800">Homeless Shelter Support</p>
                <p className="text-sm text-gray-500">Jun 20, 6:00 PM - 9:00 PM</p>
                <div className="mt-2 flex items-center text-sm">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                    5/10 volunteers
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Volunteer Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Volunteer Activity</h2>
            <Link
              to="/ngo-dashboard/volunteers"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* This would be populated with actual volunteer activities */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    JD
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    John Doe signed up for Community Cleanup
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    AS
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Alice Smith completed 4 hours at Food Bank
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    BJ
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Bob Johnson sent a message about Neighborhood Watch
                  </p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/ngo-dashboard/events/create")}
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center"
          >
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-2">
              <FiCalendar className="text-xl" />
            </div>
            <span className="text-sm font-medium text-gray-800">Create Event</span>
          </button>

          <button
            onClick={() => navigate("/ngo-dashboard/opportunities/create")}
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center"
          >
            <div className="p-3 bg-green-100 rounded-full text-green-600 mb-2">
              <FiBriefcase className="text-xl" />
            </div>
            <span className="text-sm font-medium text-gray-800">Post Opportunity</span>
          </button>

          <button
            onClick={() => navigate("/ngo-dashboard/volunteers/message")}
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center"
          >
            <div className="p-3 bg-purple-100 rounded-full text-purple-600 mb-2">
              <FiMessageSquare className="text-xl" />
            </div>
            <span className="text-sm font-medium text-gray-800">Message Volunteers</span>
          </button>

          <button
            onClick={() => navigate("/ngo-dashboard/analytics")}
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-colors flex flex-col items-center justify-center text-center"
          >
            <div className="p-3 bg-yellow-100 rounded-full text-yellow-600 mb-2">
              <FiBarChart2 className="text-xl" />
            </div>
            <span className="text-sm font-medium text-gray-800">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="lg:w-64 bg-white border-r border-gray-200 lg:min-h-screen">
        <div className="p-4 border-b border-gray-200 flex items-center justify-center lg:justify-start">
          <span className="text-xl font-bold text-blue-600">NGO Dashboard</span>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path, item.id)}
                  className={`flex items-center w-full p-3 rounded-lg text-sm ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/analytics" element={<NGOAnalytics />} />
          <Route path="/events" element={<NGOEventManagement />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/volunteers" element={<VolunteerManagement />} />
          <Route path="/manage-events" element={<ManageEvents />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/opportunities" element={<OpportunityManagement />} />
          <Route path="/settings" element={<NGOSettings />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/edit/:id" element={<EditEvent />} />
          <Route path="/events/:eventId/shifts/create" element={<CreateShift />} />
          <Route path="*" element={<DashboardHome />} />
        </Routes>
      </div>
    </div>
  );
};

export default NGODashboard; 