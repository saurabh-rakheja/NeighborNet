import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../../../store/authStore";
import {
  FiMapPin,
  FiCalendar,
  FiFilter,
  FiClock,
  FiHeart,
  FiSearch,
  FiChevronDown,
  FiUsers,
  FiTrendingUp,
  FiTag,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";

const OpportunitySearch = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    distance: "all",
    date: "all",
    duration: "all",
  });
  const [savedEvents, setSavedEvents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Fetch events and saved events on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // In a real implementation, these would be actual API calls
        // const eventsResponse = await axios.get('/api/events');
        // const savedResponse = await axios.get('/api/volunteers/saved-events');

        // Mock data for demonstration
        setTimeout(() => {
          // Mock events data
          const mockEvents = [
            {
              id: 1,
              title: "Community Garden Cleanup",
              description:
                "Help clean and prepare the community garden for spring planting.",
              location: {
                address: "124 Park Avenue",
                city: "Springfield",
                state: "IL",
                zipCode: "62701",
              },
              distance: 2.4,
              startDate: "2023-08-15T09:00:00",
              endDate: "2023-08-15T13:00:00",
              duration: 4,
              category: "Environmental",
              status: "Upcoming",
              organizerName: "Green Earth Initiative",
              volunteersNeeded: 15,
              volunteersRegistered: 8,
              matchScore: 92,
              image: "https://example.com/garden.jpg",
            },
            {
              id: 2,
              title: "Food Bank Distribution",
              description:
                "Help distribute food to families in need in our community.",
              location: {
                address: "500 Main Street",
                city: "Springfield",
                state: "IL",
                zipCode: "62701",
              },
              distance: 1.8,
              startDate: "2023-08-05T10:00:00",
              endDate: "2023-08-05T14:00:00",
              duration: 4,
              category: "Community Service",
              status: "Upcoming",
              organizerName: "City Food Bank",
              volunteersNeeded: 10,
              volunteersRegistered: 6,
              matchScore: 88,
              image: "https://example.com/foodbank.jpg",
            },
            {
              id: 3,
              title: "Senior Home Visit Program",
              description:
                "Spend time with seniors at the local retirement home.",
              location: {
                address: "300 Oak Lane",
                city: "Springfield",
                state: "IL",
                zipCode: "62702",
              },
              distance: 3.5,
              startDate: "2023-08-25T13:00:00",
              endDate: "2023-08-25T15:30:00",
              duration: 2.5,
              category: "Healthcare",
              status: "Upcoming",
              organizerName: "Elder Care Alliance",
              volunteersNeeded: 8,
              volunteersRegistered: 2,
              matchScore: 85,
              image: "https://example.com/senior.jpg",
            },
            {
              id: 4,
              title: "After-School Tutoring",
              description:
                "Help students with homework and learning activities.",
              location: {
                address: "200 School Road",
                city: "Springfield",
                state: "IL",
                zipCode: "62704",
              },
              distance: 4.2,
              startDate: "2023-08-20T15:00:00",
              endDate: "2023-08-20T17:00:00",
              duration: 2,
              category: "Education",
              status: "Upcoming",
              organizerName: "Springfield Schools",
              volunteersNeeded: 12,
              volunteersRegistered: 5,
              matchScore: 76,
              image: "https://example.com/tutoring.jpg",
            },
            {
              id: 5,
              title: "Animal Shelter Care Day",
              description:
                "Help clean, feed, and socialize with animals at the local shelter.",
              location: {
                address: "450 Rescue Lane",
                city: "Springfield",
                state: "IL",
                zipCode: "62703",
              },
              distance: 5.1,
              startDate: "2023-08-10T09:00:00",
              endDate: "2023-08-10T12:00:00",
              duration: 3,
              category: "Animal Welfare",
              status: "Upcoming",
              organizerName: "Paws Rescue",
              volunteersNeeded: 10,
              volunteersRegistered: 4,
              matchScore: 79,
              image: "https://example.com/animals.jpg",
            },
            {
              id: 6,
              title: "Youth Mentoring Program",
              description:
                "Mentor at-risk youth and provide guidance and support.",
              location: {
                address: "350 Community Center Drive",
                city: "Springfield",
                state: "IL",
                zipCode: "62704",
              },
              distance: 3.0,
              startDate: "2023-08-18T16:00:00",
              endDate: "2023-08-18T18:00:00",
              duration: 2,
              category: "Education",
              status: "Upcoming",
              organizerName: "Youth Futures",
              volunteersNeeded: 8,
              volunteersRegistered: 3,
              matchScore: 81,
              image: "https://example.com/mentoring.jpg",
            },
          ];

          // Mock saved events (IDs of saved events)
          const mockSavedEvents = [1, 3];

          setEvents(mockEvents);
          setFilteredEvents(mockEvents);
          setSavedEvents(mockSavedEvents);

          // Set recommendations based on match score
          setRecommendations(
            mockEvents.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
          );

          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when filters or search term change
  useEffect(() => {
    let filtered = [...events];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          event.category.toLowerCase().includes(term) ||
          event.organizerName.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(
        (event) => event.category === filters.category
      );
    }

    // Apply distance filter
    if (filters.distance !== "all") {
      const maxDistance = parseInt(filters.distance);
      filtered = filtered.filter((event) => event.distance <= maxDistance);
    }

    // Apply date filter
    if (filters.date !== "all") {
      const now = new Date();
      const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      switch (filters.date) {
        case "today":
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.startDate);
            return eventDate.toDateString() === now.toDateString();
          });
          break;
        case "this-week":
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now && eventDate <= oneWeek;
          });
          break;
        case "this-month":
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.startDate);
            return eventDate >= now && eventDate <= oneMonth;
          });
          break;
      }
    }

    // Apply duration filter
    if (filters.duration !== "all") {
      switch (filters.duration) {
        case "short":
          filtered = filtered.filter((event) => event.duration <= 2);
          break;
        case "medium":
          filtered = filtered.filter(
            (event) => event.duration > 2 && event.duration <= 4
          );
          break;
        case "long":
          filtered = filtered.filter((event) => event.duration > 4);
          break;
      }
    }

    setFilteredEvents(filtered);
  }, [events, filters, searchTerm]);

  // Toggle saved status for an event
  const toggleSaved = (eventId) => {
    if (savedEvents.includes(eventId)) {
      setSavedEvents(savedEvents.filter((id) => id !== eventId));
      toast.success("Removed from saved opportunities");
    } else {
      setSavedEvents([...savedEvents, eventId]);
      toast.success("Added to saved opportunities");
    }

    // In a real implementation, this would make an API call
    // await axios.post('/api/volunteers/toggle-saved', { eventId });
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

  // Get color class based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case "Environmental":
        return "bg-green-100 text-green-800";
      case "Community Service":
        return "bg-blue-100 text-blue-800";
      case "Healthcare":
        return "bg-red-100 text-red-800";
      case "Education":
        return "bg-purple-100 text-purple-800";
      case "Animal Welfare":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: "all",
      distance: "all",
      date: "all",
      duration: "all",
    });
    setSearchTerm("");
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Find Volunteer Opportunities
        </h1>
        <p className="opacity-90 mb-6">
          Discover events that match your interests and make an impact in your
          community
        </p>

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for opportunities by keyword, cause, or organization..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border-none focus:ring-2 focus:ring-purple-300 outline-none text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <FiTrendingUp className="mr-2 text-indigo-500" /> Recommended for You
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                      <FiCalendar className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleSaved(event.id)}
                      className={`p-2 rounded-full ${
                        savedEvents.includes(event.id)
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-gray-600 hover:bg-white"
                      }`}
                    >
                      <FiHeart
                        className={
                          savedEvents.includes(event.id) ? "fill-current" : ""
                        }
                      />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-medium text-indigo-800 flex items-center">
                    <FiTrendingUp className="mr-1" /> {event.matchScore}% Match
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        event.category
                      )}`}
                    >
                      {event.category}
                    </span>
                    <div className="text-xs text-gray-500 flex items-center">
                      <FiMapPin className="mr-1" /> {event.distance} mi
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-800 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="text-xs text-gray-600 space-y-1 mb-4">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2 text-gray-400" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <FiClock className="mr-2 text-gray-400" />
                      <span>{event.duration} hours</span>
                    </div>
                    <div className="flex items-center">
                      <FiUsers className="mr-2 text-gray-400" />
                      <span>
                        {event.volunteersRegistered}/{event.volunteersNeeded}{" "}
                        volunteers
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      By {event.organizerName}
                    </div>
                    <Link
                      to={`/dashboard/events/${event.id}`}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-700 font-medium"
          >
            <FiFilter className="mr-2" />
            Filters
            <FiChevronDown
              className={`ml-1 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          <button
            onClick={resetFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <FiRefreshCw className="mr-1" /> Reset
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-colors"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="Environmental">Environmental</option>
                <option value="Community Service">Community Service</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Animal Welfare">Animal Welfare</option>
              </select>
            </div>

            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-colors"
                value={filters.distance}
                onChange={(e) => handleFilterChange("distance", e.target.value)}
              >
                <option value="all">Any Distance</option>
                <option value="1">Within 1 mile</option>
                <option value="3">Within 3 miles</option>
                <option value="5">Within 5 miles</option>
                <option value="10">Within 10 miles</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-colors"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
              >
                <option value="all">Any Date</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-colors"
                value={filters.duration}
                onChange={(e) => handleFilterChange("duration", e.target.value)}
              >
                <option value="all">Any Duration</option>
                <option value="short">Short (&lt;2 hours)</option>
                <option value="medium">Medium (2-4 hours)</option>
                <option value="long">Long (&gt;4 hours)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
        <FiTag className="mr-2 text-indigo-500" /> Available Opportunities
        <span className="ml-2 text-sm font-normal text-gray-500">
          {filteredEvents.length} results
        </span>
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <FiSearch className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No opportunities found
          </h3>
          <p className="text-gray-500 mb-6">
            Try changing your search terms or filters to find more volunteer
            opportunities
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg shadow font-medium transition-colors"
          >
            <FiRefreshCw className="mr-2" /> Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="md:flex">
                <div className="md:w-1/4 bg-gray-200 h-48 md:h-auto relative">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                      <FiCalendar className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleSaved(event.id)}
                      className={`p-2 rounded-full ${
                        savedEvents.includes(event.id)
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-gray-600 hover:bg-white"
                      }`}
                    >
                      <FiHeart
                        className={
                          savedEvents.includes(event.id) ? "fill-current" : ""
                        }
                      />
                    </button>
                  </div>
                  {event.matchScore > 70 && (
                    <div className="absolute top-2 left-2 bg-white/90 rounded-full px-2 py-0.5 text-xs font-medium text-indigo-800 flex items-center">
                      <FiTrendingUp className="mr-1" /> {event.matchScore}%
                      Match
                    </div>
                  )}
                </div>

                <div className="p-6 md:w-3/4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                          event.category
                        )}`}
                      >
                        {event.category}
                      </span>
                      <h2 className="text-xl font-semibold mt-1 text-gray-800">
                        {event.title}
                      </h2>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <FiMapPin className="mr-1" /> {event.distance} miles away
                    </div>
                  </div>

                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <FiCalendar className="text-gray-400 mr-2" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <FiClock className="text-gray-400 mr-2" />
                      <span>{event.duration} hours</span>
                    </div>
                    <div className="flex items-center">
                      <FiUsers className="text-gray-400 mr-2" />
                      <span>
                        {event.volunteersRegistered}/{event.volunteersNeeded}{" "}
                        volunteers
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      Organized by{" "}
                      <span className="font-medium">{event.organizerName}</span>
                    </div>
                    <div className="mt-2 sm:mt-0 flex space-x-2">
                      <Link
                        to={`/dashboard/events/${event.id}`}
                        className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/dashboard/events/${event.id}/register`}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FiCheckCircle className="mr-1" /> Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitySearch;
