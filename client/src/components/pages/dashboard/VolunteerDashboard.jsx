import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import {
  FiUser,
  FiCalendar,
  FiClock,
  FiHeart,
  FiMapPin,
  FiBook,
  FiAward,
  FiCheckCircle,
  FiTrendingUp,
  FiSearch,
  FiChevronRight,
  FiTarget,
  FiBell,
  FiLayers,
} from "react-icons/fi";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const VolunteerDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hoursLogged: 0,
    eventsParticipated: 0,
    upcomingShifts: 0,
    impactLevel: 0,
  });
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [skills, setSkills] = useState([]);

  // Prepare chart data
  const impactChartData = {
    labels: ["Impact", "Remaining"],
    datasets: [
      {
        data: [stats.impactLevel, 100 - stats.impactLevel],
        backgroundColor: [
          "rgba(255, 255, 255, 0.9)",
          "rgba(255, 255, 255, 0.2)",
        ],
        borderColor: ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.2)"],
        borderWidth: 1,
        cutout: "75%",
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // In a real app, these would be actual API calls
        setTimeout(() => {
          setStats({
            hoursLogged: 24,
            eventsParticipated: 5,
            upcomingShifts: 2,
            impactLevel: 60,
          });

          setUpcomingEvents([
            {
              id: 1,
              title: "Community Garden Cleanup",
              date: "2023-06-15T09:00:00",
              location: "Main Street Park",
              organization: "Green Earth Initiative",
              status: "confirmed",
            },
            {
              id: 2,
              title: "Food Bank Distribution",
              date: "2023-06-18T10:00:00",
              location: "Central Community Center",
              organization: "City Food Bank",
              status: "confirmed",
            },
          ]);

          setRecommendedProjects([
            {
              id: 1,
              title: "Senior Home Companion",
              organization: "Elder Care Alliance",
              date: "2023-06-22T14:00:00",
              location: "Sunshine Senior Living",
              matchScore: 95,
            },
            {
              id: 2,
              title: "River Cleanup Project",
              organization: "Clean Water Initiative",
              date: "2023-06-25T09:00:00",
              location: "Riverdale Park",
              matchScore: 88,
            },
            {
              id: 3,
              title: "Literacy Program Tutor",
              organization: "Community Learning Center",
              date: "2023-06-24T10:00:00",
              location: "Downtown Library",
              matchScore: 82,
            },
          ]);

          setSkills([
            { id: 1, name: "Communication", progress: 85, level: "Advanced" },
            { id: 2, name: "Leadership", progress: 60, level: "Intermediate" },
            {
              id: 3,
              name: "Problem Solving",
              progress: 75,
              level: "Intermediate",
            },
          ]);

          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name || "Volunteer"}
            </h1>
            <p className="opacity-90 mb-4">
              Your volunteer impact makes a difference in your community
            </p>
            <div className="flex gap-2 mt-4">
              <Link
                to="/dashboard/events"
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg shadow font-medium transition-colors"
              >
                Find Opportunities
              </Link>
              <Link
                to="/dashboard/my-shifts"
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg shadow font-medium transition-colors"
              >
                View My Schedule
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full md:w-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xl md:text-2xl font-bold">
                {loading ? "..." : stats.hoursLogged}
              </p>
              <p className="text-xs md:text-sm opacity-80">Hours Volunteered</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xl md:text-2xl font-bold">
                {loading ? "..." : stats.eventsParticipated}
              </p>
              <p className="text-xs md:text-sm opacity-80">Events Joined</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xl md:text-2xl font-bold">
                {loading ? "..." : stats.upcomingShifts}
              </p>
              <p className="text-xs md:text-sm opacity-80">Upcoming Shifts</p>
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
                    2 * Math.PI * 40 * (1 - stats.impactLevel / 100)
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="relative z-10">
                <p className="text-xl md:text-2xl font-bold">
                  {loading ? "..." : `${stats.impactLevel}%`}
                </p>
                <p className="text-xs md:text-sm opacity-80">Impact Level</p>
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
              <FiTarget className="mr-2 text-indigo-500" /> What would you like
              to do?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to="/dashboard/events"
                className="flex flex-col items-center bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg transition-colors"
              >
                <FiSearch className="text-indigo-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">
                  Find Projects
                </span>
              </Link>
              <Link
                to="/dashboard/my-shifts"
                className="flex flex-col items-center bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors"
              >
                <FiClock className="text-green-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">
                  Log Hours
                </span>
              </Link>
              <Link
                to="/dashboard/skills"
                className="flex flex-col items-center bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors"
              >
                <FiBook className="text-purple-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">
                  My Skills
                </span>
              </Link>
              <Link
                to="/dashboard/impact"
                className="flex flex-col items-center bg-rose-50 hover:bg-rose-100 p-4 rounded-lg transition-colors"
              >
                <FiHeart className="text-rose-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">
                  My Impact
                </span>
              </Link>
            </div>
          </div>

          {/* Recommended Projects */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiHeart className="mr-2 text-indigo-500" /> Recommended for You
              </h2>
              <Link
                to="/dashboard/events"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-500">
                Finding opportunities for you...
              </div>
            ) : recommendedProjects.length > 0 ? (
              <div className="space-y-4">
                {recommendedProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/dashboard/events/${project.id}`}
                    className="block"
                  >
                    <div className="border border-gray-100 hover:border-indigo-200 p-4 rounded-lg hover:bg-indigo-50/50 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-gray-900">
                          {project.title}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {project.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {project.organization}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="flex items-center">
                          <FiClock className="mr-1" />{" "}
                          {formatDate(project.date)}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          <FiMapPin className="mr-1" /> {project.location}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-gray-200 rounded-lg">
                <div className="text-gray-400 mb-2">
                  <FiSearch className="inline-block text-3xl" />
                </div>
                <p className="text-gray-500 mb-4">
                  Complete your profile to get personalized recommendations
                </p>
                <Link
                  to="/dashboard/volunteer-profile"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Update Profile
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Shifts */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiCalendar className="mr-2 text-indigo-500" /> Your Upcoming
                Shifts
              </h2>
              <Link
                to="/dashboard/my-shifts"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-500">
                Loading your schedule...
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-100 p-4 rounded-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {event.organization}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <FiClock className="mr-1" />{" "}
                            {formatDate(event.date)}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <FiMapPin className="mr-1" /> {event.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-col md:flex-row">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : event.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </span>
                        <Link
                          to={`/dashboard/events/${event.id}`}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium hover:bg-indigo-200 transition-colors text-center"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-gray-200 rounded-lg">
                <div className="text-gray-400 mb-2">
                  <FiCalendar className="inline-block text-3xl" />
                </div>
                <p className="text-gray-500 mb-4">
                  You don't have any upcoming shifts
                </p>
                <Link
                  to="/dashboard/events"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Browse Opportunities
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Skills and Achievements */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiBook className="mr-2 text-indigo-500" /> Skills Development
              </h2>
              <Link
                to="/dashboard/skills"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>

            {loading ? (
              <div className="py-6 text-center text-gray-500">
                Loading skills...
              </div>
            ) : skills.length > 0 ? (
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {skill.name}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                        {skill.level}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                <Link
                  to="/dashboard/training"
                  className="block w-full text-center py-2 mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-colors"
                >
                  Find Training Opportunities
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-2">No skills tracked yet</p>
                <Link
                  to="/dashboard/skills/add"
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Add Skills
                </Link>
              </div>
            )}
          </div>

          {/* Impact Tracker */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiTrendingUp className="mr-2 text-indigo-500" /> Your Impact
              </h2>
              <Link
                to="/dashboard/impact"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                Full Report <FiChevronRight className="ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg text-center">
                <div className="font-bold text-2xl text-indigo-700 mb-1">
                  24
                </div>
                <div className="text-sm text-indigo-600">Hours Contributed</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="font-bold text-xl text-green-700 mb-1">5</div>
                  <div className="text-xs text-green-600">
                    Projects Completed
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg text-center">
                  <div className="font-bold text-xl text-purple-700 mb-1">
                    3
                  </div>
                  <div className="text-xs text-purple-600">
                    Organizations Helped
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Impact Areas
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    Environment
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Education
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                    Community
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates & Badges */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiAward className="mr-2 text-indigo-500" /> Certificates &
                Badges
              </h2>
              <Link
                to="/dashboard/certificates"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-200 p-3 rounded-lg text-center">
                <div className="mb-2 text-amber-600">
                  <FiAward className="inline-block text-2xl" />
                </div>
                <div className="text-xs font-medium text-amber-800">
                  First-Time Volunteer
                </div>
              </div>
              <div className="bg-gradient-to-b from-indigo-50 to-indigo-100 border border-indigo-200 p-3 rounded-lg text-center">
                <div className="mb-2 text-indigo-600">
                  <FiLayers className="inline-block text-2xl" />
                </div>
                <div className="text-xs font-medium text-indigo-800">
                  5+ Hours Served
                </div>
              </div>
              <div className="col-span-2 mt-2">
                <Link
                  to="/dashboard/training"
                  className="block w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-lg transition-colors"
                >
                  Complete Training for More Certificates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
