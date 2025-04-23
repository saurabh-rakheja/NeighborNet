import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiArrowLeft,
  FiShare2,
  FiExternalLink,
  FiMail,
  FiPhone,
  FiTag,
  FiAlertCircle,
  FiInfo,
  FiCheckCircle,
} from "react-icons/fi";

const PublicEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const api = axios.create({
          baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
        });

        const { data } = await api.get(`/events/${id}`);

        if (data?.success) {
          setEvent(data.data);
        } else {
          throw new Error(data?.message || "Failed to fetch event");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(
          err.response?.data?.message || err.message || "Error loading event"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const shareEvent = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: `Check out this volunteer opportunity: ${event.title}`,
          url: url,
        })
        .then(() => console.log("Share successful"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert("Event link copied to clipboard!");
        })
        .catch((err) => {
          alert("Failed to copy link");
        });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
        <FiAlertCircle className="mr-2" />
        <div>
          <p className="font-medium">Error loading event</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Event not found</p>
        <Link
          to="/"
          className="text-indigo-600 hover:underline mt-2 inline-block"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back and action buttons */}
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/events"
          className="text-gray-600 hover:text-gray-800 flex items-center"
        >
          <FiArrowLeft className="mr-1" /> Back to Events
        </Link>

        <div className="flex gap-2">
          <button
            onClick={shareEvent}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center text-sm"
          >
            <FiShare2 className="mr-1" /> Share
          </button>
          <Link
            to={`/login?redirect=/volunteer-dashboard/events/${id}`}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center text-sm"
          >
            <FiCheckCircle className="mr-1" /> Sign Up to Volunteer
          </Link>
        </div>
      </div>

      {/* Event Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <div
                className={`px-2 py-1 text-xs rounded-full 
                ${
                  event.status === "upcoming"
                    ? "bg-blue-100 text-blue-800"
                    : event.status === "ongoing"
                    ? "bg-green-100 text-green-800"
                    : event.status === "completed"
                    ? "bg-gray-100 text-gray-800"
                    : event.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : event.status === "full"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {event.status.charAt(0).toUpperCase() +
                  event.status.slice(1).toLowerCase()}
              </div>
              <div className="ml-2 px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700">
                {event.category}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          </div>

          <p className="text-gray-600 mb-6">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start">
              <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                <FiCalendar className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Date</h3>
                <p className="text-gray-600">
                  {formatDate(event.startDate)}
                  {event.endDate &&
                    event.startDate.split("T")[0] !==
                      event.endDate.split("T")[0] && (
                      <> to {formatDate(event.endDate)}</>
                    )}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                <FiClock className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Time</h3>
                <p className="text-gray-600">
                  {formatTime(event.startDate)} – {formatTime(event.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                <FiMapPin className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Location</h3>
                <p className="text-gray-600">
                  {event.location.address}
                  <br />
                  {event.location.city}, {event.location.state}{" "}
                  {event.location.zipCode}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-indigo-50 p-2 rounded-lg mr-3">
                <FiUsers className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  Volunteers
                </h3>
                <p className="text-gray-600">
                  {event.registeredVolunteers?.length || 0} of{" "}
                  {event.volunteersNeeded} registered
                  {event.registeredVolunteers?.length >=
                    event.volunteersNeeded && (
                    <span className="ml-2 text-orange-600">(Full)</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {event.skillsRequired && event.skillsRequired.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiTag className="mr-1" /> Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.skillsRequired.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact info */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {event.contactEmail && (
                <div className="flex items-center">
                  <FiMail className="text-gray-400 mr-2" />
                  <span className="text-gray-600">{event.contactEmail}</span>
                </div>
              )}
              {event.contactPhone && (
                <div className="flex items-center">
                  <FiPhone className="text-gray-400 mr-2" />
                  <span className="text-gray-600">{event.contactPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Organization info */}
      {event.organizerId && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              <FiInfo className="inline-block mr-2" />
              About the Organization
            </h3>
            <div className="flex items-start">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium mr-4">
                {event.organizerId.name?.charAt(0) || "O"}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {event.organizerId.organization || event.organizerId.name}
                </h4>
                {event.organizerId.organization && (
                  <p className="text-gray-500">{event.organizerId.name}</p>
                )}
                <div className="mt-2">
                  <Link
                    to={`/organizations/${event.organizerId._id}`}
                    className="text-indigo-600 hover:underline flex items-center text-sm"
                  >
                    View Organization{" "}
                    <FiExternalLink className="ml-1" size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to action */}
      <div className="bg-indigo-50 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-indigo-800 mb-2">
          Interested in volunteering?
        </h3>
        <p className="text-indigo-600 mb-4">
          Sign up to volunteer for this event and make a difference!
        </p>
        <Link
          to={`/login?redirect=/volunteer-dashboard/events/${id}`}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block"
        >
          <FiCheckCircle className="inline-block mr-2" /> Sign Up Now
        </Link>
      </div>
    </div>
  );
};

export default PublicEventDetails;
