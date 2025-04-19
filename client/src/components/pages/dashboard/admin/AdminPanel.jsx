import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import useAuthStore from "../../../../store/authStore";
import {
  FiUsers,
  FiCalendar,
  FiCheckSquare,
  FiBarChart2,
  FiSettings,
  FiAlertCircle,
  FiRefreshCw,
  FiShield,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";

const AdminPanel = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVolunteers: 0,
    totalNGOs: 0,
    totalEvents: 0,
    pendingVerifications: 0,
    pendingEvents: 0,
    totalHours: 0,
  });
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);

    try {
      // In a real implementation, you would make API calls
      // const statsResponse = await axios.get('/api/admin/stats');
      // const pendingVerificationsResponse = await axios.get('/api/admin/pending-verifications');
      // const pendingEventsResponse = await axios.get('/api/admin/pending-events');
      // const activitiesResponse = await axios.get('/api/admin/recent-activities');

      // Mock data for demonstration
      const mockStats = {
        totalUsers: 1245,
        totalVolunteers: 982,
        totalNGOs: 263,
        totalEvents: 156,
        pendingVerifications: 15,
        pendingEvents: 8,
        totalHours: 4572,
      };

      const mockPendingVerifications = [
        {
          id: "user1",
          name: "Sarah Johnson",
          email: "sarah.j@example.com",
          type: "Volunteer",
          submittedAt: "2023-11-15T10:30:00Z",
          documents: ["ID Proof", "Address Proof"],
        },
        {
          id: "user2",
          name: "Community Helpers",
          email: "info@communityhelpers.org",
          type: "NGO",
          submittedAt: "2023-11-14T14:45:00Z",
          documents: ["Registration Certificate", "Tax Exemption"],
        },
        {
          id: "user3",
          name: "Michael Smith",
          email: "msmith@example.com",
          type: "Volunteer",
          submittedAt: "2023-11-12T09:15:00Z",
          documents: ["ID Proof"],
        },
      ];

      const mockPendingEvents = [
        {
          id: "event1",
          title: "Beach Cleanup Drive",
          organization: "Ocean Conservation Society",
          location: "East Coast Beach",
          date: "2023-12-10T09:00:00Z",
          status: "Pending",
        },
        {
          id: "event2",
          title: "Children's Book Reading",
          organization: "Education for All",
          location: "City Library",
          date: "2023-12-05T14:00:00Z",
          status: "Pending",
        },
      ];

      const mockActivities = [
        {
          id: "act1",
          type: "User Verification",
          description: "Volunteer profile verified",
          user: "James Wilson",
          timestamp: "2023-11-16T11:20:00Z",
          admin: "Admin User",
        },
        {
          id: "act2",
          type: "Event Approval",
          description: "Community Garden Project approved",
          user: "Green Earth Initiative",
          timestamp: "2023-11-16T10:05:00Z",
          admin: "Admin User",
        },
        {
          id: "act3",
          type: "User Registration",
          description: "New volunteer registered",
          user: "Emma Thompson",
          timestamp: "2023-11-15T16:30:00Z",
          admin: "System",
        },
        {
          id: "act4",
          type: "User Verification",
          description: "NGO profile verified",
          user: "Health First Foundation",
          timestamp: "2023-11-15T14:40:00Z",
          admin: "Admin User",
        },
        {
          id: "act5",
          type: "Event Rejection",
          description: "Fundraiser event rejected (Insufficient details)",
          user: "Community Support Network",
          timestamp: "2023-11-15T09:15:00Z",
          admin: "Admin User",
        },
      ];

      // Simulate API delay
      setTimeout(() => {
        setStats(mockStats);
        setPendingVerifications(mockPendingVerifications);
        setPendingEvents(mockPendingEvents);
        setRecentActivities(mockActivities);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin dashboard data");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleVerification = async (userId, action) => {
    try {
      // In a real implementation, you would call your API
      // await axios.post(`/api/admin/verification/${userId}`, { action });

      // Optimistic UI update
      if (action === "approve") {
        setPendingVerifications((prev) =>
          prev.filter((user) => user.id !== userId)
        );
        setStats((prev) => ({
          ...prev,
          pendingVerifications: prev.pendingVerifications - 1,
        }));
        toast.success("User verified successfully");
      } else {
        setPendingVerifications((prev) =>
          prev.filter((user) => user.id !== userId)
        );
        setStats((prev) => ({
          ...prev,
          pendingVerifications: prev.pendingVerifications - 1,
        }));
        toast.info("Verification request rejected");
      }
    } catch (error) {
      console.error("Error processing verification:", error);
      toast.error("Failed to process verification");
    }
  };

  const handleEventModeration = async (eventId, action) => {
    try {
      // In a real implementation, you would call your API
      // await axios.post(`/api/admin/events/${eventId}`, { action });

      // Optimistic UI update
      if (action === "approve") {
        setPendingEvents((prev) =>
          prev.filter((event) => event.id !== eventId)
        );
        setStats((prev) => ({
          ...prev,
          pendingEvents: prev.pendingEvents - 1,
        }));
        toast.success("Event approved successfully");
      } else {
        setPendingEvents((prev) =>
          prev.filter((event) => event.id !== eventId)
        );
        setStats((prev) => ({
          ...prev,
          pendingEvents: prev.pendingEvents - 1,
        }));
        toast.info("Event rejected");
      }
    } catch (error) {
      console.error("Error processing event moderation:", error);
      toast.error("Failed to process event");
    }
  };

  // Filter activities based on search term and activity type
  const filteredActivities = recentActivities.filter((activity) => {
    const matchesSearch =
      searchTerm === "" ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activityFilter === "All" || activity.type === activityFilter;

    return matchesSearch && matchesFilter;
  });

  const activityTypes = [
    "All",
    "User Verification",
    "Event Approval",
    "User Registration",
    "Event Rejection",
  ];

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <FiShield className="text-red-500 mx-auto mb-4" size={48} />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Access Restricted
        </h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access the admin panel.
        </p>
        <Link
          to="/dashboard"
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mt-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage users, events, and platform settings
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <FiRefreshCw className="mr-2" /> Refresh Data
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <FiUsers size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalUsers}
                </p>
                <div className="flex items-center text-sm">
                  <span className="text-gray-500">
                    Volunteers: {stats.totalVolunteers}
                  </span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-gray-500">NGOs: {stats.totalNGOs}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                  <FiCalendar size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Events
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalEvents}
                </p>
                <div className="flex items-center text-sm">
                  <span className="text-red-500">
                    Pending: {stats.pendingEvents}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600">
                  <FiCheckSquare size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Pending Verifications
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.pendingVerifications}
                </p>
                <div className="flex items-center text-sm">
                  <Link
                    to="/dashboard/admin/verification"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    View all
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  <FiClock size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Volunteer Hours
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalHours.toLocaleString()}
                </p>
                <div className="flex items-center text-sm">
                  <Link
                    to="/dashboard/admin/reports"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    View reports
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">
              Pending Verifications
            </h2>
            <Link
              to="/dashboard/admin/verification"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All
            </Link>
          </div>

          {pendingVerifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending verifications
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingVerifications.map((verification) => (
                    <tr key={verification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {verification.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {verification.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            verification.type === "NGO"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {verification.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(verification.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {verification.documents.join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() =>
                              handleVerification(verification.id, "approve")
                            }
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <FiCheckCircle className="mr-1" /> Approve
                          </button>
                          <button
                            onClick={() =>
                              handleVerification(verification.id, "reject")
                            }
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <FiXCircle className="mr-1" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">
              Events Awaiting Approval
            </h2>
            <Link
              to="/dashboard/admin/events"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All Events
            </Link>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No pending events
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.organization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(event.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() =>
                              handleEventModeration(event.id, "approve")
                            }
                            className="text-green-600 hover:text-green-900 flex items-center"
                          >
                            <FiCheckCircle className="mr-1" /> Approve
                          </button>
                          <button
                            onClick={() =>
                              handleEventModeration(event.id, "reject")
                            }
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <FiXCircle className="mr-1" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activities Log */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">
              Recent Activities
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              <FiFilter className="mr-1" />
              Filter
              <FiChevronDown
                className={`ml-1 transform transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Search and Filter */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                    <FiSearch size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="w-full md:w-auto px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {activityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {filteredActivities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No activities found
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performed By
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <span
                              className={`inline-flex mr-3 mt-0.5 items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                activity.type === "User Verification"
                                  ? "bg-green-100 text-green-800"
                                  : activity.type === "Event Approval"
                                  ? "bg-blue-100 text-blue-800"
                                  : activity.type === "Event Rejection"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {activity.type}
                            </span>
                            <div className="text-sm text-gray-900">
                              {activity.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {activity.admin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {formatDate(activity.timestamp)} at{" "}
                          {formatTime(activity.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
