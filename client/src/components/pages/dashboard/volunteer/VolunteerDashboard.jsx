import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../../../store/authStore";
import axios from "axios";
import api from "../../../../services/api";
import { toast } from "react-toastify";
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
  FiLayers,
} from "react-icons/fi";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const VolunteerDashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hoursLogged: 0,
    eventsParticipated: 0,
    impactLevel: 0,
  });
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [skills, setSkills] = useState([]);

  // Fetch actual data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get volunteer dashboard statistics
        const statsResponse = await api.get("/volunteers/stats");

        if (statsResponse.data.success) {
          const volunteerId = user.id;

          // Get recommended projects based on volunteer interests and skills
          const recommendedResponse = await api.get(
            `/events/recommended?limit=3&volunteer=${volunteerId}`
          );

          // Get volunteer skills
          const skillsResponse = await api.get(
            `/volunteers/${volunteerId}/skills`
          );

          // Set stats from API response
          setStats({
            hoursLogged: statsResponse.data.hoursLogged || 0,
            eventsParticipated: statsResponse.data.eventsParticipated || 0,
            impactLevel: statsResponse.data.impactLevel || 0,
          });

          // Set recommended projects
          if (recommendedResponse.data.success) {
            setRecommendedProjects(recommendedResponse.data.events || []);
          }

          // Set skills
          if (skillsResponse.data.success) {
            setSkills(skillsResponse.data.skills || []);
          }
        } else {
          // Fallback to basic user data if API fails
          // Extract some stats from user object if available
          setStats({
            hoursLogged: user?.volunteerInfo?.totalHours || 0,
            eventsParticipated:
              user?.volunteerInfo?.eventsParticipated?.length || 0,
            impactLevel: calculateImpactLevel(
              user?.volunteerInfo?.totalHours || 0
            ),
          });

          // Set empty arrays for other data
          setRecommendedProjects([]);
          setSkills(
            user?.volunteerInfo?.skills?.map((skill, index) => ({
              id: index + 1,
              name: skill,
              progress: Math.floor(Math.random() * 40) + 60, // Random progress between 60-100
              level: determineSkillLevel(Math.floor(Math.random() * 40) + 60),
            })) || []
          );
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(
          "Failed to load dashboard data. Using cached data instead."
        );

        // Fallback to user data
        setStats({
          hoursLogged: user?.volunteerInfo?.totalHours || 0,
          eventsParticipated:
            user?.volunteerInfo?.eventsParticipated?.length || 0,
          impactLevel: calculateImpactLevel(
            user?.volunteerInfo?.totalHours || 0
          ),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Calculate impact level based on hours
  const calculateImpactLevel = (hours) => {
    if (hours <= 0) return 0;
    if (hours < 10) return Math.round((hours / 10) * 25);
    if (hours < 25) return 25 + Math.round(((hours - 10) / 15) * 25);
    if (hours < 50) return 50 + Math.round(((hours - 25) / 25) * 25);
    if (hours < 100) return 75 + Math.round(((hours - 50) / 50) * 25);
    return 100;
  };

  // Determine skill level based on progress
  const determineSkillLevel = (progress) => {
    if (progress < 50) return "Beginner";
    if (progress < 75) return "Intermediate";
    if (progress < 90) return "Advanced";
    return "Expert";
  };

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
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Hero Section with Greeting and Stats */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {getGreeting()}, {user?.name || "Volunteer"}
            </h1>
            <p className="opacity-90 mb-6 text-lg">
              Your volunteer impact makes a difference in your community
            </p>
            <div className="flex gap-3 mt-4">
              <Link
                to="/dashboard/find-opportunities"
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2.5 rounded-lg shadow font-medium transition-colors"
              >
                Find Opportunities
              </Link>
              <Link
                to="/dashboard/profile"
                className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                My Profile
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center flex flex-col items-center justify-center">
              <p className="text-3xl font-bold mb-1">
                {loading ? "..." : stats.hoursLogged}
              </p>
              <p className="text-sm opacity-80">Hours Volunteered</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center flex flex-col items-center justify-center">
              <p className="text-3xl font-bold mb-1">
                {loading ? "..." : stats.eventsParticipated}
              </p>
              <p className="text-sm opacity-80">Events Joined</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center relative col-span-2 md:col-span-1">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                  width="100"
                  height="100"
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
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-bold mb-1">
                  {loading ? "..." : `${stats.impactLevel}%`}
                </p>
                <p className="text-sm opacity-80">Impact Level</p>
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
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
              <FiTarget className="mr-2 text-indigo-600" /> What would you like
              to do?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to="/dashboard/find-opportunities"
                className="flex flex-col items-center bg-indigo-50 hover:bg-indigo-100 p-5 rounded-xl transition-colors"
              >
                <FiSearch className="text-indigo-600 text-2xl mb-3" />
                <span className="text-sm font-medium text-center text-indigo-700">
                  Find Projects
                </span>
              </Link>
              <Link
                to="/dashboard/impact"
                className="flex flex-col items-center bg-rose-50 hover:bg-rose-100 p-5 rounded-xl transition-colors"
              >
                <FiHeart className="text-rose-600 text-2xl mb-3" />
                <span className="text-sm font-medium text-center text-rose-700">
                  My Impact
                </span>
              </Link>
              <Link
                to="/dashboard/calendar"
                className="flex flex-col items-center bg-amber-50 hover:bg-amber-100 p-5 rounded-xl transition-colors"
              >
                <FiCalendar className="text-amber-600 text-2xl mb-3" />
                <span className="text-sm font-medium text-center text-amber-700">
                  My Calendar
                </span>
              </Link>
              <Link
                to="/dashboard/profile"
                className="flex flex-col items-center bg-emerald-50 hover:bg-emerald-100 p-5 rounded-xl transition-colors"
              >
                <FiUser className="text-emerald-600 text-2xl mb-3" />
                <span className="text-sm font-medium text-center text-emerald-700">
                  My Profile
                </span>
              </Link>
            </div>
          </div>

          {/* Recommended Projects */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiHeart className="mr-2 text-indigo-600" /> Recommended for
                  You
                </h2>
                <Link
                  to="/dashboard/find-opportunities"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  View All <FiChevronRight className="ml-1" />
                </Link>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
                </div>
              ) : recommendedProjects.length > 0 ? (
                <div className="space-y-4">
                  {recommendedProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/dashboard/events/${project.id}`}
                      className="block"
                    >
                      <div className="border border-gray-100 hover:border-indigo-200 p-5 rounded-xl hover:bg-indigo-50/50 transition-all transform hover:-translate-y-1 hover:shadow-md">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {project.title}
                          </h3>
                          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {project.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {project.organization}
                        </p>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="flex items-center">
                            <FiClock className="mr-1.5" />{" "}
                            {formatDate(project.date)}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <FiMapPin className="mr-1.5" /> {project.location}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-6 text-center border border-dashed border-gray-200 rounded-xl">
                  <div className="text-gray-400 mb-3">
                    <FiSearch className="inline-block text-4xl" />
                  </div>
                  <p className="text-gray-600 mb-6">
                    Complete your profile to get personalized recommendations
                  </p>
                  <Link
                    to="/dashboard/profile"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors inline-block"
                  >
                    Update Profile
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Skills and Achievements */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiBook className="mr-2 text-indigo-600" /> Skills Development
                </h2>
              </div>

              {loading ? (
                <div className="py-10 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-indigo-600"></div>
                </div>
              ) : skills.length > 0 ? (
                <div className="space-y-5">
                  {skills.map((skill) => (
                    <div key={skill.id} className="bg-gray-50 p-4 rounded-xl">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-gray-800">
                          {skill.name}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                          {skill.level}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
                          style={{ width: `${skill.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-600 mb-2">No skills tracked yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Impact Tracker */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiTrendingUp className="mr-2 text-indigo-600" /> Your Impact
                </h2>
                <Link
                  to="/dashboard/impact"
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                >
                  Full Report <FiChevronRight className="ml-1" />
                </Link>
              </div>

              <div className="space-y-5">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-5 rounded-xl text-center text-white">
                  <div className="font-bold text-3xl mb-1">24</div>
                  <div className="text-sm text-white/90">Hours Contributed</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-xl text-center">
                    <div className="font-bold text-2xl text-green-700 mb-1">
                      5
                    </div>
                    <div className="text-xs text-green-600">
                      Projects Completed
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl text-center">
                    <div className="font-bold text-2xl text-purple-700 mb-1">
                      3
                    </div>
                    <div className="text-xs text-purple-600">
                      Organizations Helped
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Impact Areas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-xs font-medium">
                      Environment
                    </span>
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                      Education
                    </span>
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium">
                      Community
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates & Badges */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiAward className="mr-2 text-indigo-600" /> Achievements
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-200 p-4 rounded-xl text-center">
                  <div className="mb-3 text-amber-600">
                    <FiAward className="inline-block text-3xl" />
                  </div>
                  <div className="text-xs font-medium text-amber-800">
                    First-Time Volunteer
                  </div>
                </div>
                <div className="bg-gradient-to-b from-indigo-50 to-indigo-100 border border-indigo-200 p-4 rounded-xl text-center">
                  <div className="mb-3 text-indigo-600">
                    <FiLayers className="inline-block text-3xl" />
                  </div>
                  <div className="text-xs font-medium text-indigo-800">
                    5+ Hours Served
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
