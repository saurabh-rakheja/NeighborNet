import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import useAuthStore from '../../../store/authStore';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiHeart,
  FiEdit2,
  FiSave,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiHelpCircle
} from 'react-icons/fi';

const VolunteerProfile = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    bio: '',
    interests: [],
    skills: [],
    availability: {
      weekdays: false,
      weekends: false,
      mornings: false,
      afternoons: false,
      evenings: false
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    volunteerStatus: 'Active',
    verificationStatus: 'Pending'
  });
  
  // Available interests and skills for selection
  const interestOptions = [
    'Environmental Conservation',
    'Community Support',
    'Education & Literacy',
    'Healthcare',
    'Animal Welfare',
    'Homelessness',
    'Food Insecurity',
    'Elderly Support',
    'Youth Mentoring',
    'Disaster Relief'
  ];
  
  const skillOptions = [
    'Teaching',
    'Event Planning',
    'Social Media',
    'Writing & Editing',
    'Public Speaking',
    'Counseling',
    'First Aid',
    'Transportation',
    'Leadership',
    'Foreign Languages',
    'Technical Skills',
    'Administrative'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // In a real implementation you would fetch from your API
      // const response = await axios.get('/api/volunteers/profile');
      
      // For now, we'll simulate a response with mock data
      const mockProfile = {
        name: user?.name || 'Jane Volunteer',
        email: user?.email || 'jane.volunteer@example.com',
        phone: '(555) 123-4567',
        address: '123 Volunteer Ave',
        city: 'Helptown',
        state: 'CA',
        zipCode: '90210',
        dateOfBirth: '1990-03-15',
        bio: 'Passionate about making a difference in my community. I enjoy environmental and education-related volunteering opportunities.',
        interests: ['Environmental Conservation', 'Education & Literacy', 'Youth Mentoring'],
        skills: ['Teaching', 'Leadership', 'Event Planning'],
        availability: {
          weekdays: true,
          weekends: true,
          mornings: false,
          afternoons: true,
          evenings: true
        },
        emergencyContact: {
          name: 'John Smith',
          relationship: 'Spouse',
          phone: '(555) 987-6543'
        },
        volunteerStatus: 'Active',
        verificationStatus: 'Verified',
        totalHours: 75,
        eventsAttended: 12,
        joinedDate: '2022-06-15'
      };
      
      // Simulate API delay
      setTimeout(() => {
        setProfile(mockProfile);
        setLoading(false);
      }, 600);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects like emergencyContact.name
      const [parent, child] = name.split('.');
      setProfile((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'interests' || name === 'skills') {
      // Handle multi-select lists
      const currentValues = [...profile[name]];
      if (type === 'checkbox') {
        if (checked) {
          currentValues.push(value);
        } else {
          const index = currentValues.indexOf(value);
          if (index > -1) {
            currentValues.splice(index, 1);
          }
        }
        setProfile((prev) => ({
          ...prev,
          [name]: currentValues
        }));
      }
    } else if (name.startsWith('availability.')) {
      // Handle availability checkboxes
      const availabilityKey = name.split('.')[1];
      setProfile((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          [availabilityKey]: checked
        }
      }));
    } else {
      // Handle regular inputs
      setProfile((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // In a real implementation, you would call your API
      // await axios.put('/api/volunteers/profile', profile);
      
      // Simulate API delay
      setTimeout(() => {
        toast.success('Profile updated successfully');
        setSaving(false);
        setEditMode(false);
      }, 800);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    // Reset any changes by fetching the profile again
    fetchProfile();
    setEditMode(false);
  };

  // Display the verification status with appropriate styling
  const VerificationStatus = () => {
    let icon, bgColor, textColor;
    
    switch (profile.verificationStatus) {
      case 'Verified':
        icon = <FiCheckCircle className="mr-2" />;
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'Pending':
        icon = <FiHelpCircle className="mr-2" />;
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'Rejected':
        icon = <FiAlertCircle className="mr-2" />;
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        icon = <FiHelpCircle className="mr-2" />;
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <div className={`${bgColor} ${textColor} rounded-full px-3 py-1 flex items-center text-sm font-medium`}>
        {icon} {profile.verificationStatus}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Volunteer Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your volunteer information and preferences
          </p>
        </div>
        
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <FiEdit2 className="mr-2" /> Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={cancelEdit}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <FiX className="mr-2" /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors ${
                saving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                <FiUser size={36} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-gray-600 mt-1">{profile.email}</p>
              <div className="mt-3">
                <VerificationStatus />
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="py-3 flex items-center">
                <FiPhone className="text-gray-400 mr-3" />
                <span>{profile.phone || 'No phone number'}</span>
              </div>
              <div className="py-3 flex items-center">
                <FiMapPin className="text-gray-400 mr-3" />
                <span>
                  {profile.city && profile.state
                    ? `${profile.city}, ${profile.state}`
                    : 'Location not provided'}
                </span>
              </div>
              <div className="py-3 flex items-center">
                <FiCalendar className="text-gray-400 mr-3" />
                <span>
                  Volunteer since{' '}
                  {profile.joinedDate
                    ? new Date(profile.joinedDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {profile.totalHours || 0}
                </div>
                <div className="text-xs text-indigo-600 font-medium">
                  Volunteer Hours
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">
                  {profile.eventsAttended || 0}
                </div>
                <div className="text-xs text-purple-600 font-medium">
                  Events Attended
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border ${
                      !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border ${
                      !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border ${
                      !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border ${
                      !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4">Bio</h3>
              <div className="mb-6">
                <textarea
                  name="bio"
                  rows="4"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full px-3 py-2 border ${
                    !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                  } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="Tell us about yourself and why you volunteer..."
                ></textarea>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border ${
                      !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border ${
                      !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={profile.state}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border ${
                        !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={profile.zipCode}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`w-full px-3 py-2 border ${
                        !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                      } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Interests & Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Areas of Interest
                  </label>
                  {editMode ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg p-3">
                      {interestOptions.map((interest) => (
                        <div key={interest} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`interest-${interest}`}
                            name="interests"
                            value={interest}
                            checked={profile.interests.includes(interest)}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`interest-${interest}`}
                            className="ml-2 block text-sm text-gray-700"
                          >
                            {interest}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.length > 0 ? (
                        profile.interests.map((interest) => (
                          <span
                            key={interest}
                            className="bg-indigo-100 text-indigo-700 text-sm font-medium px-2.5 py-1 rounded-full"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No interests selected</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  {editMode ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg p-3">
                      {skillOptions.map((skill) => (
                        <div key={skill} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`skill-${skill}`}
                            name="skills"
                            value={skill}
                            checked={profile.skills.includes(skill)}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`skill-${skill}`}
                            className="ml-2 block text-sm text-gray-700"
                          >
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.length > 0 ? (
                        profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="bg-purple-100 text-purple-700 text-sm font-medium px-2.5 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No skills selected</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4">Availability</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="weekdays"
                    name="availability.weekdays"
                    checked={profile.availability.weekdays}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="weekdays" className="ml-2 block text-sm text-gray-700">
                    Weekdays
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="weekends"
                    name="availability.weekends"
                    checked={profile.availability.weekends}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="weekends" className="ml-2 block text-sm text-gray-700">
                    Weekends
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mornings"
                    name="availability.mornings"
                    checked={profile.availability.mornings}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="mornings" className="ml-2 block text-sm text-gray-700">
                    Mornings
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="afternoons"
                    name="availability.afternoons"
                    checked={profile.availability.afternoons}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="afternoons" className="ml-2 block text-sm text-gray-700">
                    Afternoons
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="evenings"
                    name="availability.evenings"
                    checked={profile.availability.evenings}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="evenings" className="ml-2 block text-sm text-gray-700">
                    Evenings
                  </label>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.name"
                    value={profile.emergencyContact.name}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border ${
                      !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    name="emergencyContact.relationship"
                    value={profile.emergencyContact.relationship}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border ${
                      !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact.phone"
                    value={profile.emergencyContact.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                    className={`w-full px-3 py-2 border ${
                      !editMode ? 'bg-gray-50 text-gray-500' : 'bg-white'
                    } border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile; 