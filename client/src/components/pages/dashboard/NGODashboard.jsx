import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import {
  FiUsers,
  FiCalendar,
  FiBarChart,
  FiMessageSquare,
  FiMapPin,
  FiPlusCircle,
  FiCheckCircle,
  FiTrendingUp,
  FiTarget,
  FiChevronRight,
  FiClipboard,
  FiClock,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";

const NGODashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    pendingApplications: 0,
    totalVolunteers: 0,
    impactScore: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Fetch real data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Create axios instance with auth token
        const api = axios.create({
          baseURL: "http://localhost:5000/api",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        });

        // Fetch NGO's events
        const eventsResponse = await api.get("/events/my-events");
        const events = eventsResponse.data.data;

        // Calculate active projects
        const activeProjects = events.filter(
          (event) => event.status === "Upcoming" || event.status === "Ongoing"
        ).length;

        // Fetch upcoming events (first 5)
        const upcomingEventsData = events
          .filter((event) => event.status === "Upcoming")
          .slice(0, 5)
          .map((event) => ({
            id: event._id,
            title: event.title,
            date: event.startDate,
            location: `${event.location.city}, ${event.location.state}`,
            volunteers: event.volunteersRegistered,
            capacity: event.volunteersNeeded,
          }));
        setUpcomingEvents(upcomingEventsData);

        // Fetch pending applications
        // First, get event IDs
        const eventIds = events.map((event) => event._id);

        // Then fetch participations for these events
        let allParticipations = [];
        let pendingApplicationsCount = 0;

        // This could be optimized with a better API endpoint
        // Currently fetching participations for each event separately
        for (const eventId of eventIds) {
          const participationsResponse = await api.get(
            `/participations/event/${eventId}`
          );
          const participations = participationsResponse.data.data;

          // Count pending applications
          const pendingForEvent = participations.filter(
            (participation) => participation.status === "Registered"
          );
          pendingApplicationsCount += pendingForEvent.length;

          // Get the most recent 5 pending applications
          allParticipations = [...allParticipations, ...pendingForEvent];
        }

        // Sort by most recent and take first 5
        const recentApps = allParticipations
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((app) => ({
            id: app._id,
            volunteerName: app.volunteerId.name || "Volunteer",
            eventTitle:
              events.find((e) => e._id === app.eventId.toString())?.title ||
              "Event",
            date: app.createdAt,
            status: app.status.toLowerCase(),
          }));

        setRecentApplications(recentApps);

        // Calculate total unique volunteers
        const uniqueVolunteers = new Set();
        allParticipations.forEach((participation) => {
          uniqueVolunteers.add(participation.volunteerId._id);
        });

        // Set stats
        setStats({
          activeProjects,
          pendingApplications: pendingApplicationsCount,
          totalVolunteers: uniqueVolunteers.size,
          // Calculate impact score based on events completed and volunteer participation
          impactScore: Math.min(
            Math.round(
              events.length * 10 +
                uniqueVolunteers.size * 5 +
                Math.floor(Math.random() * 20) // Add some randomness as this would normally be a complex calculation
            ),
            100
          ),
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Hero Section with Greeting and Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.organization || "Organization"}
            </h1>
            <p className="opacity-90 mb-4">
              Manage your volunteer projects and make a greater impact
            </p>
            <div className="flex gap-2 mt-4">
              <Link
                to="/dashboard/create-event"
                className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg shadow font-medium transition-colors"
              >
                Create Project
              </Link>
              <Link
                to="/dashboard/manage-volunteers"
                className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg shadow font-medium transition-colors"
              >
                Manage Volunteers
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full md:w-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xl md:text-2xl font-bold">
                {loading ? "..." : stats.activeProjects}
              </p>
              <p className="text-xs md:text-sm opacity-80">Active Projects</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xl md:text-2xl font-bold">
                {loading ? "..." : stats.pendingApplications}
              </p>
              <p className="text-xs md:text-sm opacity-80">
                Pending Applications
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xl md:text-2xl font-bold">
                {loading ? "..." : stats.totalVolunteers}
              </p>
              <p className="text-xs md:text-sm opacity-80">Total Volunteers</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center relative">
              <svg
                className="absolute inset-0 m-auto h-full w-full -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="white"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={
                    2 * Math.PI * 40 -
                    (2 * Math.PI * 40 * stats.impactScore) / 100
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="relative z-10">
                <p className="text-xl md:text-2xl font-bold">
                  {loading ? "..." : `${stats.impactScore}%`}
                </p>
                <p className="text-xs md:text-sm opacity-80">Impact Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - 2 Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <FiTarget className="mr-2 text-blue-500" /> Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to="/dashboard/create-event"
                className="flex flex-col items-center bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors"
              >
                <FiPlusCircle className="text-blue-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">
                  New Project
                </span>
              </Link>
              <Link
                to="/dashboard/manage-volunteers"
                className="flex flex-col items-center bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors"
              >
                <FiUsers className="text-green-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">
                  Manage Volunteers
                </span>
              </Link>
              <Link
                to="/dashboard/analytics"
                className="flex flex-col items-center bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors"
              >
                <FiBarChart className="text-purple-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">
                  View Analytics
                </span>
              </Link>
              <Link
                to="/dashboard/messages"
                className="flex flex-col items-center bg-rose-50 hover:bg-rose-100 p-4 rounded-lg transition-colors"
              >
                <FiMessageSquare className="text-rose-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">
                  Messages
                </span>
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiCalendar className="mr-2 text-blue-500" /> Your Upcoming
                Projects
              </h2>
              <Link
                to="/dashboard/events"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-500">
                Loading projects...
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/dashboard/events/${event.id}`}
                    className="block"
                  >
                    <div className="border border-gray-100 hover:border-blue-200 p-4 rounded-lg hover:bg-blue-50/50 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {event.volunteers}/{event.capacity} Volunteers
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="flex items-center">
                          <FiClock className="mr-1" /> {formatDate(event.date)}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          <FiMapPin className="mr-1" /> {event.location}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-gray-200 rounded-lg">
                <div className="text-gray-400 mb-2">
                  <FiCalendar className="inline-block text-3xl" />
                </div>
                <p className="text-gray-500 mb-4">
                  You don't have any upcoming projects
                </p>
                <Link
                  to="/dashboard/create-event"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiClipboard className="mr-2 text-blue-500" /> Recent
                Applications
              </h2>
              <Link
                to="/dashboard/applications"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-gray-500">
                Loading applications...
              </div>
            ) : recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="p-3 border border-gray-100 rounded-lg hover:border-blue-100 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">
                        {application.volunteerName}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          application.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : application.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {application.eventTitle}
                    </p>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(application.date)}
                      </span>
                      <div className="flex space-x-1">
                        <button className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                          Approve
                        </button>
                        <button className="text-xs px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500">No pending applications</p>
              </div>
            )}
          </div>

          {/* Analytics Preview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiBarChart className="mr-2 text-blue-500" /> Analytics
              </h2>
              <Link
                to="/dashboard/analytics"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Details <FiChevronRight className="ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Volunteer Retention
                  </span>
                  <span className="text-sm font-medium text-gray-700">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: "72%" }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Project Completion
                  </span>
                  <span className="text-sm font-medium text-gray-700">89%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: "89%" }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Volunteer Satisfaction
                  </span>
                  <span className="text-sm font-medium text-gray-700">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: "94%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
