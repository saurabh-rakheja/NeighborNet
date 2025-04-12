import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../../store/authStore";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiInfo,
  FiImage,
  FiList,
  FiTag,
} from "react-icons/fi";
import axios from "axios";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Skills options that volunteers can select
  const skillOptions = [
    "Customer Service",
    "Manual Labor",
    "Teaching/Education",
    "Gardening",
    "Administration",
    "Technology",
    "Cooking",
    "Healthcare",
    "Communication",
    "Organization",
    "Compassion",
    "Environmental Knowledge",
    "Patience",
    "Leadership",
    "Fundraising",
  ];

  // Event category options
  const categoryOptions = [
    "Community Service",
    "Environmental",
    "Education",
    "Healthcare",
    "Animal Welfare",
    "Food Donation",
    "Other",
  ];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    volunteersNeeded: "",
    image: "",
    skillsRequired: [],
    category: "Community Service",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleSkillChange = (skill) => {
    const updatedSkills = formData.skillsRequired.includes(skill)
      ? formData.skillsRequired.filter((s) => s !== skill)
      : [...formData.skillsRequired, skill];

    setFormData({
      ...formData,
      skillsRequired: updatedSkills,
    });

    // Clear skills error if any selected
    if (updatedSkills.length > 0 && errors.skillsRequired) {
      setErrors({
        ...errors,
        skillsRequired: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "Zip code is required";
    if (!formData.volunteersNeeded)
      newErrors.volunteersNeeded = "Number of volunteer spots is required";
    if (formData.skillsRequired.length === 0)
      newErrors.skillsRequired = "At least one skill is required";
    if (!formData.category) newErrors.category = "Category is required";

    // Validate times
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);

      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    // Validate date is not in the past
    if (formData.date) {
      const eventDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        newErrors.date = "Event date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create dates from form data
      const eventDate = new Date(formData.date);
      const startDateTime = new Date(formData.date);
      const endDateTime = new Date(formData.date);

      // Set hours from time inputs
      const [startHours, startMinutes] = formData.startTime
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = formData.endTime.split(":").map(Number);

      startDateTime.setHours(startHours, startMinutes, 0);
      endDateTime.setHours(endHours, endMinutes, 0);

      // Format data according to schema
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        volunteersNeeded: parseInt(formData.volunteersNeeded, 10),
        skillsRequired: formData.skillsRequired,
        category: formData.category,
        image: formData.image || undefined, // Only include if provided
        status: "Upcoming",
      };

      // Create API instance with auth token
      const api = axios.create({
        baseURL: "http://localhost:5000/api",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      // Create the event
      const response = await api.post("/events", eventData);

      toast.success("Event created successfully!");
      navigate("/dashboard/events");
    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create event. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Create New Volunteer Event
        </h1>
        <p className="text-gray-600 mt-1">
          Post a new volunteer opportunity for your organization
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="p-6 md:p-8">
          {/* Basic Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Basic Information
            </h2>

            {/* Event Title */}
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="e.g., Beach Cleanup Day"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Event Description */}
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Event Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Describe what volunteers will be doing, what to bring, and any other important details"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Event Image URL */}
            <div className="mb-4">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
              >
                <FiImage className="mr-1" />
                Event Image URL
              </label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/event-image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional: Add an image URL to display with your event
              </p>
            </div>
          </div>

          {/* Date and Time Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Date and Time
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Event Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                >
                  <FiCalendar className="mr-1" />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                >
                  <FiClock className="mr-1" />
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.startTime ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.startTime && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.startTime}
                  </p>
                )}
              </div>

              {/* End Time */}
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                >
                  <FiClock className="mr-1" />
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.endTime ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Location
            </h2>

            {/* Address */}
            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
              >
                <FiMapPin className="mr-1" />
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${
                  errors.address ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Street address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.state ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              {/* Zip Code */}
              <div>
                <label
                  htmlFor="zipCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Zip Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${
                    errors.zipCode ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Volunteer Requirements */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Volunteer Requirements
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Number of Spots */}
              <div>
                <label
                  htmlFor="volunteersNeeded"
                  className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
                >
                  <FiUsers className="mr-1" />
                  Number of Volunteer Spots{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="volunteersNeeded"
                  name="volunteersNeeded"
                  value={formData.volunteersNeeded}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 border ${
                    errors.volunteersNeeded
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Total number of volunteers needed"
                />
                {errors.volunteersNeeded && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.volunteersNeeded}
                  </p>
                )}
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiTag className="mr-1" />
                  Required Skills <span className="text-red-500">*</span>
                </label>
                {errors.skillsRequired && (
                  <p className="mb-2 text-sm text-red-500">
                    {errors.skillsRequired}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillChange(skill)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        formData.skillsRequired.includes(skill)
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                          : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FiTag className="mr-1" />
                Category <span className="text-red-500">*</span>
              </label>
              {errors.category && (
                <p className="mb-2 text-sm text-red-500">{errors.category}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      handleChange({
                        target: { name: "category", value: category },
                      })
                    }
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      formData.category === category
                        ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                        : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => navigate("/dashboard/events")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
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
                  Creating Event...
                </>
              ) : (
                "Create Event"
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <div className="text-sm text-gray-500 flex items-center">
              <FiInfo className="mr-1" />
              Fields marked with <span className="text-red-500 mx-1">
                *
              </span>{" "}
              are required
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
