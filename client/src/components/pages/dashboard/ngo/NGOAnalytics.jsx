import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiBarChart2,
  FiTrendingUp,
  FiDownload,
  FiClipboard,
  FiActivity,
  FiStar,
} from "react-icons/fi";

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
  RadialLinearScale,
} from "chart.js";
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";

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
  ArcElement,
  RadialLinearScale
);

const NGOAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalVolunteers: 0,
    totalHours: 0,
    completionRate: 0,
    averageRating: 0,
    impact: 0,
  });
  const [participationData, setParticipationData] = useState({
    labels: [],
    datasets: [],
  });
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [],
  });
  const [volunteerGrowthData, setVolunteerGrowthData] = useState({
    labels: [],
    datasets: [],
  });
  const [skillDistributionData, setSkillDistributionData] = useState({
    labels: [],
    datasets: [],
  });
  const [timeOfDayData, setTimeOfDayData] = useState({
    labels: [],
    datasets: [],
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // In a real app, this would be an API call
        // For now, simulate API response

        // Simulated statistics
        setStats({
          totalEvents: 18,
          totalVolunteers: 120,
          totalHours: 842,
          completionRate: 89,
          averageRating: 4.7,
          impact: 76,
        });

        // Simulated monthly participation data
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        setParticipationData({
          labels: months,
          datasets: [
            {
              label: "Events",
              data: [3, 5, 2, 4, 6, 8],
              backgroundColor: "rgba(99, 102, 241, 0.8)",
              borderColor: "rgba(99, 102, 241, 1)",
              borderWidth: 1,
            },
            {
              label: "Volunteers",
              data: [25, 30, 15, 22, 38, 45],
              backgroundColor: "rgba(139, 92, 246, 0.8)",
              borderColor: "rgba(139, 92, 246, 1)",
              borderWidth: 1,
            },
          ],
        });

        // Simulated event category data
        setCategoryData({
          labels: ["Environment", "Education", "Health", "Community", "Arts"],
          datasets: [
            {
              data: [35, 25, 20, 15, 5],
              backgroundColor: [
                "rgba(34, 197, 94, 0.8)",
                "rgba(59, 130, 246, 0.8)",
                "rgba(236, 72, 153, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(167, 139, 250, 0.8)",
              ],
              borderColor: [
                "rgba(34, 197, 94, 1)",
                "rgba(59, 130, 246, 1)",
                "rgba(236, 72, 153, 1)",
                "rgba(245, 158, 11, 1)",
                "rgba(167, 139, 250, 1)",
              ],
              borderWidth: 1,
            },
          ],
        });

        // Simulated volunteer growth data
        setVolunteerGrowthData({
          labels: months,
          datasets: [
            {
              label: "New Volunteers",
              data: [12, 15, 10, 18, 22, 25],
              borderColor: "rgba(99, 102, 241, 1)",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
          ],
        });

        // Simulated skill distribution data
        setSkillDistributionData({
          labels: [
            "Teaching",
            "Event Organization",
            "Medical",
            "Marketing",
            "Tech",
            "Languages",
            "Leadership",
          ],
          datasets: [
            {
              label: "Volunteer Skills",
              data: [65, 45, 40, 35, 30, 25, 20],
              backgroundColor: "rgba(99, 102, 241, 0.5)",
              borderColor: "rgba(99, 102, 241, 1)",
              borderWidth: 1,
            },
          ],
        });

        // Simulated time of day preference data
        setTimeOfDayData({
          labels: ["Morning", "Afternoon", "Evening", "Weekend"],
          datasets: [
            {
              label: "Volunteer Availability",
              data: [35, 45, 25, 70],
              backgroundColor: "rgba(16, 185, 129, 0.6)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Monthly Participation",
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Event Categories",
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Volunteer Growth",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const radarChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Volunteer Skills Distribution",
      },
    },
    scales: {
      r: {
        min: 0,
        max: 70,
      },
    },
  };

  const timeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Volunteer Availability",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
        <button className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
          <FiDownload className="mr-2" /> Export Report
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg mr-4">
              <FiCalendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Events
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalEvents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <FiUsers className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Volunteers
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalVolunteers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FiClock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Volunteer Hours
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalHours}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <FiClipboard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Completion Rate
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <FiStar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Average Rating
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageRating}/5.0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-pink-100 rounded-lg mr-4">
              <FiActivity className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Social Impact
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.impact}/100
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Participation */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Activity
          </h3>
          <div className="h-80">
            <Bar data={participationData} options={barChartOptions} />
          </div>
        </div>

        {/* Event Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Event Categories
          </h3>
          <div className="h-80">
            <Doughnut data={categoryData} options={doughnutChartOptions} />
          </div>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Volunteer Growth */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Volunteer Growth
          </h3>
          <div className="h-80">
            <Line data={volunteerGrowthData} options={lineChartOptions} />
          </div>
        </div>

        {/* Volunteer Availability */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Volunteer Availability
          </h3>
          <div className="h-80">
            <Bar data={timeOfDayData} options={timeChartOptions} />
          </div>
        </div>
      </div>

      {/* Volunteer Skills Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Volunteer Skills
        </h3>
        <div className="h-80 max-w-3xl mx-auto">
          <Radar data={skillDistributionData} options={radarChartOptions} />
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <FiTrendingUp className="text-green-500 mr-2" />
              <h4 className="font-medium text-gray-800">Growth Opportunity</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Health-related events are trending upward. Consider adding more
              health-focused volunteer opportunities.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <FiMapPin className="text-indigo-500 mr-2" />
              <h4 className="font-medium text-gray-800">Location Insights</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Downtown events receive 32% more volunteer applications. Consider
              focusing more events in this area.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center mb-3">
              <FiUsers className="text-blue-500 mr-2" />
              <h4 className="font-medium text-gray-800">Volunteer Retention</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Volunteers who attend 3+ events have a 85% return rate. Focus on
              engaging first-time volunteers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGOAnalytics;
