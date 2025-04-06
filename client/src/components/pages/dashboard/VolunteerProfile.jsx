import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../../../store/authStore';

// Set base URL for all Axios requests
axios.defaults.baseURL = 'http://localhost:5000';

// Add authorization header to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage') 
      ? JSON.parse(localStorage.getItem('auth-storage')).state.token 
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const VolunteerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState({
    skills: [],
    availability: {
      weekdays: [],
      timeSlots: [],
    },
    preferredLocations: [],
    experience: 'Beginner',
    interests: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    notes: '',
  });
  const [newSkill, setNewSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [hasProfile, setHasProfile] = useState(false);

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening'];
  const experienceLevels = ['Beginner', 'Intermediate', 'Expert'];

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch volunteer profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is authenticated
        if (!isAuthenticated) {
          return;
        }
        
        const response = await axios.get('/api/volunteers/profile');
        
        if (response.data.success) {
          setProfile(response.data.data);
          setHasProfile(true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Handle 404 error separately (user doesn't have a profile yet)
        if (error.response && error.response.status === 404) {
          setHasProfile(false);
          // This is an expected state, no need to show error toast
        } else {
          // Handle other errors (network error, server error, etc.)
          setError('Failed to fetch volunteer profile. Please try again.');
          toast.error('Error fetching volunteer profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile({
        ...profile,
        [parent]: {
          ...profile[parent],
          [child]: value,
        },
      });
    } else {
      setProfile({
        ...profile,
        [name]: value,
      });
    }
  };

  const handleWeekdayChange = (day) => {
    const updatedWeekdays = profile.availability.weekdays.includes(day)
      ? profile.availability.weekdays.filter((d) => d !== day)
      : [...profile.availability.weekdays, day];

    setProfile({
      ...profile,
      availability: {
        ...profile.availability,
        weekdays: updatedWeekdays,
      },
    });
  };

  const handleTimeSlotChange = (slot) => {
    const updatedTimeSlots = profile.availability.timeSlots.includes(slot)
      ? profile.availability.timeSlots.filter((s) => s !== slot)
      : [...profile.availability.timeSlots, slot];

    setProfile({
      ...profile,
      availability: {
        ...profile.availability,
        timeSlots: updatedTimeSlots,
      },
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skill),
    });
  };

  const addLocation = () => {
    if (newLocation.trim() && !profile.preferredLocations.includes(newLocation.trim())) {
      setProfile({
        ...profile,
        preferredLocations: [...profile.preferredLocations, newLocation.trim()],
      });
      setNewLocation('');
    }
  };

  const removeLocation = (location) => {
    setProfile({
      ...profile,
      preferredLocations: profile.preferredLocations.filter((l) => l !== location),
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter((i) => i !== interest),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (hasProfile) {
        const response = await axios.put('/api/volunteers/profile', profile);
        if (response.data.success) {
          toast.success('Volunteer profile updated successfully');
        }
      } else {
        const response = await axios.post('/api/volunteers/profile', profile);
        if (response.data.success) {
          setHasProfile(true);
          toast.success('Volunteer profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error.response?.data?.message || 'Error saving volunteer profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-lg text-gray-700">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">
        {hasProfile ? 'Update Volunteer Profile' : 'Create Volunteer Profile'}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {profile.verificationStatus && (
        <div className={`mb-4 p-3 rounded ${
          profile.verificationStatus === 'Verified' 
            ? 'bg-green-100 text-green-800' 
            : profile.verificationStatus === 'Rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          <p className="font-semibold">
            Verification Status: {profile.verificationStatus}
          </p>
          {profile.verificationStatus === 'Pending' && (
            <p className="text-sm mt-1">
              Your profile is pending verification. You'll be able to sign up for shifts once verified.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Skills */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Skills</label>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="border rounded-l px-3 py-2 w-full"
              placeholder="Add a skill..."
            />
            <button
              type="button"
              onClick={addSkill}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.skills.map((skill, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-blue-800 hover:text-blue-900 font-bold"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Experience Level
          </label>
          <select
            name="experience"
            value={profile.experience}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
          >
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Availability
          </label>
          <div className="mb-3">
            <h3 className="text-gray-600 mb-1">Weekdays</h3>
            <div className="flex flex-wrap gap-2">
              {weekdays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleWeekdayChange(day)}
                  className={`px-3 py-1 rounded-full ${
                    profile.availability.weekdays.includes(day)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-gray-600 mb-1">Time Slots</h3>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleTimeSlotChange(slot)}
                  className={`px-3 py-1 rounded-full ${
                    profile.availability.timeSlots.includes(slot)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferred Locations */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Preferred Locations
          </label>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              className="border rounded-l px-3 py-2 w-full"
              placeholder="Add a location..."
            />
            <button
              type="button"
              onClick={addLocation}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.preferredLocations.map((location, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{location}</span>
                <button
                  type="button"
                  onClick={() => removeLocation(location)}
                  className="ml-2 text-blue-800 hover:text-blue-900 font-bold"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Volunteer Interests
          </label>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="border rounded-l px-3 py-2 w-full"
              placeholder="Add an interest..."
            />
            <button
              type="button"
              onClick={addInterest}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.interests.map((interest, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
              >
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => removeInterest(interest)}
                  className="ml-2 text-blue-800 hover:text-blue-900 font-bold"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Emergency Contact
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">Name</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={profile.emergencyContact.name}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Relationship
              </label>
              <input
                type="text"
                name="emergencyContact.relationship"
                value={profile.emergencyContact.relationship}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="emergencyContact.phone"
                value={profile.emergencyContact.phone}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={profile.notes}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full h-32"
            placeholder="Any additional information..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center"
          >
            {saving ? (
              <>
                <span className="inline-block animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                {hasProfile ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              hasProfile ? 'Update Profile' : 'Create Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VolunteerProfile; 