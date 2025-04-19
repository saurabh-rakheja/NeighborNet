import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../../../store/authStore";
import axios from "axios";
import {
  FiClock,
  FiCalendar,
  FiMapPin,
  FiStar,
  FiBarChart2,
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiHeart,
  FiActivity,
  FiChevronRight,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";

const VolunteerImpact = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState({
    totalHours: 0,
    totalEvents: 0,
    skillProgress: [],
    monthlyHours: [],
    impactAreas: [],
    achievements: [],
    recentImpact: [],
  });

  // Fetch volunteer impact data
  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        setLoading(true);

        // In a real implementation, this would make actual API calls
        setTimeout(() => {
          setImpactData({
            totalHours: 47,
            totalEvents: 12,
            skillProgress: [
              { name: "Leadership", progress: 75, level: "Advanced" },
              { name: "Communication", progress: 85, level: "Expert" },
              { name: "Teamwork", progress: 90, level: "Expert" },
              { name: "Problem Solving", progress: 65, level: "Intermediate" },
            ],
            monthlyHours: [
              { month: "Jan", hours: 4 },
              { month: "Feb", hours: 6 },
              { month: "Mar", hours: 5 },
              { month: "Apr", hours: 8 },
              { month: "May", hours: 12 },
              { month: "Jun", hours: 8 },
              { month: "Jul", hours: 4 },
            ],
            impactAreas: [
              { category: "Environmental", hours: 18, percentage: 38 },
              { category: "Education", hours: 12, percentage: 26 },
              { category: "Community Service", hours: 10, percentage: 21 },
              { category: "Healthcare", hours: 7, percentage: 15 },
            ],
            achievements: [
              {
                id: 1,
                title: "First Time Volunteer",
                description: "Completed your first volunteer event",
                date: "2023-01-15",
                icon: "FiStar",
              },
              {
                id: 2,
                title: "10 Hours Milestone",
                description: "Contributed 10 hours of service",
                date: "2023-02-10",
                icon: "FiClock",
              },
              {
                id: 3,
                title: "Environment Champion",
                description: "Participated in 5 environmental projects",
                date: "2023-04-22",
                icon: "FiHeart",
              },
              {
                id: 4,
                title: "Team Player",
                description: "Worked with 10+ different volunteers",
                date: "2023-05-30",
                icon: "FiUsers",
              },
            ],
            recentImpact: [
              {
                id: 1,
                event: "Community Garden Cleanup",
                date: "2023-06-10",
                hours: 4,
                impact: "Helped plant 20 new trees",
              },
              {
                id: 2,
                event: "Food Bank Distribution",
                date: "2023-05-28",
                hours: 3,
                impact: "Helped serve 75 families",
              },
              {
                id: 3,
                event: "Children's Reading Program",
                date: "2023-05-15",
                hours: 2,
                impact: "Read to 12 children",
              },
            ],
          });
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("Error fetching impact data:", error);
        toast.error("Failed to load impact data");
        setLoading(false);
      }
    };

    fetchImpactData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white mb-8 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Your Volunteer Impact
        </h1>
        <p className="opacity-90 mb-4">
          Track your contributions and the difference you're making
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
            <FiClock className="text-2xl mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {loading ? "..." : impactData.totalHours}
            </p>
            <p className="text-sm opacity-80">Total Hours</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
            <FiCalendar className="text-2xl mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {loading ? "..." : impactData.totalEvents}
            </p>
            <p className="text-sm opacity-80">Events Completed</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
            <FiTarget className="text-2xl mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {loading ? "..." : impactData.impactAreas.length}
            </p>
            <p className="text-sm opacity-80">Impact Areas</p>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
            <FiAward className="text-2xl mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {loading ? "..." : impactData.achievements.length}
            </p>
            <p className="text-sm opacity-80">Achievements</p>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Metrics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Monthly Hours Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <FiBarChart2 className="mr-2 text-indigo-500" /> Monthly Volunteer
              Hours
            </h2>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : (
              <div className="h-64">
                <div className="flex h-full items-end space-x-2">
                  {impactData.monthlyHours.map((month, index) => (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className="w-full bg-indigo-500 rounded-t-sm"
                        style={{
                          height: `${Math.max(
                            (month.hours /
                              Math.max(
                                ...impactData.monthlyHours.map((m) => m.hours)
                              )) *
                              180,
                            24
                          )}px`,
                          transition: "height 1s ease-out",
                        }}
                      ></div>
                      <div className="text-xs font-medium mt-2 text-gray-600">
                        {month.month}
                      </div>
                      <div className="text-xs text-gray-500">
                        {month.hours}h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Impact Areas */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <FiHeart className="mr-2 text-indigo-500" /> Impact Areas
            </h2>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {impactData.impactAreas.map((area, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {area.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {area.hours} hours ({area.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-500 h-2.5 rounded-full"
                        style={{ width: `${area.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Impact */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <FiActivity className="mr-2 text-indigo-500" /> Recent Impact
            </h2>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {impactData.recentImpact.map((impact, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {impact.event}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(impact.date)} • {impact.hours} hours
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 bg-indigo-50 p-2 rounded-md">
                      <FiCheck className="inline-block text-indigo-500 mr-1" />{" "}
                      {impact.impact}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Skills and Achievements */}
        <div className="space-y-8">
          {/* Skills Progress */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <FiTrendingUp className="mr-2 text-indigo-500" /> Skills
              Development
            </h2>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {impactData.skillProgress.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {skill.name}
                      </span>
                      <span className="text-xs py-0.5 px-2 bg-indigo-100 text-indigo-800 rounded-full">
                        {skill.level}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-indigo-500 h-2.5 rounded-full"
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/dashboard/volunteer-profile"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Update your skills <FiChevronRight className="ml-1" />
              </Link>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <FiAward className="mr-2 text-indigo-500" /> Achievements
            </h2>

            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {impactData.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full text-indigo-600">
                      {achievement.icon === "FiStar" && (
                        <FiStar className="h-5 w-5" />
                      )}
                      {achievement.icon === "FiClock" && (
                        <FiClock className="h-5 w-5" />
                      )}
                      {achievement.icon === "FiHeart" && (
                        <FiHeart className="h-5 w-5" />
                      )}
                      {achievement.icon === "FiUsers" && (
                        <FiUsers className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Earned on {formatDate(achievement.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerImpact;
