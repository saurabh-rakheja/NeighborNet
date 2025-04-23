import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiClock,
  FiAward,
  FiMessageSquare,
  FiAlertTriangle,
  FiBriefcase,
  FiBookOpen,
  FiFileText,
  FiHeart,
  FiUserX,
} from "react-icons/fi";
import { ngoApi } from "../../../../services/ngoApi";
import Swal from "sweetalert2";

const VolunteerProfile = () => {
  const { id } = useParams();
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [removingFromEvent, setRemovingFromEvent] = useState(null);

  useEffect(() => {
    const fetchVolunteerProfile = async () => {
      try {
        setLoading(true);
        const response = await ngoApi.getVolunteerById(id);

        if (!response.success || !response.volunteer) {
          throw new Error("Failed to load volunteer data");
        }

        setVolunteer(response.volunteer);

        // Fetch events this volunteer has participated in
        try {
          const eventsResponse = await ngoApi.getVolunteerEvents(id);
          if (eventsResponse.success) {
            setEvents(eventsResponse.events);
          } else {
            console.error(
              "Failed to load volunteer events:",
              eventsResponse.message
            );
            // Set empty events array as fallback
            setEvents([]);
          }
        } catch (eventsError) {
          console.error("Error fetching volunteer events:", eventsError);
          // Set empty events array as fallback
          setEvents([]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching volunteer profile:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load volunteer profile.",
        });
        setLoading(false);
      }
    };

    fetchVolunteerProfile();
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Empty Message",
        text: "Please enter a message to send.",
      });
      return;
    }

    try {
      setSendingMessage(true);

      // Send message via API
      const response = await ngoApi.submitVolunteerFeedback(id, {
        message: messageText.trim(),
      });

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Message Sent",
          text: "Your message has been sent successfully.",
        });
        setMessageText("");
      } else {
        throw new Error(response.message || "Failed to send message");
      }

      setSendingMessage(false);
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send message. Please try again.",
      });
      setSendingMessage(false);
    }
  };

  const handleRemoveFromEvent = async (eventId, eventTitle) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Remove Volunteer",
        html: `Are you sure you want to remove this volunteer from <strong>${eventTitle}</strong>?`,
        input: "text",
        inputLabel: "Reason for removal (optional)",
        inputPlaceholder: "Enter a reason...",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Remove",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        setRemovingFromEvent(eventId);

        // Call the API to remove the volunteer
        await ngoApi.removeVolunteerFromEvent(eventId, id, result.value);

        // Update the events list
        setEvents(events.filter((event) => event.id !== eventId));

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Volunteer Removed",
          text: "The volunteer has been removed from this event.",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error("Error removing volunteer from event:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to remove volunteer",
      });
    } finally {
      setRemovingFromEvent(null);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <FiAlertTriangle className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Volunteer Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The volunteer profile you're looking for doesn't exist or you don't
          have permission to view it.
        </p>
        <Link
          to="/ngo-dashboard/volunteers"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <FiArrowLeft className="mr-2" /> Back to Volunteers
        </Link>
      </div>
    );
  }

  // Extract data from the volunteer object
  const { name, email, createdAt } = volunteer;
  const profile = volunteer.profile || {};
  const volunteerInfo = volunteer.volunteerInfo || {};

  return (
    <div className="container mx-auto pb-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/ngo-dashboard/volunteers"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <FiArrowLeft className="mr-2" /> Back to Volunteers
        </Link>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-indigo-600 text-4xl font-bold">
                {name.charAt(0)}
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold mb-2">{name}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-3">
                <div className="flex items-center">
                  <FiMail className="mr-2" />
                  {email}
                </div>
                <div className="flex items-center">
                  <FiPhone className="mr-2" />
                  {profile.phoneNumber || "Not provided"}
                </div>
                <div className="flex items-center">
                  <FiMapPin className="mr-2" />
                  {profile.address?.city || "Location not provided"}
                  {profile.address?.state ? `, ${profile.address.state}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="flex items-center">
                  <FiCalendar className="mr-2" />
                  Joined {formatDate(createdAt)}
                </div>
                <div className="flex items-center">
                  <FiAward className="mr-2" />
                  {volunteerInfo.eventsParticipated || 0} events participated
                </div>
                <div className="flex items-center">
                  <FiClock className="mr-2" />
                  {volunteerInfo.totalHours || 0} hours contributed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2">
          {/* About section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
            <p className="text-gray-600">{profile.bio || "No bio provided."}</p>
          </div>

          {/* Skills section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Skills & Interests
            </h2>
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {volunteerInfo.skills && volunteerInfo.skills.length > 0 ? (
                  volunteerInfo.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No skills listed</span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">
                Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {volunteerInfo.interests &&
                volunteerInfo.interests.length > 0 ? (
                  volunteerInfo.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No interests listed</span>
                )}
              </div>
            </div>
          </div>

          {/* Events history */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Event History
              </h2>
            </div>

            {events.length > 0 ? (
              <div className="divide-y">
                {events.map((event) => (
                  <div key={event.id} className="py-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        {event.title}
                      </h3>
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            event.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {event.status}
                        </span>
                        {event.status !== "Completed" && (
                          <button
                            onClick={() =>
                              handleRemoveFromEvent(event.id, event.title)
                            }
                            disabled={removingFromEvent === event.id}
                            className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Remove volunteer from event"
                          >
                            {removingFromEvent === event.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent border-red-600"></div>
                            ) : (
                              <FiUserX size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 text-gray-400" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2 text-gray-400" />
                        {event.hours} hours
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                This volunteer hasn't participated in any events yet.
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Contact Information
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMail className="mt-1 mr-3 text-indigo-500" />
                <div>
                  <span className="block text-gray-700 font-medium">Email</span>
                  <span className="text-gray-600">{email}</span>
                </div>
              </li>
              <li className="flex items-start">
                <FiPhone className="mt-1 mr-3 text-indigo-500" />
                <div>
                  <span className="block text-gray-700 font-medium">Phone</span>
                  <span className="text-gray-600">
                    {profile.phoneNumber || "Not provided"}
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <FiMapPin className="mt-1 mr-3 text-indigo-500" />
                <div>
                  <span className="block text-gray-700 font-medium">
                    Location
                  </span>
                  <span className="text-gray-600">
                    {profile.address?.street
                      ? `${profile.address.street}, `
                      : ""}
                    {profile.address?.city || "City not provided"}
                    {profile.address?.state ? `, ${profile.address.state}` : ""}
                    {profile.address?.zipCode
                      ? ` ${profile.address.zipCode}`
                      : ""}
                    {profile.address?.country
                      ? `, ${profile.address.country}`
                      : ""}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Additional Information
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiBriefcase className="mt-1 mr-3 text-indigo-500" />
                <div>
                  <span className="block text-gray-700 font-medium">
                    Occupation
                  </span>
                  <span className="text-gray-600">
                    {volunteerInfo.occupation || "Not provided"}
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <FiBookOpen className="mt-1 mr-3 text-indigo-500" />
                <div>
                  <span className="block text-gray-700 font-medium">
                    Education
                  </span>
                  <span className="text-gray-600">
                    {volunteerInfo.education || "Not provided"}
                  </span>
                </div>
              </li>
              <li className="flex items-start">
                <FiUser className="mt-1 mr-3 text-indigo-500" />
                <div>
                  <span className="block text-gray-700 font-medium">
                    Experience
                  </span>
                  <span className="text-gray-600">
                    {volunteerInfo.experience || "Not provided"}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Send Message */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Send Message
            </h2>
            <form onSubmit={handleSendMessage}>
              <div className="mb-4">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={sendingMessage}
                className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="inline-flex items-center">
                    <FiMessageSquare className="mr-2" />
                    Send Message
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
