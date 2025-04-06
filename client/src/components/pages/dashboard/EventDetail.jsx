import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signupLoading, setSignupLoading] = useState(false);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const fetchEventAndShifts = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventResponse = await axios.get(`/api/events/${id}`);
        
        if (eventResponse.data.success) {
          setEvent(eventResponse.data.data);
          
          // Fetch shifts for this event
          const shiftsResponse = await axios.get(`/api/shifts/event/${id}`);
          
          if (shiftsResponse.data.success) {
            setShifts(shiftsResponse.data.data);
          }
          
          // Get current user info
          try {
            const userResponse = await axios.get('/api/users/me');
            if (userResponse.data.success) {
              setUser(userResponse.data.data);
              
              // Check if user is the organizer of this event
              if (eventResponse.data.data.organizerId && 
                  userResponse.data.data._id === eventResponse.data.data.organizerId._id) {
                setIsOrganizer(true);
              }
            }
          } catch (error) {
            console.log('Error fetching user info');
          }
        }
        
        // Try to fetch volunteer profile (will fail if not logged in or no profile)
        try {
          const profileResponse = await axios.get('/api/volunteers/profile');
          if (profileResponse.data.success) {
            setVolunteerProfile(profileResponse.data.data);
          }
        } catch (error) {
          // User might not be logged in or doesn't have a volunteer profile
          console.log('No volunteer profile found');
        }
        
      } catch (error) {
        toast.error('Error loading event details');
        console.error('Error fetching event:', error);
        navigate('/dashboard/events');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventAndShifts();
  }, [id, navigate]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const handleSignUp = async (shiftId) => {
    if (!volunteerProfile) {
      toast.error('You need to create a volunteer profile first');
      navigate('/dashboard/volunteer-profile');
      return;
    }
    
    if (volunteerProfile.verificationStatus !== 'Verified') {
      toast.info('Your volunteer profile needs to be verified before signing up for shifts');
      return;
    }
    
    try {
      setSignupLoading(true);
      
      const response = await axios.post(`/api/shifts/${shiftId}/signup`);
      
      if (response.data.success) {
        toast.success('Successfully signed up for shift');
        
        // Refetch shifts to update the UI
        const shiftsResponse = await axios.get(`/api/shifts/event/${id}`);
        if (shiftsResponse.data.success) {
          setShifts(shiftsResponse.data.data);
        }
        
        // Refetch event to update volunteer count
        const eventResponse = await axios.get(`/api/events/${id}`);
        if (eventResponse.data.success) {
          setEvent(eventResponse.data.data);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error signing up for shift'
      );
    } finally {
      setSignupLoading(false);
    }
  };

  // Check if user is already signed up for a shift
  const isSignedUp = (shift) => {
    if (!volunteerProfile) return false;
    
    return shift.volunteers.some(
      v => v.volunteerId === volunteerProfile._id
    );
  };

  // Check if a shift is full
  const isShiftFull = (shift) => {
    return shift.volunteers.length >= shift.volunteersNeeded;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Event not found.</p>
          <Link to="/dashboard/events" className="text-blue-500 hover:underline mt-4 inline-block">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link to="/dashboard/events" className="text-blue-500 hover:underline flex items-center">
          <span className="mr-1">←</span> Back to Events
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Event Header */}
        <div className="relative">
          {event.image ? (
            <div className="h-64 bg-gray-200">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-64 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-2xl">No Image</span>
            </div>
          )}
          
          <div className="absolute top-0 right-0 m-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' : 
              event.status === 'Ongoing' ? 'bg-green-100 text-green-800' : 
              event.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {event.status}
            </span>
          </div>
        </div>
        
        {/* Event Content */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              event.category === 'Community Service' ? 'bg-purple-100 text-purple-800' : 
              event.category === 'Environmental' ? 'bg-green-100 text-green-800' : 
              event.category === 'Education' ? 'bg-blue-100 text-blue-800' : 
              event.category === 'Healthcare' ? 'bg-red-100 text-red-800' : 
              event.category === 'Animal Welfare' ? 'bg-yellow-100 text-yellow-800' : 
              event.category === 'Food Donation' ? 'bg-orange-100 text-orange-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {event.category}
            </span>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Event Details</h2>
              
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-500 w-24">Date:</span>
                  <span className="text-gray-800">
                    {formatDate(event.startDate)}
                    {formatDate(event.startDate) !== formatDate(event.endDate) && 
                      ` - ${formatDate(event.endDate)}`}
                  </span>
                </div>
                
                <div className="flex">
                  <span className="text-gray-500 w-24">Location:</span>
                  <div>
                    <p className="text-gray-800">{event.location.address}</p>
                    <p className="text-gray-800">
                      {event.location.city}, {event.location.state} {event.location.zipCode}
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <span className="text-gray-500 w-24">Organized by:</span>
                  <span className="text-gray-800">
                    {event.organizerId?.name || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Volunteer Information</h2>
              
              <div className="space-y-3">
                <div className="flex">
                  <span className="text-gray-500 w-32">Volunteers:</span>
                  <span className="text-gray-800">
                    {event.volunteersRegistered} / {event.volunteersNeeded}
                  </span>
                </div>
                
                {event.skillsRequired && event.skillsRequired.length > 0 && (
                  <div className="flex">
                    <span className="text-gray-500 w-32">Skills needed:</span>
                    <div className="flex flex-wrap gap-1">
                      {event.skillsRequired.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Shifts Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Available Shifts</h2>
              
              {isOrganizer && (
                <Link
                  to={`/dashboard/events/${id}/shifts/create`}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add Shift
                </Link>
              )}
            </div>
            
            {shifts.length === 0 ? (
              <div className="bg-white rounded-lg border p-6 text-center">
                <p className="text-gray-500 mb-4">No shifts available for this event yet.</p>
                
                {isOrganizer && (
                  <Link
                    to={`/dashboard/events/${id}/shifts/create`}
                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Create First Shift
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {shifts.map((shift) => (
                  <div
                    key={shift._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{shift.name}</h3>
                        <p className="text-gray-600 mb-2">{shift.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-3">
                          <div>
                            <span className="font-medium">Date: </span>
                            {formatDate(shift.startTime)}
                          </div>
                          
                          <div>
                            <span className="font-medium">Time: </span>
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </div>
                          
                          {shift.location && (
                            <div>
                              <span className="font-medium">Location: </span>
                              {shift.location}
                            </div>
                          )}
                        </div>
                        
                        {shift.tasks && shift.tasks.length > 0 && (
                          <div className="mb-3">
                            <span className="font-medium text-sm">Tasks: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {shift.tasks.map((task, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                                >
                                  {task}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Volunteers: </span>
                          <span className={shift.volunteers.length >= shift.volunteersNeeded ? 'text-red-600' : ''}>
                            {shift.volunteers.length} / {shift.volunteersNeeded}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-4 flex md:flex-col justify-end">
                        {!volunteerProfile && (
                          <Link
                            to="/dashboard/volunteer-profile"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
                          >
                            Create Profile to Sign Up
                          </Link>
                        )}
                        
                        {volunteerProfile && volunteerProfile.verificationStatus !== 'Verified' && (
                          <button
                            className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded cursor-not-allowed text-center"
                            disabled
                          >
                            Awaiting Verification
                          </button>
                        )}
                        
                        {volunteerProfile && volunteerProfile.verificationStatus === 'Verified' && isSignedUp(shift) && (
                          <button
                            className="bg-green-100 text-green-800 px-4 py-2 rounded cursor-not-allowed text-center"
                            disabled
                          >
                            Already Signed Up
                          </button>
                        )}
                        
                        {volunteerProfile && 
                          volunteerProfile.verificationStatus === 'Verified' && 
                          !isSignedUp(shift) && 
                          isShiftFull(shift) && (
                            <button
                              className="bg-red-100 text-red-800 px-4 py-2 rounded cursor-not-allowed text-center"
                              disabled
                            >
                              Shift Full
                            </button>
                        )}
                        
                        {volunteerProfile && 
                          volunteerProfile.verificationStatus === 'Verified' && 
                          !isSignedUp(shift) && 
                          !isShiftFull(shift) && (
                            <button
                              onClick={() => handleSignUp(shift._id)}
                              disabled={signupLoading}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 text-center"
                            >
                              {signupLoading ? 'Signing Up...' : 'Sign Up'}
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 