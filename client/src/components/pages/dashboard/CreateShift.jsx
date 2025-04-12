import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';
import { 
  FiCalendar, 
  FiClock,
  FiUsers,
  FiAlertCircle,
  FiCheck,
  FiInfo
} from 'react-icons/fi';

const CreateShift = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventData, setEventData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Shift form state
  const [shiftData, setShiftData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '12:00',
    location: '',
    capacity: 5,
    skills: []
  });
  
  // Skills options for selection
  const skillsOptions = [
    'No Special Skills Required',
    'Customer Service',
    'Manual Labor',
    'Technical',
    'Medical',
    'Administrative',
    'Education/Teaching',
    'Leadership',
    'Cooking',
    'Driving',
    'Language Skills',
    'Social Media'
  ];
  
  // Fetch event data on component mount
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setEventLoading(true);
        // In a real implementation, fetch from your API
        // const response = await axios.get(`/api/events/${eventId}`);
        // setEventData(response.data.event);
        
        // Simulate API response with timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Sample event data (replace with actual API call)
        const sampleEvent = {
          _id: eventId,
          title: 'Community Beach Cleanup',
          startDateTime: new Date('2023-10-15T09:00:00'),
          endDateTime: new Date('2023-10-15T17:00:00'),
          location: 'Main Street Beach, Oceanside'
        };
        
        setEventData(sampleEvent);
        
        // Pre-fill location from event data
        setShiftData(prev => ({
          ...prev,
          location: sampleEvent.location,
          date: sampleEvent.startDateTime.toISOString().split('T')[0]
        }));
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error('Failed to load event data. Please try again.');
      } finally {
        setEventLoading(false);
      }
    };

    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShiftData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Handle skills selection (multi-select)
  const handleSkillsChange = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      option => option.value
    );
    
    setShiftData(prev => ({
      ...prev,
      skills: value
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Required fields
    if (!shiftData.title.trim()) errors.title = 'Title is required';
    if (!shiftData.description.trim()) errors.description = 'Description is required';
    if (!shiftData.location.trim()) errors.location = 'Location is required';
    
    // Date validation
    if (!shiftData.date) {
      errors.date = 'Date is required';
    } else {
      const shiftDate = new Date(shiftData.date);
      shiftDate.setHours(0, 0, 0, 0);
      
      if (shiftDate < today) {
        errors.date = 'Date cannot be in the past';
      }
      
      // If event data is available, check if shift date is within event dates
      if (eventData) {
        const eventStart = new Date(eventData.startDateTime);
        eventStart.setHours(0, 0, 0, 0);
        
        const eventEnd = new Date(eventData.endDateTime);
        eventEnd.setHours(23, 59, 59, 999);
        
        if (shiftDate < eventStart || shiftDate > eventEnd) {
          errors.date = 'Shift date must be within event dates';
        }
      }
    }
    
    // Time validation
    if (shiftData.startTime && shiftData.endTime) {
      const [startHours, startMinutes] = shiftData.startTime.split(':').map(Number);
      const [endHours, endMinutes] = shiftData.endTime.split(':').map(Number);
      
      if (startHours > endHours || (startHours === endHours && startMinutes >= endMinutes)) {
        errors.endTime = 'End time must be after start time';
      }
    }
    
    // Capacity validation
    if (!shiftData.capacity || shiftData.capacity <= 0) {
      errors.capacity = 'Capacity must be greater than zero';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }
    
    setLoading(true);
    
    try {
      // Format the date and time for API
      const formatDateTime = (date, time) => {
        const [hours, minutes] = time.split(':');
        const dateObj = new Date(date);
        dateObj.setHours(parseInt(hours), parseInt(minutes), 0);
        return dateObj.toISOString();
      };
      
      const formattedData = {
        ...shiftData,
        eventId,
        startDateTime: formatDateTime(shiftData.date, shiftData.startTime),
        endDateTime: formatDateTime(shiftData.date, shiftData.endTime),
      };
      
      // Remove unnecessary fields
      delete formattedData.date;
      delete formattedData.startTime;
      delete formattedData.endTime;
      
      // In a real implementation, send data to your API
      // const response = await axios.post('/api/shifts', formattedData);
      
      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Shift created successfully!');
      navigate(`/dashboard/events/${eventId}`);
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error(error.response?.data?.message || 'Failed to create shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (eventLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!eventData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <div className="text-center text-red-600">
          <FiAlertCircle className="mx-auto mb-4 h-12 w-12" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="mb-4">The event you're trying to create a shift for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/dashboard/events')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Create New Shift</h1>
        <p className="text-gray-600 mt-1">
          Add a volunteer shift for {eventData.title}
        </p>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiInfo className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Shifts help you organize volunteers for specific times and roles during your event.
              Each shift can have its own capacity, time slot, and required skills.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">Shift Details</h2>
          <p className="text-blue-100 text-sm">
            For event: {eventData.title}
          </p>
        </div>
        
        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={shiftData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Morning Cleanup Team"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {formErrors.title}
                  </p>
                )}
              </div>
              
              {/* Description */}
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={shiftData.description}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe what volunteers will be doing during this shift..."
                ></textarea>
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {formErrors.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Date and Time */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Date and Time</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiCalendar className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={shiftData.date}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {formErrors.date}
                  </p>
                )}
              </div>
              
              {/* Start Time */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiClock className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={shiftData.startTime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* End Time */}
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiClock className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={shiftData.endTime}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.endTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.endTime && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {formErrors.endTime}
                  </p>
                )}
              </div>
              
              {/* Location */}
              <div className="col-span-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location* (pre-filled from event)
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={shiftData.location}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., North Entrance of the Park"
                />
                {formErrors.location && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {formErrors.location}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  You can specify a different meeting point for this shift if needed
                </p>
              </div>
            </div>
          </div>
          
          {/* Capacity and Skills */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Capacity and Skills</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Capacity */}
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Volunteer Capacity*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUsers className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={shiftData.capacity}
                    onChange={handleChange}
                    min="1"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.capacity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {formErrors.capacity && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" /> {formErrors.capacity}
                  </p>
                )}
              </div>
              
              {/* Skills */}
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills (Optional)
                </label>
                <select
                  id="skills"
                  name="skills"
                  multiple
                  value={shiftData.skills}
                  onChange={handleSkillsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  size="4"
                >
                  {skillsOptions.map(skill => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Hold Ctrl (or Cmd on Mac) to select multiple skills
                </p>
              </div>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/events/${eventId}`)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Shift...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Create Shift
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateShift; 