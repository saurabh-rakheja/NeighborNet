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
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiCheckCircle,
  FiXCircle,
  FiBarChart2,
  FiCopy,
  FiMessageSquare,
  FiMenu,
  FiHelpCircle,
  FiClipboard,
  FiAlertCircle,
  FiDownload,
} from "react-icons/fi";
import useAuthStore from "../../../../store/authStore";

const ManageEvents = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    upcoming: 0,
    totalVolunteers: 0,
    totalHours: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/ngo/events/manage", {
          params: {
            status: filter !== "all" ? filter : undefined,
            search: searchTerm || undefined,
            page: currentPage,
            limit: 10,
            sortBy,
            sortOrder,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        setEvents(response.data.events);
        setTotalPages(response.data.totalPages);
        setStats(response.data.stats || stats);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filter, searchTerm, currentPage, sortBy, sortOrder]);

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
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await axios.delete(`/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        toast.success("Event deleted successfully");
        // Refresh the event list
        setEvents(events.filter(event => event._id !== eventId));
        setShowActionsMenu(null);
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
  };

  // Handle event status change
  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await axios.patch(`/api/events/${eventId}/status`, {
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      toast.success(`Event marked as ${newStatus}`);
      
      // Update the event in the list
      setEvents(events.map(event => 
        event._id === eventId ? { ...event, status: newStatus } : event
      ));
      setShowActionsMenu(null);
    } catch (error) {
      console.error("Error updating event status:", error);
      toast.error("Failed to update event status");
    }
  };

  // Handle duplicate event
  const handleDuplicateEvent = async (eventId) => {
    try {
      const response = await axios.post(`/api/events/${eventId}/duplicate`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      toast.success("Event duplicated successfully");
      navigate(`/dashboard/events/edit/${response.data.eventId}`);
    } catch (error) {
      console.error("Error duplicating event:", error);
      toast.error("Failed to duplicate event");
    }
  };

  // Handle export volunteer list
  const handleExportVolunteers = async (eventId) => {
    try {
      const response = await axios.get(`/api/events/${eventId}/export-volunteers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: 'blob',
      });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `volunteers-event-${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Volunteer list exported successfully");
      setShowActionsMenu(null);
    } catch (error) {
      console.error("Error exporting volunteers:", error);
      toast.error("Failed to export volunteer list");
    }
  };

  // Filter handlers
  const handleFilterChange = (status) => {
    setFilter(status);
    setCurrentPage(1);
    setShowFilterMenu(false);
  };

  // Sort handlers
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
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

  // Toggle actions menu
  const toggleActionsMenu = (eventId) => {
    setShowActionsMenu(showActionsMenu === eventId ? null : eventId);
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

  // Application status summary
  const ApplicationStatus = ({ applications, capacity }) => {
    const pending = applications?.filter(a => a.status === "pending")?.length || 0;
    const approved = applications?.filter(a => a.status === "approved")?.length || 0;
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
          <span>Approved: {approved}/{capacity}</span>
        </div>
        {pending > 0 && (
          <div className="flex items-center text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
            <span>Pending: {pending}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Events</h1>
            <p className="text-gray-600">
              Create, manage, and analyze your organization's volunteer events
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/events/create")}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg shadow font-medium transition-colors flex items-center"
          >
            <FiPlus className="mr-2" /> Create New Event
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500">Total Events</h3>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FiCalendar className="text-sm" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {loading ? "..." : stats.total}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500">Upcoming</h3>
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <FiCalendar className="text-sm" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {loading ? "..." : stats.upcoming}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500">Active</h3>
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <FiCheckCircle className="text-sm" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {loading ? "..." : stats.active}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500">Completed</h3>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <FiCheckCircle className="text-sm" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {loading ? "..." : stats.completed}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500">Cancelled</h3>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <FiXCircle className="text-sm" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {loading ? "..." : stats.cancelled}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500">Volunteers</h3>
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <FiUsers className="text-sm" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {loading ? "..." : stats.totalVolunteers}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-500">Total Hours</h3>
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <FiClock className="text-sm" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {loading ? "..." : stats.totalHours}
          </p>
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
              to="/dashboard/events/create"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange("title")}>
                      <div className="flex items-center">
                        Event
                        {sortBy === "title" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange("startDate")}>
                      <div className="flex items-center">
                        Date & Time
                        {sortBy === "startDate" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange("status")}>
                      <div className="flex items-center">
                        Status
                        {sortBy === "status" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
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
                        <ApplicationStatus 
                          applications={event.applications} 
                          capacity={event.volunteersNeeded} 
                        />
                        {event.applications && event.applications.some(app => app.status === "pending") && (
                          <button
                            onClick={() => navigate(`/dashboard/applications?eventId=${event._id}`)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                          >
                            <FiClipboard className="mr-1" /> Review applications
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => toggleActionsMenu(event._id)}
                            className="text-gray-500 hover:text-gray-800 p-1"
                            title="More actions"
                          >
                            <FiMoreHorizontal />
                          </button>
                          
                          {showActionsMenu === event._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                              <ul className="py-1">
                                <li>
                                  <button
                                    onClick={() => navigate(`/dashboard/events/${event._id}`)}
                                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center"
                                  >
                                    <FiEye className="mr-2" /> View Details
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => navigate(`/dashboard/events/edit/${event._id}`)}
                                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center"
                                  >
                                    <FiEdit className="mr-2" /> Edit Event
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleDuplicateEvent(event._id)}
                                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center"
                                  >
                                    <FiCopy className="mr-2" /> Duplicate
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => navigate(`/dashboard/volunteers/message?eventId=${event._id}`)}
                                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center"
                                  >
                                    <FiMessageSquare className="mr-2" /> Message Volunteers
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => handleExportVolunteers(event._id)}
                                    className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center"
                                  >
                                    <FiDownload className="mr-2" /> Export Volunteer List
                                  </button>
                                </li>
                                
                                {/* Status change options based on current status */}
                                {event.status !== "cancelled" && (
                                  <li>
                                    <button
                                      onClick={() => handleStatusChange(event._id, "cancelled")}
                                      className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center text-red-600"
                                    >
                                      <FiXCircle className="mr-2" /> Cancel Event
                                    </button>
                                  </li>
                                )}
                                
                                {event.status === "upcoming" && (
                                  <li>
                                    <button
                                      onClick={() => handleStatusChange(event._id, "ongoing")}
                                      className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center text-green-600"
                                    >
                                      <FiCheckCircle className="mr-2" /> Mark as Ongoing
                                    </button>
                                  </li>
                                )}
                                
                                {event.status === "ongoing" && (
                                  <li>
                                    <button
                                      onClick={() => handleStatusChange(event._id, "completed")}
                                      className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center text-purple-600"
                                    >
                                      <FiCheckCircle className="mr-2" /> Mark as Completed
                                    </button>
                                  </li>
                                )}
                                
                                {(event.status === "cancelled" || event.status === "completed") && (
                                  <li>
                                    <button
                                      onClick={() => handleStatusChange(event._id, "upcoming")}
                                      className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 flex items-center text-blue-600"
                                    >
                                      <FiCalendar className="mr-2" /> Reactivate Event
                                    </button>
                                  </li>
                                )}
                                
                                {/* Separator */}
                                <li className="border-t border-gray-100">
                                  <button
                                    onClick={() => handleDeleteEvent(event._id)}
                                    className="block px-4 py-2 text-sm w-full text-left hover:bg-red-50 flex items-center text-red-500"
                                  >
                                    <FiTrash2 className="mr-2" /> Delete Event
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
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

      {/* Event Management Tips */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-medium text-blue-800 flex items-center mb-2">
          <FiHelpCircle className="mr-2" /> Event Management Tips
        </h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Review pending volunteer applications regularly to ensure events are fully staffed</li>
          <li>Update event status (Ongoing, Completed) to keep your dashboard accurate</li>
          <li>Send reminder messages to volunteers 24-48 hours before the event</li>
          <li>Duplicate successful events to save time when creating similar opportunities</li>
          <li>After events, collect feedback from volunteers to improve future experiences</li>
        </ul>
      </div>
    </div>
  );
};

export default ManageEvents; 