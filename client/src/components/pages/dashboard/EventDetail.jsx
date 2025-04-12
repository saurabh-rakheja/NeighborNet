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
  const [volunteersSignedUp, setVolunteersSignedUp] = useState([]);
  const [showVolunteers, setShowVolunteers] = useState(false);

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

  const sendVolunteerNotification = async (message) => {
    try {
      // In a real app, you would send a notification through your API
      // await axios.post('/api/notifications', { message, userId: user._id });
      
      toast.info(message);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleCancelSignup = async (shiftId) => {
    if (!confirm('Are you sure you want to cancel your signup for this shift?')) {
      return;
    }
    
    try {
      setSignupLoading(true);
      
      // Call API to cancel signup
      // const response = await axios.delete(`/api/shifts/${shiftId}/signup`);
      
      // Mock the API response
      const response = { data: { success: true } };
      
      if (response.data.success) {
        toast.success('Successfully cancelled shift signup');
        
        // Refetch shifts to update the UI
        const shiftsResponse = await axios.get(`/api/shifts/event/${id}`);
        if (shiftsResponse.data.success) {
          setShifts(shiftsResponse.data.data);
        }
        
        // Update local state to remove the volunteer from the shift
        const updatedShifts = shifts.map(shift => {
          if (shift._id === shiftId) {
            return {
              ...shift,
              volunteers: shift.volunteers.filter(v => v.volunteerId !== volunteerProfile._id)
            };
          }
          return shift;
        });
        
        setShifts(updatedShifts);
        
        // Send notification
        sendVolunteerNotification('You have cancelled your shift signup.');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Error cancelling shift signup'
      );
    } finally {
      setSignupLoading(false);
    }
  };

  const shareEvent = () => {
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this volunteer opportunity: ${event.title}`,
        url: url,
      })
      .then(() => console.log('Share successful'))
      .catch(error => console.log('Error sharing', error));
    } else {
      // Fallback
      navigator.clipboard.writeText(url)
        .then(() => {
          toast.success('Event link copied to clipboard!');
        })
        .catch(err => {
          toast.error('Failed to copy link');
        });
    }
  };

  const fetchVolunteerList = async () => {
    setShowVolunteers(!showVolunteers);
    
    if (!showVolunteers && volunteersSignedUp.length === 0) {
      try {
        // In a real app, fetch this from the API
        // const response = await axios.get(`/api/events/${id}/volunteers`);
        
        // Mock the response
        const mockData = [
          { id: '1', name: 'John Doe', hours: 12, shifts: 3 },
          { id: '2', name: 'Jane Smith', hours: 8, shifts: 2 },
          { id: '3', name: 'Alex Johnson', hours: 5, shifts: 1 },
        ];
        
        setVolunteersSignedUp(mockData);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        toast.error('Failed to load volunteer list');
      }
    }
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
      
      // Call API to sign up
      // const response = await axios.post(`/api/shifts/${shiftId}/signup`);
      
      // Mock the API response
      const response = { data: { success: true } };
      
      if (response.data.success) {
        toast.success('Successfully signed up for shift');
        
        // Update local state to add the volunteer to the shift
        const updatedShifts = shifts.map(shift => {
          if (shift._id === shiftId) {
            return {
              ...shift,
              volunteers: [
                ...shift.volunteers,
                { volunteerId: volunteerProfile._id, status: 'Signed Up', name: user?.name || 'You' }
              ]
            };
          }
          return shift;
        });
        
        setShifts(updatedShifts);
        
        // Send notification
        sendVolunteerNotification('You have successfully signed up for a shift!');
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
                            onClick={() => handleCancelSignup(shift._id)}
                            disabled={signupLoading}
                            className="flex items-center justify-center py-2 px-4 border border-red-500 text-red-500 rounded hover:bg-red-50 transition-colors duration-200"
                          >
                            {signupLoading ? 'Processing...' : 'Cancel Signup'}
                          </button>
                        )}
                        
                        {volunteerProfile && 
                          volunteerProfile.verificationStatus === 'Verified' && 
                          !isSignedUp(shift) && 
                          !isShiftFull(shift) && (
                            <button
                              onClick={() => handleSignUp(shift._id)}
                              disabled={signupLoading}
                              className={`flex items-center justify-center py-2 px-4 rounded transition-colors duration-200 ${
                                isShiftFull(shift)
                                  ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                            >
                              {signupLoading
                                ? 'Processing...'
                                : isShiftFull(shift)
                                ? 'Shift Full'
                                : 'Sign Up'}
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add share button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={shareEvent}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
                />
              </svg>
              Share Event
            </button>
          </div>

          {/* Volunteer list section */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <button
              onClick={fetchVolunteerList}
              className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
            >
              <span className="mr-2">{showVolunteers ? '▼' : '►'}</span>
              Show Volunteers ({event.volunteersRegistered || 0})
            </button>
            
            {showVolunteers && (
              <div className="bg-gray-50 rounded-lg p-4">
                {volunteersSignedUp.length === 0 ? (
                  <p className="text-gray-500 text-center">No volunteers have signed up yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {volunteersSignedUp.map(volunteer => (
                      <li key={volunteer.id} className="py-3 flex justify-between">
                        <span>{volunteer.name}</span>
                        <span className="text-gray-500">{volunteer.shifts} shifts</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail; 