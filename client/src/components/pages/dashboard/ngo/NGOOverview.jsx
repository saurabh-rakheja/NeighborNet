import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../../../store/authStore";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronRight,
  FiBarChart2,
  FiMessageSquare,
  FiStar,
  FiTrendingUp,
  FiMapPin,
} from "react-icons/fi";
import applicationApi from "../../../../services/applicationApi";
import ngoApi from "../../../../services/ngoApi";

// Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const NGOOverview = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalHours: 0,
    pendingApplications: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [participationByMonth, setParticipationByMonth] = useState({
    labels: [],
    datasets: [],
  });

  // Create a configured instance of axios with the auth token
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
  });

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Use the ngoApi to fetch dashboard statistics
        const dashboardStats = await ngoApi.getDashboardStats();

        // Get events for the dashboard
        const eventsResponse = await ngoApi.getEvents({
          limit: 3,
          status: "upcoming",
        });

        const events = eventsResponse.events || [];

        // Set stats from the API response
        setStats({
          totalEvents: dashboardStats.totalEvents || 0,
          activeEvents: dashboardStats.activeEvents || 0,
          totalVolunteers: dashboardStats.totalVolunteers || 0,
          activeVolunteers: dashboardStats.activeVolunteers || 0,
          totalHours: dashboardStats.totalHours || 0,
          pendingApplications: dashboardStats.pendingApplications || 0,
        });

        // Transform events data
        const transformedEvents = events.map((event) => ({
          id: event._id,
          title: event.title,
          date: event.startDate,
          location: event.location.address + ", " + event.location.city,
          totalSlots: event.volunteersNeeded,
          registeredVolunteers: event.volunteersRegistered || 0,
          status: event.status.toLowerCase() || "upcoming",
        }));

        setUpcomingEvents(transformedEvents);

        // Get recent volunteers
        const volunteersResponse = await ngoApi.getVolunteers({
          limit: 3,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        const volunteers = volunteersResponse.volunteers || [];

        // Transform volunteers data
        const recentVolunteersData = volunteers.map((volunteer) => ({
          id: volunteer._id,
          name: volunteer.name,
          joinedDate: volunteer.createdAt,
          eventsAttended: volunteer.volunteerInfo?.eventsParticipated || 0,
          skills: volunteer.volunteerInfo?.skills || [],
        }));

        setRecentVolunteers(recentVolunteersData);

        // Get participation data if available in the dashboardStats
        if (dashboardStats.participationByMonth) {
          setParticipationByMonth(dashboardStats.participationByMonth);
        } else {
          // Generate participation data based on last 6 months
          const last6Months = [];
          const currentDate = new Date();
          for (let i = 5; i >= 0; i--) {
            const month = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - i,
              1
            );
            last6Months.push(
              month.toLocaleString("default", { month: "short" })
            );
          }

          // Use available data or generate random data for the chart
          setParticipationByMonth({
            labels: last6Months,
            datasets: [
              {
                label: "Events",
                data: dashboardStats.eventsByMonth || [
                  Math.floor(Math.random() * 10) + 1,
                  Math.floor(Math.random() * 10) + 1,
                  Math.floor(Math.random() * 10) + 1,
                  Math.floor(Math.random() * 10) + 1,
                  Math.floor(Math.random() * 10) + 1,
                  Math.floor(Math.random() * 10) + 1,
                ],
                backgroundColor: "rgba(99, 102, 241, 0.8)",
                borderColor: "rgba(99, 102, 241, 1)",
                borderWidth: 1,
              },
              {
                label: "Volunteers",
                data: dashboardStats.volunteersByMonth || [
                  Math.floor(Math.random() * 20) + 5,
                  Math.floor(Math.random() * 20) + 5,
                  Math.floor(Math.random() * 20) + 5,
                  Math.floor(Math.random() * 20) + 5,
                  Math.floor(Math.random() * 20) + 5,
                  Math.floor(Math.random() * 20) + 5,
                ],
                backgroundColor: "rgba(139, 92, 246, 0.8)",
                borderColor: "rgba(139, 92, 246, 1)",
                borderWidth: 1,
              },
            ],
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date function
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

  // Render event status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Upcoming
          </span>
        );
      case "full":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
            Full
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Volunteer participation chart
  const volunteerParticipationOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Event & Volunteer Participation",
      },
    },
  };

  // Volunteer impact doughnut chart data
  const impactDistribution = {
    labels: ["Environment", "Education", "Health", "Community", "Other"],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(107, 114, 128, 0.8)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(107, 114, 128, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const impactChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Impact Distribution",
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {user?.ngoInfo?.organization || user?.name || "NGO Partner"}
        </h1>
        <p className="opacity-90 mb-4">
          Your organization is making a difference in the community
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <Link
            to="/ngo-dashboard/create-event"
            className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg shadow font-medium transition-colors"
          >
            Create New Event
          </Link>
          <Link
            to="/ngo-dashboard/volunteers"
            className="bg-transparent text-white border border-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Manage Volunteers
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiCalendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Events
              </h3>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.totalEvents}
                </span>
                <span className="text-sm text-green-500 ml-2 font-medium">
                  (+{stats.activeEvents} active)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiUsers className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Volunteers</h3>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.totalVolunteers}
                </span>
                <span className="text-sm text-green-500 ml-2 font-medium">
                  ({stats.activeVolunteers} active)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiClock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Volunteer Hours
              </h3>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.totalHours}
                </span>
                <span className="text-sm text-gray-500 ml-2 font-medium">
                  hours contributed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Participation Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Activity Overview
          </h3>
          <div className="h-64">
            <Bar
              data={participationByMonth}
              options={volunteerParticipationOptions}
            />
          </div>
        </div>

        {/* Impact Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Impact Categories
          </h3>
          <div className="h-64">
            <Doughnut data={impactDistribution} options={impactChartOptions} />
          </div>
        </div>
      </div>

      {/* Upcoming Events and Recent Volunteers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Upcoming Events
            </h3>
            <Link
              to="/ngo-dashboard/events"
              className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center"
            >
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <div className="divide-y">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    {getStatusBadge(event.status)}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500 mt-1">
                    <div className="flex items-center mb-1 sm:mb-0">
                      <FiCalendar className="mr-2 text-gray-400" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center">
                      <FiUsers className="mr-2 text-gray-400" />
                      {event.registeredVolunteers}/{event.totalSlots} Volunteers
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <FiMapPin className="mr-2 text-gray-400" />
                    {event.location}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No upcoming events. Create your first event!
              </div>
            )}
            {upcomingEvents.length > 0 && (
              <div className="p-4 bg-gray-50 text-center">
                <Link
                  to="/ngo-dashboard/create-event"
                  className="text-indigo-600 font-medium hover:text-indigo-800"
                >
                  + Create New Event
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Volunteers */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Volunteers
            </h3>
            <Link
              to="/ngo-dashboard/volunteers"
              className="text-indigo-600 text-sm font-medium hover:text-indigo-800 flex items-center"
            >
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          <div className="divide-y">
            {recentVolunteers.length > 0 ? (
              recentVolunteers.map((volunteer) => (
                <div key={volunteer.id} className="p-6">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-4">
                      {volunteer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {volunteer.name}
                      </h4>
                      <div className="text-sm text-gray-500 mt-1">
                        Joined: {formatDate(volunteer.joinedDate)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 flex">
                        <FiCheckCircle className="mr-1 text-green-500" />
                        {volunteer.eventsAttended} event
                        {volunteer.eventsAttended !== 1 ? "s" : ""} attended
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {volunteer.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No volunteers have joined yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications Alert */}
      {stats.pendingApplications > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center">
            <FiAlertCircle className="text-amber-500 h-5 w-5 mr-3" />
            <span className="text-amber-800">
              <strong>{stats.pendingApplications}</strong> volunteer{" "}
              {stats.pendingApplications !== 1 ? "applications" : "application"}{" "}
              pending review
            </span>
          </div>
          <Link
            to="/ngo-dashboard/applications"
            className="text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Review Applications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NGOOverview;
