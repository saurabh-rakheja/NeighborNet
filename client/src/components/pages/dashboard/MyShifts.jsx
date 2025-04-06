import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyShifts = () => {
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState([]);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [events, setEvents] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch volunteer profile
        const profileResponse = await axios.get('/api/volunteers/profile');
        if (!profileResponse.data.success) {
          toast.error('Error fetching volunteer profile');
          return;
        }
        
        setVolunteerProfile(profileResponse.data.data);
        const volunteerId = profileResponse.data.data._id;
        
        // Now fetch all events to get their details
        const eventsResponse = await axios.get('/api/events');
        if (eventsResponse.data.success) {
          const eventsData = {};
          eventsResponse.data.data.forEach(event => {
            eventsData[event._id] = event;
          });
          setEvents(eventsData);
        }
        
        // For demonstration, we'll simulate fetching shifts
        // In a real implementation, you'd create an API endpoint like:
        // GET /api/shifts/volunteer/:volunteerId
        
        // Placeholder for shift data
        // This would normally come from a backend API
        const shiftsData = [];
        
        // If you implement the API endpoint, use this instead:
        // const shiftsResponse = await axios.get(`/api/shifts/volunteer/${volunteerId}`);
        // if (shiftsResponse.data.success) {
        //   setShifts(shiftsResponse.data.data);
        // }
        
        setShifts(shiftsData);
      } catch (error) {
        toast.error('Error loading volunteer data');
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  if (loading) {
    return <div className="text-center py-10">Loading your shifts...</div>;
  }
  
  if (!volunteerProfile) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">You need to create a volunteer profile first.</p>
          <Link
            to="/dashboard/volunteer-profile"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Volunteer Profile
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Volunteer Shifts</h1>
        <Link 
          to="/dashboard/events" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Find More Opportunities
        </Link>
      </div>
      
      {/* Volunteer Stats */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border-r border-gray-200">
            <p className="text-gray-500 mb-1">Total Hours</p>
            <p className="text-3xl font-bold text-blue-600">{volunteerProfile.totalHours || 0}</p>
          </div>
          <div className="text-center p-4 border-r border-gray-200">
            <p className="text-gray-500 mb-1">Completed Shifts</p>
            <p className="text-3xl font-bold text-green-600">
              {shifts.filter(s => s.status === 'Completed').length}
            </p>
          </div>
          <div className="text-center p-4">
            <p className="text-gray-500 mb-1">Upcoming Shifts</p>
            <p className="text-3xl font-bold text-purple-600">
              {shifts.filter(s => ['Signed Up', 'Confirmed'].includes(s.status)).length}
            </p>
          </div>
        </div>
      </div>
      
      {/* Upcoming Shifts */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Upcoming Shifts</h2>
        </div>
        
        {shifts.filter(s => ['Signed Up', 'Confirmed'].includes(s.status)).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>You don't have any upcoming shifts scheduled.</p>
            <p className="mt-2">
              <Link to="/dashboard/events" className="text-blue-500 hover:underline">
                Browse events to find volunteer opportunities
              </Link>
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {shifts
              .filter(s => ['Signed Up', 'Confirmed'].includes(s.status))
              .map((shift) => {
                const event = events[shift.eventId];
                return (
                  <div key={shift._id} className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{shift.name}</h3>
                        <p className="text-blue-600">
                          {event ? event.title : 'Unknown Event'}
                        </p>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Date: </span>
                            {formatDate(shift.startTime)}
                          </p>
                          <p>
                            <span className="font-medium">Time: </span>
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </p>
                          {shift.location && (
                            <p>
                              <span className="font-medium">Location: </span>
                              {shift.location}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${shift.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                          >
                            {shift.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0">
                        {event && (
                          <Link
                            to={`/dashboard/events/${event._id}`}
                            className="text-blue-500 hover:underline"
                          >
                            View Event Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      
      {/* Past Shifts */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Past Shifts</h2>
        </div>
        
        {shifts.filter(s => s.status === 'Completed').length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>You don't have any completed shifts yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {shifts
              .filter(s => s.status === 'Completed')
              .map((shift) => {
                const event = events[shift.eventId];
                return (
                  <div key={shift._id} className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{shift.name}</h3>
                        <p className="text-blue-600">
                          {event ? event.title : 'Unknown Event'}
                        </p>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Date: </span>
                            {formatDate(shift.startTime)}
                          </p>
                          <p>
                            <span className="font-medium">Time: </span>
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </p>
                          {shift.location && (
                            <p>
                              <span className="font-medium">Location: </span>
                              {shift.location}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-2 flex items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium mr-2">
                            Completed
                          </span>
                          <span className="text-gray-700 text-sm">
                            <span className="font-medium">Hours Logged: </span>
                            {shift.hoursLogged}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyShifts; 