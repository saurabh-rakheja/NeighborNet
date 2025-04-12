import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../../store/authStore";
import axios from "axios";
import {
  FiCalendar,
  FiClock,
  FiEdit,
  FiEye,
  FiFilter,
  FiMapPin,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";

const EventManagement = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        // In a real implementation, this would be an actual API call
        // const response = await axios.get('/api/events/my-events');
        // setEvents(response.data);

        // Mock data for demonstration
        setTimeout(() => {
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
              startDate: "2023-08-15T09:00:00",
              endDate: "2023-08-15T13:00:00",
              category: "Environmental",
              status: "Upcoming",
              volunteersNeeded: 15,
              volunteersRegistered: 8,
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
              startDate: "2023-08-05T10:00:00",
              endDate: "2023-08-05T14:00:00",
              category: "Community Service",
              status: "Ongoing",
              volunteersNeeded: 10,
              volunteersRegistered: 10,
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
              startDate: "2023-07-25T13:00:00",
              endDate: "2023-07-25T15:30:00",
              category: "Healthcare",
              status: "Completed",
              volunteersNeeded: 8,
              volunteersRegistered: 6,
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
              startDate: "2023-08-20T15:00:00",
              endDate: "2023-08-20T17:00:00",
              category: "Education",
              status: "Upcoming",
              volunteersNeeded: 12,
              volunteersRegistered: 5,
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
              startDate: "2023-07-10T09:00:00",
              endDate: "2023-07-10T12:00:00",
              category: "Animal Welfare",
              status: "Completed",
              volunteersNeeded: 10,
              volunteersRegistered: 9,
              image: "https://example.com/animals.jpg",
            },
          ];

          setEvents(mockEvents);
          setFilteredEvents(mockEvents);
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load events");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...events];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((event) => event.status === statusFilter);
    }

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          event.category.toLowerCase().includes(term)
      );
    }

    setFilteredEvents(result);
  }, [events, statusFilter, searchTerm]);

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      // In a real implementation, this would be an API call
      // await axios.put(`/api/events/${eventId}`, { status: newStatus });

      // Update local state
      const updatedEvents = events.map((event) => {
        if (event.id === eventId) {
          return { ...event, status: newStatus };
        }
        return event;
      });

      setEvents(updatedEvents);
      toast.success(`Event status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating event status:", error);
      toast.error("Failed to update event status");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // In a real implementation, this would be an API call
      // await axios.delete(`/api/events/${eventId}`);

      // Update local state
      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Ongoing":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-purple-100 text-purple-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Event Management</h1>
            <p className="opacity-90 mt-1">
              Manage your volunteer events and monitor their status
            </p>
          </div>
          <Link
            to="/dashboard/create-event"
            className="inline-flex items-center bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg shadow font-medium transition-colors"
          >
            <FiPlus className="mr-2" /> Create New Event
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <FiCalendar className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            No events found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Try changing your search or filters"
              : "You haven't created any events yet"}
          </p>
          <Link
            to="/dashboard/create-event"
            className="inline-flex items-center bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg shadow font-medium transition-colors"
          >
            <FiPlus className="mr-2" /> Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="md:flex">
                <div className="md:w-1/4 bg-gray-200 h-48 md:h-auto">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <FiCalendar className="h-12 w-12" />
                    </div>
                  )}
                </div>

                <div className="p-6 md:w-3/4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                      <h2 className="text-xl font-semibold mt-2 text-gray-800">
                        {event.title}
                      </h2>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-start space-x-2">
                      <Link
                        to={`/dashboard/events/${event.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 hover:border-blue-300 rounded-lg text-sm transition-colors"
                      >
                        <FiEye className="mr-1" /> View
                      </Link>
                      <Link
                        to={`/dashboard/edit-event/${event.id}`}
                        className="inline-flex items-center text-yellow-600 hover:text-yellow-800 px-3 py-1 border border-yellow-200 hover:border-yellow-300 rounded-lg text-sm transition-colors"
                      >
                        <FiEdit className="mr-1" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-800 px-3 py-1 border border-red-200 hover:border-red-300 rounded-lg text-sm transition-colors"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    <p className="line-clamp-2 mb-4">{event.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                      <div className="flex items-center">
                        <FiMapPin className="text-gray-400 mr-2" />
                        <span>
                          {event.location.city}, {event.location.state}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-2" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <FiUsers className="text-gray-400 mr-2" />
                        <span>
                          {event.volunteersRegistered}/{event.volunteersNeeded}{" "}
                          volunteers
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="text-gray-400 mr-2" />
                        <span>
                          {new Date(event.endDate).getHours() -
                            new Date(event.startDate).getHours()}{" "}
                          hours
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Update Event Status:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(event.id, "Upcoming")
                          }
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            event.status === "Upcoming"
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }`}
                        >
                          Upcoming
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(event.id, "Ongoing")
                          }
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            event.status === "Ongoing"
                              ? "bg-green-600 text-white"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          Ongoing
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(event.id, "Completed")
                          }
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            event.status === "Completed"
                              ? "bg-purple-600 text-white"
                              : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                          }`}
                        >
                          Completed
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(event.id, "Cancelled")
                          }
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            event.status === "Cancelled"
                              ? "bg-red-600 text-white"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          Cancelled
                        </button>
                      </div>
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

export default EventManagement;
