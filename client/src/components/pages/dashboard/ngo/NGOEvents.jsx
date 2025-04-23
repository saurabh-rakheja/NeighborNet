import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiPlus,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";

const NGOEvents = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
    },
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        limit: 5,
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });

      const { data } = await api.get(`/events/ngo/dashboard?${params}`);

      if (data?.success) {
        setEvents(data.events);
        setTotalEvents(data.totalEvents);
        setTotalPages(data.totalPages);
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
  }, [currentPage, status, search]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (start, end) => {
    const startTime = new Date(start).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    const endTime = new Date(end).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${startTime} - ${endTime}`;
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete event");
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      upcoming: "bg-blue-100 text-blue-800",
      ongoing: "bg-green-100 text-green-800",
      full: "bg-orange-100 text-orange-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          styles[status.toLowerCase()] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  };

  const CategoryBadge = ({ category }) => {
    const styles = {
      environment: "bg-green-50 text-green-700",
      environmental: "bg-green-50 text-green-700",
      education: "bg-blue-50 text-blue-700",
      health: "bg-pink-50 text-pink-700",
      healthcare: "bg-pink-50 text-pink-700",
      community: "bg-orange-50 text-orange-700",
      "community service": "bg-orange-50 text-orange-700",
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

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Events</h2>
        <Link
          to="/ngo-dashboard/create-event"
          className="bg-indigo-600 text-white px-3 py-2 rounded-lg flex items-center hover:bg-indigo-700 text-sm"
        >
          <FiPlus className="mr-1" /> Create Event
        </Link>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          {search && (
            <button
              className="absolute right-3 top-3 text-gray-400"
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
            >
              <FiX />
            </button>
          )}
        </div>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="full">Full</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center mb-4">
          <FiAlertCircle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Events list */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="py-10 text-center">
            <FiCalendar size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-gray-500">No events found</h3>
            <Link
              to="/ngo-dashboard/create-event"
              className="inline-block mt-3 text-indigo-600 hover:underline"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {events.map((event) => (
                <div
                  key={event._id || event.id}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <StatusBadge status={event.status} />
                        <CategoryBadge category={event.category} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-2">
                        <div className="flex items-center">
                          <FiCalendar
                            className="mr-1 text-gray-400"
                            size={14}
                          />
                          {formatDate(event.startDate)}
                        </div>
                        <div className="flex items-center">
                          <FiClock className="mr-1 text-gray-400" size={14} />
                          {formatTime(event.startDate, event.endDate)}
                        </div>
                        <div className="flex items-center">
                          <FiMapPin className="mr-1 text-gray-400" size={14} />
                          {event.location.city}
                        </div>
                        <div className="flex items-center">
                          <FiUsers className="mr-1 text-gray-400" size={14} />
                          {event.volunteersRegistered ||
                            (event.registeredVolunteers &&
                              event.registeredVolunteers.length) ||
                            0}
                          /{event.volunteersNeeded} Volunteers
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/ngo-dashboard/events/${
                          event._id || event.id
                        }/edit`}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id || event.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Link
                      to={`/ngo-dashboard/events/${event._id || event.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Showing {events.length} of {totalEvents} events
              </span>
              <Pagination />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NGOEvents;
