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
        
        // For demonstration, we're adding some sample shifts
        // In a real implementation, you'd fetch from the API
        const shiftsData = [
          {
            _id: '1',
            name: 'Morning Cleanup',
            eventId: '101',
            startTime: new Date(new Date().getTime() + 86400000).toISOString(), // tomorrow
            endTime: new Date(new Date().getTime() + 86400000 + 10800000).toISOString(), // +3hrs
            location: 'Central Park',
            status: 'Signed Up',
            hoursLogged: 0
          },
          {
            _id: '2',
            name: 'Food Distribution',
            eventId: '102',
            startTime: new Date(new Date().getTime() - 86400000).toISOString(), // yesterday
            endTime: new Date(new Date().getTime() - 86400000 + 14400000).toISOString(), // +4hrs
            location: 'Community Center',
            status: 'Completed',
            hoursLogged: 4
          }
        ];
        
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
  
  // Function to log hours for a completed shift
  const [selectedShift, setSelectedShift] = useState(null);
  const [hoursLogged, setHoursLogged] = useState(0);
  const [logHoursModalOpen, setLogHoursModalOpen] = useState(false);
  
  const openLogHoursModal = (shift) => {
    setSelectedShift(shift);
    setHoursLogged(shift.hoursLogged || 0);
    setLogHoursModalOpen(true);
  };
  
  const closeLogHoursModal = () => {
    setSelectedShift(null);
    setHoursLogged(0);
    setLogHoursModalOpen(false);
  };
  
  const handleLogHours = async () => {
    if (!selectedShift) return;
    
    try {
      // In a real implementation, you would send this to your API
      // await axios.post(`/api/shifts/${selectedShift._id}/log-hours`, { hours: hoursLogged });
      
      // For demo, we'll update the state directly
      const updatedShifts = shifts.map(shift => {
        if (shift._id === selectedShift._id) {
          return { ...shift, hoursLogged, status: 'Completed' };
        }
        return shift;
      });
      
      setShifts(updatedShifts);
      toast.success('Hours logged successfully!');
      closeLogHoursModal();
    } catch (error) {
      toast.error('Error logging hours');
      console.error('Error logging hours:', error);
    }
  };
  
  // Function to cancel a shift signup
  const cancelShiftSignup = async (shiftId) => {
    if (!confirm('Are you sure you want to cancel your signup for this shift?')) {
      return;
    }
    
    try {
      // In a real implementation, you would send this to your API
      // await axios.delete(`/api/shifts/${shiftId}/signup`);
      
      // For demo, we'll update the state directly
      const updatedShifts = shifts.filter(shift => shift._id !== shiftId);
      setShifts(updatedShifts);
      
      toast.success('Shift signup cancelled');
    } catch (error) {
      toast.error('Error cancelling shift signup');
      console.error('Error cancelling shift:', error);
    }
  };

  // Calculate total impact
  const totalCompletedHours = shifts
    .filter(s => s.status === 'Completed')
    .reduce((total, shift) => total + (shift.hoursLogged || 0), 0);
  
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
            <p className="text-3xl font-bold text-blue-600">{totalCompletedHours || 0}</p>
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
                      
                      <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                        {event && (
                          <Link
                            to={`/dashboard/events/${event._id}`}
                            className="text-blue-500 hover:underline text-sm"
                          >
                            View Event Details
                          </Link>
                        )}
                        <button
                          onClick={() => cancelShiftSignup(shift._id)}
                          className="text-red-500 hover:underline text-sm"
                        >
                          Cancel Signup
                        </button>
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
                            {shift.hoursLogged || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-gray-700 text-sm">
                          <span className="font-medium">Hours Logged: </span>
                          {shift.hoursLogged || 0}
                        </span>
                      </div>
                      <button
                        onClick={() => openLogHoursModal(shift)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        {shift.hoursLogged > 0 ? 'Update Hours' : 'Log Hours'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      
      {/* Log Hours Modal */}
      {logHoursModalOpen && selectedShift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Log Volunteer Hours</h2>
            <p className="mb-4 text-gray-600">
              {selectedShift.name} on {formatDate(selectedShift.startTime)}
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Hours Volunteered
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hoursLogged}
                onChange={(e) => setHoursLogged(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeLogHoursModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLogHours}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Hours
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShifts; 