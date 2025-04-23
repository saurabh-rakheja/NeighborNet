import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiSearch,
  FiX,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiSliders,
} from "react-icons/fi";

const PublicEvents = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Available categories
  const categories = [
    { value: "", label: "All Categories" },
    { value: "environment", label: "Environment" },
    { value: "education", label: "Education" },
    { value: "health", label: "Health & Wellness" },
    { value: "community", label: "Community Development" },
    { value: "animal welfare", label: "Animal Welfare" },
    { value: "food donation", label: "Food Donation" },
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        limit: 6,
        ...(search && { search }),
        ...(category && { category }),
        ...(location && { location }),
      });

      const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
      });

      const { data } = await api.get(`/events?${params}`);

      if (data?.success) {
        setEvents(data.data || []);
        setTotalEvents(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 6));
      } else {
        throw new Error(data?.message || "Failed to fetch events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(
        err.response?.data?.message || err.message || "Error loading events"
      );
      setEvents([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, category, location]);

  // Search when the user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchEvents();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    setCurrentPage(1);
  };

  const Pagination = () => (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "text-gray-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <FiChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-1 rounded ${
            currentPage === i + 1
              ? "bg-indigo-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() =>
          currentPage < totalPages && setCurrentPage(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "text-gray-300"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );

  const CategoryBadge = ({ category }) => {
    const styles = {
      environment: "bg-green-50 text-green-700",
      education: "bg-blue-50 text-blue-700",
      health: "bg-pink-50 text-pink-700",
      community: "bg-orange-50 text-orange-700",
      "animal welfare": "bg-yellow-50 text-yellow-700",
      "food donation": "bg-indigo-50 text-indigo-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          styles[category.toLowerCase()] || "bg-gray-50 text-gray-700"
        }`}
      >
        {category}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Volunteer Opportunities
        </h1>
        <p className="text-gray-600">
          Find volunteer opportunities that match your interests and make a
          difference in your community.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search opportunities..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              {search && (
                <button
                  className="absolute right-3 top-3 text-gray-400"
                  onClick={() => setSearch("")}
                >
                  <FiX />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 flex items-center"
            >
              <FiFilter className="mr-2" />
              {showFilters ? "Hide Filters" : "Filters"}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City or zip code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center mb-6">
          <FiAlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Events grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <FiSearch className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-500 mb-4">
            We couldn't find any events matching your search criteria.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => (
              <div
                key={event._id || event.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <CategoryBadge category={event.category} />
                    {event.status === "full" && (
                      <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        Full
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2 text-gray-400" size={14} />
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center">
                      <FiClock className="mr-2 text-gray-400" size={14} />
                      {formatTime(event.startDate)}
                    </div>
                    <div className="flex items-center">
                      <FiMapPin className="mr-2 text-gray-400" size={14} />
                      {event.location.city}, {event.location.state}
                    </div>
                    <div className="flex items-center">
                      <FiUsers className="mr-2 text-gray-400" size={14} />
                      {event.registeredVolunteers?.length || 0} of{" "}
                      {event.volunteersNeeded} volunteers
                    </div>
                  </div>
                  <Link
                    to={`/events/${event._id || event.id}`}
                    className="block text-center py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing {events.length} of {totalEvents} events
            </p>
            {totalPages > 1 && <Pagination />}
          </div>
        </>
      )}

      {/* Call to action */}
      <div className="mt-12 bg-indigo-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-indigo-800 mb-2">
          Ready to make a difference?
        </h2>
        <p className="text-indigo-600 mb-6 max-w-2xl mx-auto">
          Join our community of volunteers and connect with organizations that
          are making a positive impact. Create an account to track your
          volunteer hours and find opportunities that match your interests.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/auth/signup"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Sign Up
          </Link>
          <Link
            to="/auth/login"
            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicEvents;
