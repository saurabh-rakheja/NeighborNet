import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiTag,
  FiImage,
  FiFile,
  FiList,
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiHelpCircle,
  FiPlus,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import useAuthStore from "../../../../store/authStore";

const CreateEvent = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "17:00",
    volunteersNeeded: 1,
    category: "Community Service",
    skillsRequired: [],
    newSkill: "",
    image: "",
    isRecurring: false,
    recurringPattern: "weekly",
    recurringEndDate: "",
    recurringDays: [],
    requiresApproval: true,
    notes: "",
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Categories
  const categories = [
    "Community Service",
    "Environmental",
    "Education",
    "Healthcare",
    "Animal Welfare",
    "Food Donation",
    "Arts & Culture",
    "Elderly Care",
    "Children & Youth",
    "Disaster Relief",
    "Homelessness",
    "Other",
  ];

  // Days of week
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes(".")) {
      // Handle nested fields (like location.city)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Handle recurring days selection
  const handleDayToggle = (day) => {
    if (formData.recurringDays.includes(day)) {
      setFormData({
        ...formData,
        recurringDays: formData.recurringDays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        recurringDays: [...formData.recurringDays, day],
      });
    }
  };

  // Handle skills required
  const handleAddSkill = () => {
    if (formData.newSkill.trim() !== "") {
      if (!formData.skillsRequired.includes(formData.newSkill.trim())) {
        setFormData({
          ...formData,
          skillsRequired: [...formData.skillsRequired, formData.newSkill.trim()],
          newSkill: "",
        });
      } else {
        toast.info("This skill is already added");
      }
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skillsRequired: formData.skillsRequired.filter((s) => s !== skill),
    });
  };

  // Form validation
  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    switch (step) {
      case 1: // Basic Information
        if (!formData.title.trim()) {
          stepErrors.title = "Event title is required";
          isValid = false;
        }
        if (!formData.description.trim()) {
          stepErrors.description = "Event description is required";
          isValid = false;
        }
        if (!formData.category) {
          stepErrors.category = "Category is required";
          isValid = false;
        }
        break;

      case 2: // Location Information
        if (!formData.location.address.trim()) {
          stepErrors["location.address"] = "Address is required";
          isValid = false;
        }
        if (!formData.location.city.trim()) {
          stepErrors["location.city"] = "City is required";
          isValid = false;
        }
        if (!formData.location.state.trim()) {
          stepErrors["location.state"] = "State is required";
          isValid = false;
        }
        if (!formData.location.zipCode.trim()) {
          stepErrors["location.zipCode"] = "Zip code is required";
          isValid = false;
        }
        break;

      case 3: // Date & Time
        if (!formData.startDate) {
          stepErrors.startDate = "Start date is required";
          isValid = false;
        }
        if (!formData.endDate) {
          stepErrors.endDate = "End date is required";
          isValid = false;
        } else if (new Date(formData.endDate) < new Date(formData.startDate)) {
          stepErrors.endDate = "End date cannot be before start date";
          isValid = false;
        }
        
        if (formData.isRecurring) {
          if (!formData.recurringEndDate) {
            stepErrors.recurringEndDate = "End date for recurring events is required";
            isValid = false;
          } else if (new Date(formData.recurringEndDate) < new Date(formData.endDate)) {
            stepErrors.recurringEndDate = "Recurring end date must be after the first event end date";
            isValid = false;
          }
          
          if (formData.recurringPattern === "weekly" && formData.recurringDays.length === 0) {
            stepErrors.recurringDays = "Select at least one day for weekly recurring events";
            isValid = false;
          }
        }
        break;

      case 4: // Requirements & Details
        if (parseInt(formData.volunteersNeeded) < 1) {
          stepErrors.volunteersNeeded = "At least one volunteer is required";
          isValid = false;
        }
        break;

      default:
        break;
    }

    setErrors(stepErrors);
    return isValid;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);

    try {
      // Format date and time for API submission
      const formattedData = {
        ...formData,
        startDate: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
        endDate: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
        recurringEndDate: formData.isRecurring ? new Date(`${formData.recurringEndDate}T23:59`).toISOString() : null,
      };

      // Remove temporary form fields
      delete formattedData.startTime;
      delete formattedData.endTime;
      delete formattedData.newSkill;

      const response = await axios.post("/api/events", formattedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Event created successfully!");
      
      // Navigate to the event detail page
      navigate(`/dashboard/events/${response.data.event._id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || "Failed to create event");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render form steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiFile className="mr-2" /> Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of the event"
                  rows="5"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL (Optional)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Enter an image URL for the event"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiMapPin className="mr-2" /> Location Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="location.address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address*
                </label>
                <input
                  type="text"
                  id="location.address"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleChange}
                  placeholder="Enter street address"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["location.address"] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors["location.address"] && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors["location.address"]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">
                    City*
                  </label>
                  <input
                    type="text"
                    id="location.city"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["location.city"] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors["location.city"] && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors["location.city"]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.state" className="block text-sm font-medium text-gray-700 mb-1">
                    State*
                  </label>
                  <input
                    type="text"
                    id="location.state"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors["location.state"] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors["location.state"] && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors["location.state"]}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="location.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code*
                </label>
                <input
                  type="text"
                  id="location.zipCode"
                  name="location.zipCode"
                  value={formData.location.zipCode}
                  onChange={handleChange}
                  placeholder="Enter zip code"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors["location.zipCode"] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors["location.zipCode"] && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors["location.zipCode"]}
                  </p>
                )}
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <h3 className="flex items-center text-blue-800 font-medium">
                  <FiHelpCircle className="mr-2" /> Location Tips
                </h3>
                <ul className="text-sm text-blue-700 ml-6 mt-2 list-disc">
                  <li>Provide a detailed address to help volunteers find the location easily</li>
                  <li>Consider including parking information in the event description</li>
                  <li>For virtual events, you can enter "Virtual" in the address field and provide access details in the description</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiCalendar className="mr-2" /> Date & Time
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date*
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.startDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time*
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date*
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate || new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.endDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.endDate}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time*
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium text-gray-700">
                    This is a recurring event
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="ml-6 mt-3 space-y-4 p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label htmlFor="recurringPattern" className="block text-sm font-medium text-gray-700 mb-1">
                        Recurring Pattern
                      </label>
                      <select
                        id="recurringPattern"
                        name="recurringPattern"
                        value={formData.recurringPattern}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {formData.recurringPattern === "weekly" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeek.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleDayToggle(day)}
                              className={`px-3 py-1 rounded-full text-sm ${
                                formData.recurringDays.includes(day)
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              } border`}
                            >
                              {day.substring(0, 3)}
                            </button>
                          ))}
                        </div>
                        {errors.recurringDays && (
                          <p className="mt-1 text-sm text-red-500 flex items-center">
                            <FiAlertCircle className="mr-1" /> {errors.recurringDays}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label htmlFor="recurringEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date for Recurring Events*
                      </label>
                      <input
                        type="date"
                        id="recurringEndDate"
                        name="recurringEndDate"
                        value={formData.recurringEndDate}
                        onChange={handleChange}
                        min={formData.endDate || new Date().toISOString().split("T")[0]}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.recurringEndDate ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.recurringEndDate && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                          <FiAlertCircle className="mr-1" /> {errors.recurringEndDate}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FiUsers className="mr-2" /> Requirements & Details
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="volunteersNeeded" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Volunteers Needed*
                </label>
                <input
                  type="number"
                  id="volunteersNeeded"
                  name="volunteersNeeded"
                  value={formData.volunteersNeeded}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.volunteersNeeded ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.volunteersNeeded && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <FiAlertCircle className="mr-1" /> {errors.volunteersNeeded}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required</label>
                <div className="flex">
                  <input
                    type="text"
                    id="newSkill"
                    name="newSkill"
                    value={formData.newSkill}
                    onChange={handleChange}
                    placeholder="Enter required skill"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <FiPlus />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </span>
                  ))}
                  {formData.skillsRequired.length === 0 && (
                    <span className="text-sm text-gray-500">No specific skills required</span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="requiresApproval"
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="requiresApproval" className="ml-2 block text-sm font-medium text-gray-700">
                    Require approval for volunteer applications
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  If checked, volunteers will need to be approved before they can participate in this event.
                </p>
              </div>

              <div className="mt-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add any additional information for volunteers"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
            <p className="text-gray-600">Create a new volunteer opportunity for your organization</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <FiArrowLeft className="mr-1" /> Back
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between w-full mb-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step < currentStep
                    ? "bg-green-500 text-white"
                    : step === currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step < currentStep ? <FiCheck /> : step}
              </div>
              <div
                className={`hidden md:block text-sm ml-2 ${
                  step === currentStep ? "font-medium text-blue-600" : "text-gray-500"
                }`}
              >
                {step === 1
                  ? "Basic Info"
                  : step === 2
                  ? "Location"
                  : step === 3
                  ? "Date & Time"
                  : "Requirements"}
              </div>
              {step < totalSteps && (
                <div className="hidden md:block flex-1 h-0.5 mx-4 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit}>
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="bg-gray-100 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <FiChevronLeft className="mr-2" /> Previous
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center ml-auto"
              >
                Next <FiChevronRight className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center ml-auto ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating..." : "Create Event"}
                {!loading && <FiCheck className="ml-2" />}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Help Info */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-medium text-blue-800 flex items-center mb-2">
          <FiHelpCircle className="mr-2" /> Tips for Creating Successful Events
        </h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Provide clear and detailed descriptions of the volunteer work</li>
          <li>Include specific location details and parking information</li>
          <li>List any skills or requirements needed for the event</li>
          <li>Consider creating recurring events for ongoing volunteer opportunities</li>
          <li>Add a compelling image to attract more volunteers</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateEvent; 