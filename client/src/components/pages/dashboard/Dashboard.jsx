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
  FiUsers,
  FiChevronRight,
  FiTarget,
  FiBell
} from "react-icons/fi";
import axios from "axios";

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    hoursLogged: 0,
    eventsParticipated: 0,
    upcomingShifts: 0,
    impactLevel: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Simulate fetching data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be actual API calls
        // await Promise.all([fetchStats(), fetchEvents(), fetchAchievements()]);
        
        // Simulated data
        setTimeout(() => {
          setStats({
            hoursLogged: 24,
            eventsParticipated: 5,
            upcomingShifts: 2,
            impactLevel: 60
          });
          
          setUpcomingEvents([
            {
              id: 1,
              title: "Community Garden Cleanup",
              date: "2023-06-15T09:00:00",
              location: "Main Street Park",
              category: "Environmental"
            },
            {
              id: 2,
              title: "Food Bank Distribution",
              date: "2023-06-18T10:00:00",
              location: "Central Community Center",
              category: "Community Support"
            }
          ]);
          
          setAchievements([
            { id: 1, name: "First Shift", description: "Complete your first volunteer shift", completed: true, icon: "FiAward", progress: 100 },
            { id: 2, name: "Team Player", description: "Volunteer for 5 different organizations", completed: false, icon: "FiUsers", progress: 60 },
            { id: 3, name: "Dedication", description: "Volunteer for 50 hours total", completed: false, icon: "FiClock", progress: 48 }
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
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  // Determine color class based on category
  const getCategoryColor = (category) => {
    const categoryColors = {
      "Environmental": "bg-green-100 text-green-800",
      "Community Support": "bg-blue-100 text-blue-800",
      "Education": "bg-purple-100 text-purple-800",
      "Health": "bg-red-100 text-red-800",
      "Arts": "bg-pink-100 text-pink-800",
      "Seniors": "bg-orange-100 text-orange-800"
    };
    
    return categoryColors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Hero Section with Greeting and Stats */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{getGreeting()}, {user?.name || "Volunteer"}</h1>
            <p className="opacity-90 mb-4">Your volunteer impact makes a difference in your community</p>
            <div className="flex gap-2 mt-4">
              <Link to="/dashboard/events" className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg shadow font-medium transition-colors">
                Find Events
              </Link>
              <Link to="/dashboard/my-shifts" className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg shadow font-medium transition-colors">
                View My Shifts
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full md:w-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xl md:text-2xl font-bold">{loading ? "..." : stats.hoursLogged}</p>
              <p className="text-xs md:text-sm opacity-80">Hours Volunteered</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xl md:text-2xl font-bold">{loading ? "..." : stats.eventsParticipated}</p>
              <p className="text-xs md:text-sm opacity-80">Events Joined</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xl md:text-2xl font-bold">{loading ? "..." : stats.upcomingShifts}</p>
              <p className="text-xs md:text-sm opacity-80">Upcoming Shifts</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center relative">
              <svg className="absolute inset-0 m-auto h-full w-full -rotate-90" viewBox="0 0 100 100">
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
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * stats.impactLevel / 100)} 
                  strokeLinecap="round"
                />
              </svg>
              <div className="relative z-10">
                <p className="text-xl md:text-2xl font-bold">{loading ? "..." : `${stats.impactLevel}%`}</p>
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
              <FiTarget className="mr-2 text-indigo-500" /> What would you like to do?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link to="/dashboard/events" className="flex flex-col items-center bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg transition-colors">
                <FiCalendar className="text-indigo-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">Find Events</span>
              </Link>
              <Link to="/dashboard/my-shifts" className="flex flex-col items-center bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors">
                <FiClock className="text-green-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">Log Hours</span>
              </Link>
              <Link to="/dashboard/volunteer-profile" className="flex flex-col items-center bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors">
                <FiUser className="text-purple-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">Update Profile</span>
              </Link>
              <Link to="/dashboard/training" className="flex flex-col items-center bg-orange-50 hover:bg-orange-100 p-4 rounded-lg transition-colors">
                <FiAward className="text-orange-600 text-2xl mb-2" />
                <span className="text-sm font-medium text-center">Training</span>
              </Link>
            </div>
          </div>
          
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiCalendar className="mr-2 text-indigo-500" /> Your Upcoming Events
              </h2>
              <Link to="/dashboard/events/registered" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                View All <FiChevronRight className="ml-1" />
              </Link>
            </div>
            
            {loading ? (
              <div className="py-10 text-center text-gray-500">Loading events...</div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <Link key={event.id} to={`/dashboard/events/${event.id}`} className="block">
                    <div className="border border-gray-100 hover:border-indigo-200 p-4 rounded-lg hover:bg-indigo-50/50 transition-colors flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <span className="flex items-center"><FiClock className="mr-1" /> {formatDate(event.date)}</span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center"><FiMapPin className="mr-1" /> {event.location}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-gray-200 rounded-lg">
                <div className="text-gray-400 mb-2"><FiCalendar className="inline-block text-3xl" /></div>
                <p className="text-gray-500 mb-4">You haven't registered for any upcoming events</p>
                <Link to="/dashboard/events" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Browse Events
                </Link>
              </div>
            )}
          </div>
          
          {/* Volunteer Opportunities */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <FiHeart className="mr-2 text-indigo-500" /> Recommended Opportunities
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link 
                to="/dashboard/events?category=Environmental" 
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl hover:shadow-lg transition-shadow flex flex-col justify-between h-32"
              >
                <FiMapPin className="text-2xl mb-2 text-white/80" />
                <div>
                  <h3 className="font-medium">Environmental</h3>
                  <p className="text-xs text-white/80 mt-1">12 Opportunities</p>
                </div>
              </Link>
              
              <Link 
                to="/dashboard/events?category=Community+Support" 
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl hover:shadow-lg transition-shadow flex flex-col justify-between h-32"
              >
                <FiHeart className="text-2xl mb-2 text-white/80" />
                <div>
                  <h3 className="font-medium">Community Support</h3>
                  <p className="text-xs text-white/80 mt-1">8 Opportunities</p>
                </div>
              </Link>
              
              <Link 
                to="/dashboard/events?category=Education" 
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-xl hover:shadow-lg transition-shadow flex flex-col justify-between h-32"
              >
                <FiBook className="text-2xl mb-2 text-white/80" />
                <div>
                  <h3 className="font-medium">Education</h3>
                  <p className="text-xs text-white/80 mt-1">15 Opportunities</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Right Column - 1/3 width */}
        <div className="space-y-8">
          {/* Profile Completion */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Profile Completion</h2>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">70%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
            </div>
            
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-gray-600">
                <span className="mr-2 text-green-500"><FiCheckCircle /></span>
                Basic information
              </li>
              <li className="flex items-center text-gray-600">
                <span className="mr-2 text-green-500"><FiCheckCircle /></span>
                Skills & interests
              </li>
              <li className="flex items-center text-gray-600">
                <span className="mr-2 text-red-500">○</span>
                Certifications
              </li>
              <li className="flex items-center text-gray-600">
                <span className="mr-2 text-red-500">○</span>
                Emergency contacts
              </li>
            </ul>
            
            <Link to="/dashboard/volunteer-profile" className="w-full mt-4 bg-white text-indigo-600 border border-indigo-600 text-center px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors inline-block">
              Complete Profile
            </Link>
          </div>
          
          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <FiAward className="mr-2 text-indigo-500" /> Your Achievements
            </h2>
            
            {loading ? (
              <div className="py-6 text-center text-gray-500">Loading achievements...</div>
            ) : (
              <div className="space-y-4">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-3 ${achievement.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        <FiAward size={18} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${achievement.completed ? 'text-green-800' : 'text-gray-800'}`}>
                          {achievement.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                        
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${achievement.completed ? 'bg-green-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{achievement.progress}% complete</span>
                            {achievement.completed && <span className="text-green-600 font-medium">Achieved!</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Link to="/dashboard/achievements" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center mt-4">
              View All Achievements <FiChevronRight className="ml-1" />
            </Link>
          </div>
          
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiBell className="mr-2 text-indigo-500" /> Notifications
              </h2>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">3 New</span>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-blue-800 font-medium">Your shift for "Food Bank Distribution" is tomorrow</p>
                <p className="text-xs text-blue-600 mt-1">1 hour ago</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm text-green-800 font-medium">Your hours for "Park Cleanup" have been approved</p>
                <p className="text-xs text-green-600 mt-1">3 hours ago</p>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm text-purple-800 font-medium">New training "First Aid Basics" is available</p>
                <p className="text-xs text-purple-600 mt-1">Yesterday</p>
              </div>
            </div>
            
            <Link to="/dashboard/notifications" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center mt-4">
              View All Notifications <FiChevronRight className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
