import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiClipboard,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiInfo,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUserFriends,
  FaInfoCircle,
} from "react-icons/fa";
import { eventApi } from "../../../../services/eventApi";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get event ID if editing
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "environment",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    volunteersNeeded: 10,
    requiredSkills: [],
    requiresApproval: false,
    contactEmail: "",
    contactPhone: "",
  });

  // Available categories
  const categories = [
    { value: "environment", label: "Environment" },
    { value: "education", label: "Education" },
    { value: "health", label: "Health & Wellness" },
    { value: "community", label: "Community Development" },
    { value: "animal welfare", label: "Animal Welfare" },
    { value: "food donation", label: "Food Donation" },
  ];

  // Available skills
  const availableSkills = [
    "Teaching",
    "First Aid",
    "Construction",
    "Cooking",
    "Driving",
    "Languages",
    "Marketing",
    "Design",
    "Photography",
    "Event Planning",
    "Social Media",
    "Administration",
    "Project Management",
    "Manual Labor",
  ];

  // Load event data if in edit mode
  useEffect(() => {
    const fetchEventData = async () => {
      if (!isEditMode) return;

      try {
        setInitialLoading(true);
        const response = await eventApi.getEventById(id);

        if (response?.success) {
          const event = response.data || response.event;

          // Format dates for form
          const startDate = event.startDate
            ? new Date(event.startDate)
            : new Date();
          const endDate = event.endDate ? new Date(event.endDate) : new Date();

          // Extract times
          const startTime = startDate.toTimeString().substring(0, 5);
          const endTime = endDate.toTimeString().substring(0, 5);

          // Format dates for input
          const formatDateForInput = (date) => {
            return date.toISOString().split("T")[0];
          };

          setEventData({
            title: event.title || "",
            description: event.description || "",
            category: event.category || "environment",
            startDate: formatDateForInput(startDate),
            endDate: formatDateForInput(endDate),
            startTime: startTime || "09:00",
            endTime: endTime || "17:00",
            location: {
              address: event.location?.address || "",
              city: event.location?.city || "",
              state: event.location?.state || "",
              zipCode: event.location?.zipCode || "",
            },
            volunteersNeeded: event.volunteersNeeded || 10,
            requiredSkills: event.skillsRequired || [],
            requiresApproval: event.requiresApproval || false,
            contactEmail: event.contactEmail || "",
            contactPhone: event.contactPhone || "",
          });
        } else {
          throw new Error("Failed to load event data");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError(
          "Could not load event data. " + (err.message || "Please try again.")
        );
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEventData();
  }, [id, isEditMode]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("location.")) {
      const locationField = name.split(".")[1];
      setEventData({
        ...eventData,
        location: {
          ...eventData.location,
          [locationField]: value,
        },
      });
    } else if (type === "checkbox") {
      setEventData({ ...eventData, [name]: checked });
    } else {
      setEventData({ ...eventData, [name]: value });
    }
  };

  // Handle skills selection
  const toggleSkill = (skill) => {
    const updatedSkills = eventData.requiredSkills.includes(skill)
      ? eventData.requiredSkills.filter((s) => s !== skill)
      : [...eventData.requiredSkills, skill];

    setEventData({ ...eventData, requiredSkills: updatedSkills });
  };

  // Format date for API submission
  const formatDateForSubmission = (date, time) => {
    if (!date) return "";
    return `${date}T${time}:00`;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const eventPayload = {
        ...eventData,
        skillsRequired: eventData.requiredSkills,
        startDate: formatDateForSubmission(
          eventData.startDate,
          eventData.startTime
        ),
        endDate: formatDateForSubmission(eventData.endDate, eventData.endTime),
        // Remove fields not needed in the API
        startTime: undefined,
        endTime: undefined,
        requiredSkills: undefined,
      };

      let response;

      if (isEditMode) {
        // Update existing event
        response = await eventApi.updateEvent(id, eventPayload);
      } else {
        // Create new event
        response = await eventApi.createEvent(eventPayload);
      }

      if (response.success) {
        setSuccess(true);
        // Redirect to the events page after 2 seconds
        setTimeout(() => {
          navigate("/ngo-dashboard/events");
        }, 2000);
      } else {
        throw new Error(
          response.message ||
            `Failed to ${isEditMode ? "update" : "create"} event`
        );
      }
    } catch (err) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} event:`,
        err
      );
      setError(
        err.response?.data?.message ||
          err.message ||
          `Error ${
            isEditMode ? "updating" : "creating"
          } event. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? "Edit Event" : "Create New Event"}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? "Update the details of your event below."
            : "Fill in the details below to create a new volunteer opportunity."}
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center">
          <FiCheck className="text-green-500 h-5 w-5 mr-3" />
          <span className="text-green-800">
            Event {isEditMode ? "updated" : "created"} successfully!
            Redirecting...
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
          <FiAlertCircle className="text-red-500 h-5 w-5 mr-3" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={eventData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter a descriptive title for your event"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe what volunteers will be doing and the impact of this event"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={eventData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <FiCalendar className="inline-block mr-2" />
            Date and Time
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={eventData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={eventData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={eventData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={eventData.endTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <FiMapPin className="inline-block mr-2" />
            Location
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="location.address"
                value={eventData.location.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={eventData.location.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={eventData.location.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="location.zipCode"
                  value={eventData.location.zipCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Volunteers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <FiUsers className="inline-block mr-2" />
            Volunteer Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Volunteers Needed *
              </label>
              <input
                type="number"
                name="volunteersNeeded"
                value={eventData.volunteersNeeded}
                onChange={handleChange}
                required
                min={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      eventData.requiredSkills.includes(skill)
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                        : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="requiresApproval"
                name="requiresApproval"
                checked={eventData.requiresApproval}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="requiresApproval"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Require approval for volunteer applications
              </label>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <FiInfo className="inline-block mr-2" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email *
              </label>
              <input
                type="email"
                name="contactEmail"
                value={eventData.contactEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone (Optional)
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={eventData.contactPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/ngo-dashboard/events")}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className={`px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
              (loading || success) && "opacity-70 cursor-not-allowed"
            }`}
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : success
              ? isEditMode
                ? "Updated!"
                : "Created!"
              : isEditMode
              ? "Update Event"
              : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
