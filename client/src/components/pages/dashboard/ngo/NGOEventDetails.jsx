import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiCheckCircle,
  FiEdit,
  FiArrowLeft,
  FiTrash2,
  FiDownload,
  FiCheck,
  FiX,
  FiMail,
  FiPhone,
  FiUserX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ngoApi } from "../../../../services/ngoApi";
import LoadingSpinner from "../../../LoadingSpinner";

// Helper function to safely render any value
const safeRender = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

// Function to directly display address information without any complex processing
const renderAddressInfo = (address) => {
  // Handle case when address is already a string
  if (typeof address === "string") {
    try {
      // Try to parse it in case it's a stringified JSON
      const parsedAddress = JSON.parse(address);
      address = parsedAddress;
    } catch (e) {
      // If it's not valid JSON, just return it as a string
      return address;
    }
  }

  // By this point, address should be an object if it wasn't a non-parseable string
  if (address && typeof address === "object") {
    return (
      <div className="space-y-1">
        {address.address && (
          <p className="text-gray-800 font-medium">{address.address}</p>
        )}
        <p className="text-gray-600">
          {[address.city, address.state, address.zipCode]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>
    );
  }

  // Fallback for any other case
  return JSON.stringify(address);
};

const NGOEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [volunteersLoading, setVolunteersLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await ngoApi.getEventById(id);

        if (response.success) {
          console.log("Event data received:", response.data);
          console.log("Address data:", response.data.address);
          setEvent(response.data);
        } else {
          toast.error("Failed to fetch event details");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast.error("An error occurred while loading event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      if (!id) return;

      try {
        console.log("Fetching volunteers for event:", id);
        setVolunteersLoading(true);

        let response;
        try {
          // Try the getEventParticipants method first
          response = await ngoApi.getEventParticipants(id);
          console.log("Response from getEventParticipants:", response);
        } catch (error) {
          console.error(
            "Error with getEventParticipants, trying getVolunteerRegistrations",
            error
          );
          // Fallback to getVolunteerRegistrations
          response = await ngoApi.getVolunteerRegistrations(id);
          console.log("Response from getVolunteerRegistrations:", response);
        }

        if (response.success) {
          setVolunteers(response.data || []);
          console.log("Volunteers set:", response.data);
        } else {
          toast.error("Failed to fetch event volunteers");
        }
      } catch (error) {
        console.error("All methods failed, error fetching volunteers:", error);
        toast.error("An error occurred while loading volunteers");
      } finally {
        setVolunteersLoading(false);
      }
    };

    if (activeTab === "volunteers") {
      fetchVolunteers();
    }
  }, [id, activeTab]);

  const handleDeleteEvent = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await ngoApi.deleteEvent(id);

        if (response.success) {
          toast.success("Event deleted successfully");
          navigate("/ngo-dashboard/events");
        } else {
          toast.error(response.message || "Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("An error occurred while deleting the event");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBD";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "TBD";

    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCheckIn = async (volunteerId) => {
    try {
      const response = await ngoApi.checkInVolunteer(volunteerId);

      if (response.success) {
        // Update the volunteer in the local state
        const updatedVolunteers = volunteers.map((v) =>
          v._id === volunteerId
            ? { ...v, status: "Attended", checkInTime: new Date() }
            : v
        );
        setVolunteers(updatedVolunteers);
        toast.success("Volunteer checked in successfully");
      } else {
        toast.error(response.message || "Failed to check in volunteer");
      }
    } catch (error) {
      console.error("Error checking in volunteer:", error);
      toast.error("An error occurred while checking in the volunteer");
    }
  };

  const handleCheckOut = async (volunteerId) => {
    try {
      // Ask for hours logged
      const { value: hoursLogged } = await Swal.fire({
        title: "Enter hours logged",
        input: "number",
        inputLabel: "Hours",
        inputPlaceholder: "Enter the number of hours",
        inputAttributes: {
          min: 0.5,
          step: 0.5,
        },
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Please enter the hours logged";
          }
          if (value <= 0) {
            return "Hours must be greater than 0";
          }
        },
      });

      if (hoursLogged) {
        const response = await ngoApi.checkOutVolunteer(volunteerId, {
          hoursLogged,
        });

        if (response.success) {
          // Update the volunteer in the local state
          const updatedVolunteers = volunteers.map((v) =>
            v._id === volunteerId
              ? {
                  ...v,
                  status: "Completed",
                  checkOutTime: new Date(),
                  hoursLogged,
                }
              : v
          );
          setVolunteers(updatedVolunteers);
          toast.success("Volunteer checked out successfully");
        } else {
          toast.error(response.message || "Failed to check out volunteer");
        }
      }
    } catch (error) {
      console.error("Error checking out volunteer:", error);
      toast.error("An error occurred while checking out the volunteer");
    }
  };

  const handleRemoveVolunteer = async (volunteer) => {
    try {
      // Get volunteer name for confirmation dialog
      const volunteerName =
        volunteer.volunteerId && typeof volunteer.volunteerId === "object"
          ? volunteer.volunteerId.name || "this volunteer"
          : "this volunteer";

      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Remove Volunteer",
        text: `Are you sure you want to remove ${volunteerName} from this event?`,
        icon: "warning",
        input: "textarea",
        inputLabel: "Reason (optional)",
        inputPlaceholder: "Enter reason for removal...",
        showCancelButton: true,
        confirmButtonText: "Remove",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
      });

      if (result.isConfirmed) {
        // Extract volunteerId safely
        const volunteerId =
          volunteer.volunteerId && typeof volunteer.volunteerId === "object"
            ? volunteer.volunteerId._id
            : volunteer.volunteerId;

        if (!volunteerId) {
          toast.error("Could not identify the volunteer");
          return;
        }

        // Call API to remove volunteer
        const response = await ngoApi.removeVolunteerFromEvent(
          event._id,
          volunteerId,
          result.value
        );

        if (response.success) {
          // Update volunteers list by removing the volunteer
          const updatedVolunteers = volunteers.filter(
            (v) => v._id !== volunteer._id
          );
          setVolunteers(updatedVolunteers);

          toast.success("Volunteer removed successfully");
        } else {
          toast.error(response.message || "Failed to remove volunteer");
        }
      }
    } catch (error) {
      console.error("Error removing volunteer:", error);
      toast.error("An error occurred while removing the volunteer");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Event not found</h2>
        <p className="mt-2 text-gray-600">
          The event you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Link
          to="/ngo-dashboard/events"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Event Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 sm:px-8 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {safeRender(event.title)}
            </h1>
            <div className="flex items-center mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.status === "Upcoming"
                    ? "bg-green-100 text-green-800"
                    : event.status === "Ongoing"
                    ? "bg-blue-100 text-blue-800"
                    : event.status === "Completed"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {safeRender(event.status)}
              </span>
              <span className="ml-2 text-white text-sm opacity-90">
                {event.virtual ? "Virtual Event" : "In-person Event"}
              </span>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link
              to={`/ngo-dashboard/events/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
            >
              <FiEdit className="mr-2" /> Edit Event
            </Link>
            <button
              onClick={handleDeleteEvent}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <FiTrash2 className="mr-2" /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === "details"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Event Details
          </button>
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === "volunteers"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("volunteers")}
          >
            Volunteers
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === "details" && (
          <div className="space-y-8">
            {/* Event dates and location */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <FiCalendar className="mt-1 h-5 w-5 text-indigo-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Date</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatDate(event.startDate)} -{" "}
                      {formatDate(event.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <FiClock className="mt-1 h-5 w-5 text-indigo-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Time</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatTime(event.startDate)} -{" "}
                      {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <FiUsers className="mt-1 h-5 w-5 text-indigo-500" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Volunteers
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {event.volunteersRegistered || 0} registered /{" "}
                      {event.volunteersNeeded || 0} needed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            {!event.virtual && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <FiMapPin className="mt-1 h-5 w-5 text-indigo-500" />
                  <div className="ml-3 w-full">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Location
                    </h3>

                    {/* Display the address from the location object */}
                    {event.location && typeof event.location === "object" && (
                      <div className="bg-white p-3 rounded-md border border-gray-200">
                        {event.location.address && (
                          <p className="text-sm font-medium text-gray-800">
                            {event.location.address}
                          </p>
                        )}

                        <p className="text-sm text-gray-600">
                          {[
                            event.location.city,
                            event.location.state,
                            event.location.zipCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    )}

                    {/* If location is a string, display it directly */}
                    {event.location && typeof event.location === "string" && (
                      <p className="text-sm text-gray-700">{event.location}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Description
              </h3>
              <div className="prose max-w-none">
                <p className="text-gray-700">{safeRender(event.description)}</p>
              </div>
            </div>

            {/* Skills required */}
            {event.skillsRequired &&
              Array.isArray(event.skillsRequired) &&
              event.skillsRequired.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Skills Required
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.skillsRequired.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                      >
                        {safeRender(skill)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {activeTab === "volunteers" && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Registered Volunteers
            </h3>

            {/* Debug section */}
            <div className="bg-yellow-100 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-yellow-800">Debug Information</h4>
              <p>Volunteers loading: {volunteersLoading ? "Yes" : "No"}</p>
              <p>
                Volunteers count: {volunteers ? volunteers.length : "undefined"}
              </p>
              <p>Active tab: {activeTab}</p>
              <button
                onClick={() => {
                  console.log("Manual refresh");
                  const fetchVolunteers = async () => {
                    try {
                      setVolunteersLoading(true);
                      console.log(
                        "Manually fetching volunteers for event:",
                        id
                      );

                      let response;
                      try {
                        // Try the getEventParticipants method first
                        response = await ngoApi.getEventParticipants(id);
                        console.log(
                          "Response from getEventParticipants:",
                          response
                        );
                      } catch (error) {
                        console.error(
                          "Error with getEventParticipants, trying getVolunteerRegistrations",
                          error
                        );
                        // Fallback to getVolunteerRegistrations
                        response = await ngoApi.getVolunteerRegistrations(id);
                        console.log(
                          "Response from getVolunteerRegistrations:",
                          response
                        );
                      }

                      if (response.success) {
                        setVolunteers(response.data || []);
                        console.log("Volunteers set:", response.data);
                      } else {
                        toast.error("Failed to fetch volunteers");
                      }
                    } catch (error) {
                      console.error("All methods failed, error:", error);
                      toast.error("Error fetching volunteers");
                    } finally {
                      setVolunteersLoading(false);
                    }
                  };
                  fetchVolunteers();
                }}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Refresh Volunteers
              </button>
            </div>

            {volunteersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : volunteers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  No volunteers have registered for this event yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Volunteer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Shift
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Hours
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {volunteers.map((volunteer) => (
                      <tr key={volunteer._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {volunteer.volunteerId &&
                                typeof volunteer.volunteerId === "object"
                                  ? safeRender(volunteer.volunteerId.name) ||
                                    "Unknown Volunteer"
                                  : "Unknown Volunteer"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {volunteer.volunteerId &&
                                typeof volunteer.volunteerId === "object"
                                  ? safeRender(volunteer.volunteerId.email)
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              volunteer.status === "Registered"
                                ? "bg-yellow-100 text-yellow-800"
                                : volunteer.status === "Confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : volunteer.status === "Attended"
                                ? "bg-green-100 text-green-800"
                                : volunteer.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : volunteer.status === "No-Show"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {safeRender(volunteer.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {volunteer.shiftId &&
                          typeof volunteer.shiftId === "object"
                            ? safeRender(volunteer.shiftId.name)
                            : "No shift"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {safeRender(volunteer.hoursLogged) || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {/* Show check-in button if participant is registered or confirmed */}
                            {(volunteer.status === "Registered" ||
                              volunteer.status === "Confirmed") && (
                              <button
                                onClick={() => handleCheckIn(volunteer._id)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Check In"
                              >
                                <FiCheck className="w-5 h-5" />
                              </button>
                            )}

                            {/* Show check-out button if participant is checked in */}
                            {volunteer.status === "Attended" && (
                              <button
                                onClick={() => handleCheckOut(volunteer._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Check Out"
                              >
                                <FiCheckCircle className="w-5 h-5" />
                              </button>
                            )}

                            {/* Contact buttons */}
                            {volunteer.volunteerId &&
                              typeof volunteer.volunteerId === "object" &&
                              volunteer.volunteerId.email && (
                                <a
                                  href={`mailto:${volunteer.volunteerId.email}`}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Email"
                                >
                                  <FiMail className="w-5 h-5" />
                                </a>
                              )}

                            {volunteer.volunteerId &&
                              typeof volunteer.volunteerId === "object" &&
                              volunteer.volunteerId.phoneNumber && (
                                <a
                                  href={`tel:${volunteer.volunteerId.phoneNumber}`}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Call"
                                >
                                  <FiPhone className="w-5 h-5" />
                                </a>
                              )}

                            {/* Remove volunteer button */}
                            <button
                              onClick={() => handleRemoveVolunteer(volunteer)}
                              className="text-red-600 hover:text-red-900"
                              title="Remove Volunteer"
                            >
                              <FiUserX className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOEventDetails;
