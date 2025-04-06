import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    location: '',
    search: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await axios.get(`/api/events?${queryParams.toString()}`);
      
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (error) {
      toast.error('Error fetching events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const eventStatusBadge = (status) => {
    const statusColors = {
      'Upcoming': 'bg-blue-100 text-blue-800',
      'Ongoing': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const categoryBadge = (category) => {
    const categoryColors = {
      'Community Service': 'bg-purple-100 text-purple-800',
      'Environmental': 'bg-green-100 text-green-800',
      'Education': 'bg-blue-100 text-blue-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Animal Welfare': 'bg-yellow-100 text-yellow-800',
      'Food Donation': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[category] || 'bg-gray-100'}`}>
        {category}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Volunteer Events</h1>
        <Link 
          to="/dashboard/events/create" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">All Categories</option>
                <option value="Community Service">Community Service</option>
                <option value="Environmental">Environmental</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Animal Welfare">Animal Welfare</option>
                <option value="Food Donation">Food Donation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Enter city"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Search</label>
              <div className="flex">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title or description"
                  className="w-full border rounded-l px-3 py-2"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No events found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Event Image */}
              <div className="h-48 bg-gray-200">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400 text-2xl">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Event Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{event.title}</h2>
                  {eventStatusBadge(event.status)}
                </div>
                
                <div className="mb-3">
                  {categoryBadge(event.category)}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex items-start">
                    <span className="mr-2">📍</span>
                    <span>{event.location.city}, {event.location.state}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-2">📅</span>
                    <span>
                      {formatDate(event.startDate)}
                      {formatDate(event.startDate) !== formatDate(event.endDate) && 
                        ` - ${formatDate(event.endDate)}`}
                    </span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="mr-2">👥</span>
                    <span>{event.volunteersRegistered} / {event.volunteersNeeded} volunteers</span>
                  </div>
                </div>
                
                <Link
                  to={`/dashboard/events/${event._id}`}
                  className="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events; 