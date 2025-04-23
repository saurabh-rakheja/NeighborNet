import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../../../store/authStore";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiFilter,
  FiSearch,
  FiPlus,
  FiChevronDown,
  FiCheckCircle,
  FiChevronRight,
  FiShare2,
  FiEdit2,
  FiTrash2,
  FiAlertCircle,
} from "react-icons/fi";
import { eventApi } from "../../../../services/eventApi";
import { ngoApi } from "../../../../services/ngoApi";
import { volunteerApi } from "../../../../services/volunteerApi";

const Events = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [applyingToEvent, setApplyingToEvent] = useState(null);
  const isNGO = user?.role === "ngo";

  // Add applying state to track which event is currently being applied to
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        let response;
        if (isNGO) {
          // Fetch events created by the NGO
          response = await ngoApi.getEvents();
        } else {
          // Fetch all events for volunteers
          response = await eventApi.getEvents();
        }

        if (response.success) {
          const eventsData = response.data || [];

          // Transform API data if needed to match component expectations
          const formattedEvents = eventsData.map((event) => ({
            ...event,
            // Ensure all required fields exist
            skills: event.skillsRequired || [],
            remainingSpots:
              event.volunteersNeeded - (event.volunteersRegistered || 0),
            totalSpots: event.volunteersNeeded,
            // Convert startDate/endDate to expected format if needed
            startTime: new Date(event.startDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            endTime: new Date(event.endDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: new Date(event.startDate).toISOString().split("T")[0],
            // Parse location string if it's not already an object
            location:
              typeof event.location === "string"
                ? event.location
                : `${event.location.address}, ${event.location.city}, ${event.location.state} ${event.location.zipCode}`,
            // Convert status to lowercase to match filters
            status: event.status?.toLowerCase() || "upcoming",
            // Initialize isApplied to false
            isApplied: false,
          }));

          setEvents(formattedEvents);
          setFilteredEvents(formattedEvents);
        } else {
          throw new Error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to load event list");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isNGO, user]);

  // Fetch volunteer applications to mark applied events
  useEffect(() => {
    const fetchApplications = async () => {
      if (!isNGO && user?.role === "volunteer") {
        try {
          const response = await volunteerApi.getApplications();

          if (response.success) {
            const applications = response.applications || [];

            // Update events to mark those that the volunteer has already applied to
            const updatedEvents = events.map((event) => ({
              ...event,
              isApplied: applications.some(
                (app) =>
                  (app.event && app.event._id === event._id) ||
                  app.eventId === event._id
              ),
            }));

            setEvents(updatedEvents);

            // Also update filtered events
            const updatedFilteredEvents = filteredEvents.map((event) => ({
              ...event,
              isApplied: applications.some(
                (app) =>
                  (app.event && app.event._id === event._id) ||
                  app.eventId === event._id
              ),
            }));

            setFilteredEvents(updatedFilteredEvents);
          }
        } catch (error) {
          console.error("Error fetching applications:", error);
        }
      }
    };

    if (events.length > 0) {
      fetchApplications();
    }
  }, [events.length, isNGO, user?.role, filteredEvents]);

  // Apply filters and search
  useEffect(() => {
    let result = [...events];

    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(lowerSearchTerm) ||
          event.description.toLowerCase().includes(lowerSearchTerm) ||
          event.organizationName?.toLowerCase().includes(lowerSearchTerm) ||
          (typeof event.location === "string" &&
            event.location.toLowerCase().includes(lowerSearchTerm)) ||
          event.skills.some((skill) =>
            skill.toLowerCase().includes(lowerSearchTerm)
          )
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter((event) => event.status === filterStatus);
    }

    // Apply date range filter
    if (filterDateRange !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventDate = (event) => new Date(event.date);

      switch (filterDateRange) {
        case "today":
          result = result.filter((event) => {
            const date = eventDate(event);
            return (
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
            );
          });
          break;
        case "week": {
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          result = result.filter((event) => {
            const date = eventDate(event);
            return date >= today && date <= nextWeek;
          });
          break;
        }
        case "month": {
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1);
          result = result.filter((event) => {
            const date = eventDate(event);
            return date >= today && date <= nextMonth;
          });
          break;
        }
        default:
          break;
      }
    }

    setFilteredEvents(result);
  }, [events, searchTerm, filterStatus, filterDateRange]);

  // Format date
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Share event
  const shareEvent = (eventId, eventTitle) => {
    const url = `${window.location.origin}/events/${eventId}`;
    navigator.clipboard.writeText(url);
    toast.success(`Link for "${eventTitle}" copied to clipboard!`);
  };

  // Delete event (for NGOs)
  const deleteEvent = async (eventId, eventTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        const response = isNGO
          ? await ngoApi.deleteEvent(eventId)
          : await eventApi.deleteEvent(eventId);

        if (response.success) {
          // Remove the deleted event from state
          const updatedEvents = events.filter((event) => event._id !== eventId);
          setEvents(updatedEvents);
          toast.success(`Event "${eventTitle}" has been deleted`);
        } else {
          throw new Error(response.message || "Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error(error.message || "Failed to delete event");
      }
    }
  };

  // Apply for an event
  const handleApply = async (eventId) => {
    if (user?.role !== "volunteer") {
      toast.error("Only volunteers can apply for events");
      return;
    }

    // Check if already applied in UI state
    const event = events.find((event) => event._id === eventId);
    if (event && event.isApplied) {
      toast.info("You have already applied for this event");
      return;
    }

    setApplyingToEvent(eventId);
    setApplying(true);

    try {
      // Apply for the event
      const response = await volunteerApi.applyForEvent(eventId, {
        motivationLetter: "I am interested in this volunteering opportunity.",
      });

      if (response.success) {
        // Update the event in state to mark it as applied
        const updatedEvents = events.map((event) =>
          event._id === eventId ? { ...event, isApplied: true } : event
        );
        setEvents(updatedEvents);

        const updatedFilteredEvents = filteredEvents.map((event) =>
          event._id === eventId ? { ...event, isApplied: true } : event
        );
        setFilteredEvents(updatedFilteredEvents);

        toast.success("Successfully applied for event");
      } else {
        throw new Error(response.message || "Failed to apply for event");
      }
    } catch (error) {
      console.error("Error applying for event:", error);

      // Check if the error message indicates the user is already registered
      if (
        error.message &&
        (error.message.includes("already registered") ||
          error.message.includes("already applied") ||
          error.message.includes("already exists"))
      ) {
        toast.info("You have already registered for this event");

        // Update UI to show as applied anyway
        const updatedEvents = events.map((event) =>
          event._id === eventId ? { ...event, isApplied: true } : event
        );
        setEvents(updatedEvents);

        const updatedFilteredEvents = filteredEvents.map((event) =>
          event._id === eventId ? { ...event, isApplied: true } : event
        );
        setFilteredEvents(updatedFilteredEvents);
      } else {
        toast.error(error.message || "Error applying for event");
      }
    } finally {
      setApplying(false);
      setApplyingToEvent(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {isNGO ? "Manage Your Events" : "Available Volunteer Opportunities"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNGO
              ? "Create and manage volunteer events for your organization"
              : "Find and join volunteer opportunities in your community"}
          </p>
        </div>

        {isNGO && (
          <Link
            to="/dashboard/events/create"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="mr-2" />
            Create New Event
          </Link>
        )}
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div className="relative min-w-[150px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FiChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Date range filter */}
          <div className="relative min-w-[150px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FiChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Event cards */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No events found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== "all" || filterDateRange !== "all"
              ? "Try adjusting your filters or search term"
              : isNGO
              ? "Create your first volunteer event to get started!"
              : "Check back later for new volunteer opportunities."}
          </p>
          {isNGO && (
            <div className="mt-6">
              <Link
                to="/dashboard/events/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiPlus className="mr-2" />
                Create New Event
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  {/* Status badge */}
                  <span
                    className={`uppercase text-xs font-semibold rounded-full px-2 py-1 ${
                      event.status === "upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : event.status === "ongoing"
                        ? "bg-green-100 text-green-800"
                        : event.status === "completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                {/* Organization name */}
                {event.organizationName && (
                  <p className="text-indigo-600 font-semibold mb-2">
                    {event.organizationName}
                  </p>
                )}

                {/* Description preview */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {event.description}
                </p>

                {/* Event details */}
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  {/* Date and time */}
                  <div className="flex items-center">
                    <FiCalendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500" />
                    <span>
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start">
                    <FiMapPin className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  {/* Available spots */}
                  <div className="flex items-center">
                    <FiUsers className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500" />
                    <span>
                      {event.remainingSpots} of {event.totalSpots} spots
                      available
                    </span>
                  </div>
                </div>

                {/* Skills tags */}
                {event.skills && event.skills.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {event.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {skill}
                      </span>
                    ))}
                    {event.skills.length > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{event.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <Link
                    to={`/dashboard/events/${event._id}`}
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View Details
                    <FiChevronRight className="ml-1 h-4 w-4" />
                  </Link>

                  <div className="flex items-center space-x-2">
                    {!isNGO &&
                      user?.role === "volunteer" &&
                      (event.isApplied ? (
                        <button
                          disabled
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-500 cursor-default"
                        >
                          <FiCheckCircle className="mr-1.5 h-4 w-4" />
                          Applied
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(event._id)}
                          disabled={
                            applying ||
                            event.status !== "upcoming" ||
                            event.remainingSpots <= 0
                          }
                          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white 
                            ${
                              applying && applyingToEvent === event._id
                                ? "bg-indigo-400 cursor-wait"
                                : event.status !== "upcoming" ||
                                  event.remainingSpots <= 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                        >
                          {applying && applyingToEvent === event._id ? (
                            <>
                              <span className="animate-spin mr-1.5 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              Applying...
                            </>
                          ) : (
                            "Apply Now"
                          )}
                        </button>
                      ))}

                    <button
                      onClick={() => shareEvent(event._id, event.title)}
                      className="p-1.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                      aria-label="Share event"
                    >
                      <FiShare2 className="h-4 w-4" />
                    </button>

                    {isNGO && (
                      <>
                        <Link
                          to={`/dashboard/events/${event._id}/edit`}
                          className="p-1.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                          aria-label="Edit event"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => deleteEvent(event._id, event.title)}
                          className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50"
                          aria-label="Delete event"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
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

export default Events;
