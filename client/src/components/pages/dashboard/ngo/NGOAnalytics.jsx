import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../../../store/authStore";
import axios from "axios";
import {
  FiBarChart2,
  FiUsers,
  FiClock,
  FiCalendar,
  FiPieChart,
  FiTrendingUp,
  FiActivity,
  FiHeart,
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";

const NGOAnalytics = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("this-month");
  const [analyticsData, setAnalyticsData] = useState({
    totalVolunteers: 0,
    activeVolunteers: 0,
    totalHours: 0,
    eventsCompleted: 0,
    upcomingEvents: 0,
    retentionRate: 0,
    volunteerGrowth: [],
    hoursByCategory: [],
    eventAttendance: [],
    topEvents: [],
    volunteerDemographics: {
      ageGroups: [],
      skills: [],
    },
    recentActivity: [],
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // In a real implementation, this would make API calls based on date range
        // const response = await axios.get(`/api/ngo/analytics?range=${dateRange}`);

        // Mock data for demonstration
        setTimeout(() => {
          setAnalyticsData({
            totalVolunteers: 142,
            activeVolunteers: 87,
            totalHours: 1248,
            eventsCompleted: 28,
            upcomingEvents: 5,
            retentionRate: 76,
            volunteerGrowth: [
              { month: "Jan", volunteers: 98 },
              { month: "Feb", volunteers: 105 },
              { month: "Mar", volunteers: 112 },
              { month: "Apr", volunteers: 118 },
              { month: "May", volunteers: 124 },
              { month: "Jun", volunteers: 133 },
              { month: "Jul", volunteers: 142 },
            ],
            hoursByCategory: [
              { category: "Environmental", hours: 485, color: "bg-green-500" },
              {
                category: "Community Service",
                hours: 312,
                color: "bg-blue-500",
              },
              { category: "Education", hours: 246, color: "bg-purple-500" },
              { category: "Healthcare", hours: 152, color: "bg-red-500" },
              { category: "Animal Welfare", hours: 53, color: "bg-yellow-500" },
            ],
            eventAttendance: [
              {
                name: "Community Garden Cleanup",
                registered: 15,
                attended: 12,
              },
              { name: "Food Bank Distribution", registered: 10, attended: 10 },
              { name: "Senior Home Visit", registered: 8, attended: 6 },
              { name: "After-School Tutoring", registered: 12, attended: 9 },
              { name: "Animal Shelter Care Day", registered: 10, attended: 8 },
            ],
            topEvents: [
              {
                id: 1,
                name: "Food Bank Distribution",
                date: "2023-07-15",
                hours: 120,
                volunteers: 10,
                feedbackScore: 4.8,
              },
              {
                id: 2,
                name: "Community Garden Cleanup",
                date: "2023-06-22",
                hours: 96,
                volunteers: 12,
                feedbackScore: 4.6,
              },
              {
                id: 3,
                name: "Youth Mentoring Program",
                date: "2023-07-05",
                hours: 87,
                volunteers: 8,
                feedbackScore: 4.9,
              },
            ],
            volunteerDemographics: {
              ageGroups: [
                { group: "18-24", percentage: 28 },
                { group: "25-34", percentage: 35 },
                { group: "35-44", percentage: 18 },
                { group: "45-54", percentage: 12 },
                { group: "55+", percentage: 7 },
              ],
              skills: [
                { skill: "Communication", count: 92 },
                { skill: "Organization", count: 78 },
                { skill: "Leadership", count: 63 },
                { skill: "Problem Solving", count: 57 },
                { skill: "First Aid", count: 42 },
              ],
            },
            recentActivity: [
              {
                type: "event_completed",
                description:
                  "Community Garden Cleanup completed with 12 volunteers",
                date: "2023-07-18T14:30:00",
              },
              {
                type: "volunteer_joined",
                description: "5 new volunteers joined your organization",
                date: "2023-07-15T09:45:00",
              },
              {
                type: "hours_logged",
                description:
                  "96 volunteer hours logged for Food Bank Distribution",
                date: "2023-07-10T16:20:00",
              },
              {
                type: "feedback_received",
                description:
                  "New feedback received for Youth Mentoring Program (4.9/5)",
                date: "2023-07-06T11:15:00",
              },
            ],
          });
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast.error("Failed to load analytics data");
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time ago for recent activity
  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 86400); // days
    if (interval >= 1) {
      return interval === 1 ? "1 day ago" : `${interval} days ago`;
    }

    interval = Math.floor(seconds / 3600); // hours
    if (interval >= 1) {
      return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
    }

    interval = Math.floor(seconds / 60); // minutes
    if (interval >= 1) {
      return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
    }

    return "Just now";
  };

  // Calculate total hours for hours by category chart
  const totalCategoryHours = analyticsData.hoursByCategory.reduce(
    (sum, category) => sum + category.hours,
    0
  );

  // Get appropriate icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case "event_completed":
        return <FiCheck className="text-green-500" />;
      case "volunteer_joined":
        return <FiUsers className="text-blue-500" />;
      case "hours_logged":
        return <FiClock className="text-purple-500" />;
      case "feedback_received":
        return <FiHeart className="text-red-500" />;
      default:
        return <FiActivity className="text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Analytics Dashboard
            </h1>
            <p className="opacity-90 mt-1">
              Track volunteer engagement and measure your organization's impact
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="bg-white/20 backdrop-blur-sm text-white border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/50 outline-none"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="this-year">This Year</option>
              <option value="all-time">All Time</option>
            </select>

            <button className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg shadow font-medium transition-colors flex items-center">
              <FiDownload className="mr-2" /> Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Total Volunteers
            </h3>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FiUsers />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : analyticsData.totalVolunteers}
          </p>
          <p className="text-xs text-green-500 flex items-center mt-1">
            <FiTrendingUp className="mr-1" />
            {loading
              ? "..."
              : `+${
                  analyticsData.totalVolunteers -
                  analyticsData.volunteerGrowth[0].volunteers
                }`}{" "}
            this year
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Active Volunteers
            </h3>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <FiActivity />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : analyticsData.activeVolunteers}
          </p>
          <p className="text-xs text-green-500 flex items-center mt-1">
            <FiTrendingUp className="mr-1" />
            {loading
              ? "..."
              : `${Math.round(
                  (analyticsData.activeVolunteers /
                    analyticsData.totalVolunteers) *
                    100
                )}%`}{" "}
            engagement
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <FiClock />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : analyticsData.totalHours}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ~
            {loading
              ? "..."
              : Math.round(
                  analyticsData.totalHours / analyticsData.totalVolunteers
                )}{" "}
            hrs per volunteer
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Events Completed
            </h3>
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <FiCheck />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : analyticsData.eventsCompleted}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {loading ? "..." : analyticsData.upcomingEvents} upcoming events
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">
              Retention Rate
            </h3>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <FiHeart />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {loading ? "..." : `${analyticsData.retentionRate}%`}
          </p>
          <p className="text-xs text-green-500 flex items-center mt-1">
            <FiTrendingUp className="mr-1" />
            {loading ? "..." : "+8%"} from last year
          </p>
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-8">
          {/* Volunteer Growth Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <FiTrendingUp className="mr-2 text-blue-500" /> Volunteer Growth
            </h2>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="h-64">
                <div className="flex h-full items-end space-x-2">
                  {analyticsData.volunteerGrowth.map((item, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t-sm"
                        style={{
                          height: `${
                            (item.volunteers /
                              Math.max(
                                ...analyticsData.volunteerGrowth.map(
                                  (i) => i.volunteers
                                )
                              )) *
                            100
                          }%`,
                          transition: "height 1s ease-out",
                        }}
                      ></div>
                      <div className="text-xs font-medium mt-2 text-gray-600">
                        {item.month}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.volunteers}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Event Attendance */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <FiUsers className="mr-2 text-blue-500" /> Event Attendance
            </h2>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData.eventAttendance.map((event, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {event.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {event.attended}/{event.registered} (
                        {Math.round((event.attended / event.registered) * 100)}
                        %)
                      </span>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="flex h-full">
                        <div
                          className="bg-green-500 h-full"
                          style={{
                            width: `${
                              (event.attended / event.registered) * 100
                            }%`,
                          }}
                        ></div>
                        <div
                          className="bg-yellow-500 h-full opacity-40"
                          style={{
                            width: `${
                              ((event.registered - event.attended) /
                                event.registered) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                <span>Attended</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-40 mr-1"></div>
                <span>Registered but didn't attend</span>
              </div>
            </div>
          </div>

          {/* Top Events Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <FiBarChart2 className="mr-2 text-blue-500" /> Top Performing
              Events
            </h2>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-sm text-gray-600 border-b border-gray-200">
                      <th className="pb-2 font-medium text-left">Event Name</th>
                      <th className="pb-2 font-medium text-center">Date</th>
                      <th className="pb-2 font-medium text-center">
                        Volunteers
                      </th>
                      <th className="pb-2 font-medium text-center">Hours</th>
                      <th className="pb-2 font-medium text-center">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {analyticsData.topEvents.map((event, index) => (
                      <tr key={index} className="text-sm">
                        <td className="py-3 font-medium text-gray-800">
                          {event.name}
                        </td>
                        <td className="py-3 text-center text-gray-600">
                          {formatDate(event.date)}
                        </td>
                        <td className="py-3 text-center text-gray-600">
                          {event.volunteers}
                        </td>
                        <td className="py-3 text-center text-gray-600">
                          {event.hours}
                        </td>
                        <td className="py-3 text-center text-gray-600">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {event.feedbackScore}/5.0
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link
                to="/dashboard/events"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Events
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Charts */}
        <div className="space-y-8">
          {/* Hours by Category */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <FiPieChart className="mr-2 text-blue-500" /> Hours by Category
            </h2>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsData.hoursByCategory.map((category, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">
                        {category.category}
                      </span>
                      <span className="text-gray-500">
                        {category.hours} hrs (
                        {Math.round(
                          (category.hours / totalCategoryHours) * 100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${category.color} h-2.5 rounded-full`}
                        style={{
                          width: `${
                            (category.hours / totalCategoryHours) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Volunteer Demographics */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <FiUsers className="mr-2 text-blue-500" /> Volunteer Demographics
            </h2>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Age Groups
                </h3>
                <div className="h-10 w-full bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div className="flex h-full">
                    {analyticsData.volunteerDemographics.ageGroups.map(
                      (group, index) => (
                        <div
                          key={index}
                          className={`h-full ${
                            index === 0
                              ? "bg-blue-500"
                              : index === 1
                              ? "bg-green-500"
                              : index === 2
                              ? "bg-yellow-500"
                              : index === 3
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${group.percentage}%` }}
                        ></div>
                      )
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs mb-6">
                  {analyticsData.volunteerDemographics.ageGroups.map(
                    (group, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-1 ${
                            index === 0
                              ? "bg-blue-500"
                              : index === 1
                              ? "bg-green-500"
                              : index === 2
                              ? "bg-yellow-500"
                              : index === 3
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span>
                          {group.group} ({group.percentage}%)
                        </span>
                      </div>
                    )
                  )}
                </div>

                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Top Skills
                </h3>
                <div className="space-y-2">
                  {analyticsData.volunteerDemographics.skills.map(
                    (skill, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">{skill.skill}</span>
                        <span className="text-gray-500">
                          {skill.count} volunteers
                        </span>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <FiActivity className="mr-2 text-blue-500" /> Recent Activity
            </h2>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-800">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {timeAgo(activity.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 text-center">
              <Link
                to="/dashboard/activity"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Activity
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGOAnalytics;
