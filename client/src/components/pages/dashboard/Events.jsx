import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../../../store/authStore';
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
  FiAlertCircle
} from 'react-icons/fi';

const Events = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const isNGO = user?.role === 'ngo';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, fetch from your API
        // const response = await axios.get('/api/events');
        // setEvents(response.data.events);
        
        // Simulate API response with timeout
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock event data
        const mockEvents = [
          {
            _id: '1',
            title: 'Community Garden Cleanup',
            description: 'Help us clean up the community garden and prepare it for spring planting.',
            organizationName: 'Green Earth Alliance',
            date: '2023-09-15',
            startTime: '09:00',
            endTime: '12:00',
            location: 'Community Garden, 123 Park Street',
            totalShifts: 3,
            remainingSpots: 8,
            totalSpots: 15,
            skills: ['Manual Labor', 'Gardening'],
            status: 'upcoming',
            image: '/assets/images/event-garden.jpg',
            volunteers: []
          },
          {
            _id: '2',
            title: 'Food Drive Collection',
            description: 'Collect and sort food donations for local food banks.',
            organizationName: 'Community Helpers',
            date: '2023-09-20',
            startTime: '10:00',
            endTime: '15:00',
            location: 'Community Center, 456 Main Street',
            totalShifts: 2,
            remainingSpots: 0,
            totalSpots: 10,
            skills: ['Customer Service', 'Organization'],
            status: 'upcoming',
            image: '/assets/images/event-food.jpg',
            volunteers: []
          },
          {
            _id: '3',
            title: 'Literacy Tutoring Session',
            description: 'Provide tutoring to adults learning to read and write.',
            organizationName: 'Literacy First',
            date: '2023-09-05',
            startTime: '18:00',
            endTime: '20:00',
            location: 'Public Library, 789 Read Street',
            totalShifts: 1,
            remainingSpots: 3,
            totalSpots: 5,
            skills: ['Education/Teaching', 'Patience'],
            status: 'upcoming',
            image: '/assets/images/event-literacy.jpg',
            volunteers: []
          },
          {
            _id: '4',
            title: 'Beach Cleanup Day',
            description: 'Join us to clean up the shoreline and protect our local marine life.',
            organizationName: 'Ocean Guardians',
            date: '2023-08-25',
            startTime: '08:00',
            endTime: '11:00',
            location: 'Sunset Beach, Beach Road',
            totalShifts: 1,
            remainingSpots: 0,
            totalSpots: 20,
            skills: ['Manual Labor', 'Environmental Knowledge'],
            status: 'completed',
            image: '/assets/images/event-beach.jpg',
            volunteers: []
          },
          {
            _id: '5',
            title: 'Senior Home Visit Program',
            description: 'Spend time with seniors at the local care home, playing games and sharing stories.',
            organizationName: 'Elder Care Alliance',
            date: '2023-10-01',
            startTime: '14:00',
            endTime: '16:00',
            location: 'Sunshine Care Home, 321 Elder Street',
            totalShifts: 4,
            remainingSpots: 12,
            totalSpots: 12,
            skills: ['Communication', 'Compassion'],
            status: 'upcoming',
            image: '/assets/images/event-seniors.jpg',
            volunteers: []
          }
        ];
        
        // If the user is a volunteer, they might see all available events
        // If the user is an NGO, they might only see their own events
        const relevantEvents = isNGO 
          ? mockEvents.filter(event => event.organizationName === user?.organization)
          : mockEvents;
        
        setEvents(relevantEvents);
        setFilteredEvents(relevantEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load event list');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [isNGO, user]);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...events];
    
    // Apply search
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(event => 
        event.title.toLowerCase().includes(lowerSearchTerm) ||
        event.description.toLowerCase().includes(lowerSearchTerm) ||
        event.organizationName.toLowerCase().includes(lowerSearchTerm) ||
        event.location.toLowerCase().includes(lowerSearchTerm) ||
        event.skills.some(skill => skill.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(event => event.status === filterStatus);
    }
    
    // Apply date range filter
    if (filterDateRange !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const eventDate = (event) => new Date(event.date);
      
      switch (filterDateRange) {
        case 'today':
          result = result.filter(event => {
            const date = eventDate(event);
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
          });
          break;
        case 'week':
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          result = result.filter(event => {
            const date = eventDate(event);
            return date >= today && date <= nextWeek;
          });
          break;
        case 'month':
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1);
          result = result.filter(event => {
            const date = eventDate(event);
            return date >= today && date <= nextMonth;
          });
          break;
        default:
          break;
      }
    }
    
    setFilteredEvents(result);
  }, [events, searchTerm, filterStatus, filterDateRange]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Share event
  const shareEvent = (eventId, eventTitle) => {
    // In a real implementation, generate a share link
    navigator.clipboard.writeText(`https://yourdomain.com/events/${eventId}`);
    toast.success(`Link for "${eventTitle}" copied to clipboard!`);
  };
  
  // Delete event (for NGOs)
  const deleteEvent = (eventId, eventTitle) => {
    // In a real implementation, make an API call to delete the event
    const confirmed = window.confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`);
    
    if (confirmed) {
      // Filter out the deleted event
      const updatedEvents = events.filter(event => event._id !== eventId);
      setEvents(updatedEvents);
      toast.success(`Event "${eventTitle}" has been deleted`);
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
            {isNGO ? 'Manage Your Events' : 'Available Volunteer Opportunities'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isNGO 
              ? 'Create and manage volunteer events for your organization' 
              : 'Find and join volunteer opportunities in your community'}
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
      
      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events by title, description, location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <div className="sm:w-40">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            {/* Date Range Filter */}
            <div className="sm:w-40">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                >
                  <option value="all">Any Date</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
          <div className="text-gray-400 flex justify-center mb-4">
            <FiCalendar className="text-5xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No events found</h3>
          <p className="text-gray-500 mb-6">
            {isNGO 
              ? "You haven't created any events that match your search criteria." 
              : "There are no volunteer opportunities matching your search criteria."}
          </p>
          {isNGO && (
            <Link 
              to="/dashboard/events/create" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="mr-2" />
              Create Your First Event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
              {/* Event Image */}
              <div 
                className="h-48 w-full bg-cover bg-center" 
                style={{ 
                  backgroundImage: `url(${event.image || 'https://via.placeholder.com/400x200?text=Event'})`,
                  backgroundSize: 'cover' 
                }}
              />
              
              {/* Event Content */}
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.status === 'upcoming' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </span>
                  <span className="text-sm text-gray-500">{event.organizationName}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start text-sm">
                    <FiCalendar className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{formatDate(event.date)}</span>
                  </div>
                  
                  <div className="flex items-start text-sm">
                    <FiClock className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-start text-sm">
                    <FiMapPin className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{event.location}</span>
                  </div>
                  
                  <div className="flex items-start text-sm">
                    <FiUsers className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">
                      {event.remainingSpots} of {event.totalSpots} spots remaining
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {event.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Event Actions */}
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 mt-auto">
                <div className="flex justify-between items-center">
                  <Link
                    to={`/dashboard/events/${event._id}`}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    View Details
                    <FiChevronRight className="ml-1" />
                  </Link>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => shareEvent(event._id, event.title)}
                      className="p-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                      title="Share Event"
                    >
                      <FiShare2 />
                    </button>
                    
                    {isNGO && (
                      <>
                        <Link
                          to={`/dashboard/events/${event._id}/edit`}
                          className="p-2 text-gray-500 hover:text-indigo-600 focus:outline-none"
                          title="Edit Event"
                        >
                          <FiEdit2 />
                        </Link>
                        
                        <button
                          onClick={() => deleteEvent(event._id, event.title)}
                          className="p-2 text-gray-500 hover:text-red-600 focus:outline-none"
                          title="Delete Event"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                    
                    {!isNGO && event.status === 'upcoming' && (
                      <Link
                        to={`/dashboard/events/${event._id}`}
                        className={`p-2 rounded-full ${
                          event.remainingSpots > 0
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700'
                        }`}
                        title={event.remainingSpots > 0 ? 'Sign Up' : 'Fully Booked'}
                      >
                        {event.remainingSpots > 0 ? (
                          <FiCheckCircle />
                        ) : (
                          <FiAlertCircle />
                        )}
                      </Link>
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