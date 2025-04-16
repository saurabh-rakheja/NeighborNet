import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiUsers,
  FiMapPin,
  FiFilter,
  FiChevronDown,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
} from "react-icons/fi";
import useAuthStore from "../../../../store/authStore";

const NGOEventManagement = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/events/ngo/dashboard", {
          params: {
            status: filter !== "all" ? filter : undefined,
            search: searchTerm || undefined,
            page: currentPage,
            limit: 10,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        // Check if the response has the expected structure and provide fallbacks
        const eventsData = response.data?.events || [];
        const totalPagesCount = response.data?.totalPages || 1;
        
        setEvents(eventsData);
        setTotalPages(totalPagesCount);
        
        // Log the response structure for debugging
        console.log("API Response:", response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
        // Reset events to empty array on error
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filter, searchTerm, currentPage]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time
  const formatTime = (dateString) => {
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        toast.success("Event deleted successfully");
        // Refresh the event list
        setEvents(events.filter(event => event._id !== eventId));
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
  };

  // Filter handlers
  const handleFilterChange = (status) => {
    setFilter(status);
    setCurrentPage(1);
    setShowFilterMenu(false);
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    
    switch (status.toLowerCase()) {
      case "upcoming":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case "ongoing":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "completed":
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        break;
      case "cancelled":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      default:
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
            <p className="text-gray-600">
              Organize and manage your volunteer events
            </p>
          </div>
          <button
            onClick={() => navigate("/ngo-dashboard/events/create")}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg shadow font-medium transition-colors flex items-center"
          >
            <FiPlus className="mr-2" /> Create New Event
          </button>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
            >
              <FiFilter className="mr-2" />
              Filter: {filter === "all" ? "All Events" : filter}
              <FiChevronDown className="ml-2" />
            </button>
            
            {showFilterMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                <ul className="py-1">
                  <li>
                    <button
                      onClick={() => handleFilterChange("all")}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filter === "all" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      All Events
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleFilterChange("upcoming")}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filter === "upcoming" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      Upcoming
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleFilterChange("ongoing")}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filter === "ongoing" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      Ongoing
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleFilterChange("completed")}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filter === "completed" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      Completed
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleFilterChange("cancelled")}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filter === "cancelled" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      Cancelled
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1 md:max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by event name, location..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1 rounded-md"
              >
                <span className="sr-only">Search</span>
                <FiSearch className="text-sm" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 text-gray-300">
              <FiCalendar className="inline-block" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {filter !== "all"
                ? `You don't have any ${filter.toLowerCase()} events.`
                : "You haven't created any events yet."}
            </p>
            <Link
              to="/ngo-dashboard/events/create"
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg shadow font-medium transition-colors inline-flex items-center"
            >
              <FiPlus className="mr-2" /> Create New Event
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                            {event.image ? (
                              <img
                                src={event.image}
                                alt={event.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-500">
                                <FiCalendar />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {event.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {event.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiCalendar className="mr-1 text-xs text-gray-500" />{" "}
                          {formatDate(event.startDate)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <FiClock className="mr-1 text-xs" />{" "}
                          {formatTime(event.startDate)} - {formatTime(event.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiMapPin className="mr-1 text-xs text-gray-500" />{" "}
                          {event.location.city}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.location.state}, {event.location.zipCode}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiUsers className="mr-1 text-xs text-gray-500" />{" "}
                          {event.volunteersRegistered}/{event.volunteersNeeded}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                (event.volunteersRegistered / event.volunteersNeeded) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/dashboard/events/${event._id}`)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <span className="sr-only">View</span>
                            <FiMoreVertical />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/events/edit/${event._id}`)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit Event"
                          >
                            <span className="sr-only">Edit</span>
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Event"
                          >
                            <span className="sr-only">Delete</span>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Help Tips Section */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-medium text-blue-800 flex items-center mb-2">
          <FiHelpCircle className="mr-2" /> Tips for Managing Events
        </h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Use filters to quickly find events by their status</li>
          <li>Create recurring events for regular volunteer opportunities</li>
          <li>Encourage volunteers to sign up by adding detailed descriptions and images</li>
          <li>Send reminders to registered volunteers a day before the event</li>
        </ul>
      </div>
    </div>
  );
};

export default NGOEventManagement; 