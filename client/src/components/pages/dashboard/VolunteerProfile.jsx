import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
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
  FiHelpCircle,
  FiClock,
  FiCode,
  FiDatabase,
  FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import LoadingSpinner from '../../LoadingSpinner';

// --- Test API component ---
const ApiTester = ({ token, userId, refreshUserData }) => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [tokenStatus, setTokenStatus] = useState({ valid: true, message: 'Token appears valid' });

  // Check if token looks valid
  useEffect(() => {
    if (token) {
      try {
        // Simple validation - check if token has three parts separated by dots
        const parts = token.split('.');
        if (parts.length !== 3) {
          setTokenStatus({ valid: false, message: 'Token format is invalid' });
        } else {
          // Try to decode the payload (middle part)
          const payload = JSON.parse(atob(parts[1]));
          const expiry = payload.exp;
          
          if (expiry && expiry * 1000 < Date.now()) {
            setTokenStatus({ valid: false, message: 'Token appears to be expired' });
          } else {
            setTokenStatus({ valid: true, message: 'Token appears valid' });
          }
        }
      } catch (error) {
        setTokenStatus({ valid: false, message: 'Could not validate token: ' + error.message });
      }
    } else {
      setTokenStatus({ valid: false, message: 'No token available' });
    }
  }, [token]);

  const testEndpoints = async () => {
    setTesting(true);
    setShowResults(true);
    const testResults = {};
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    // Add token diagnostic
    testResults['Token Status'] = {
      status: tokenStatus.valid ? 'Valid' : 'Invalid',
      success: tokenStatus.valid,
      message: tokenStatus.message,
      tokenPreview: token ? `${token.substring(0, 15)}...` : 'No token'
    };

    // List of endpoints to test
    const endpoints = [
      { name: 'API Health', url: `${apiBaseUrl}/api/health` },
      { name: 'Current User', url: `${apiBaseUrl}/api/users/me` },
      { name: 'User Profile', url: `${apiBaseUrl}/api/users/${userId}` },
      { name: 'Volunteer Profile', url: `${apiBaseUrl}/api/volunteers/profile` },
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint.url}`);
        const startTime = Date.now();
        const response = await axios.get(endpoint.url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const endTime = Date.now();
        
        testResults[endpoint.name] = {
          status: response.status,
          success: true,
          message: 'Success',
          responseTime: `${endTime - startTime}ms`,
          dataKeys: Object.keys(response.data).join(', '),
          hasData: !!response.data
        };
      } catch (error) {
        console.error(`Error testing ${endpoint.name}:`, error);
        
        // Special handling for 401/403 errors - suggest token refresh
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          testResults[endpoint.name] = {
            status: error.response.status,
            success: false,
            message: `Authentication error: ${error.response.data?.message || 'Token rejected'}`,
            error: true,
            needsRefresh: true
          };
        } else {
          testResults[endpoint.name] = {
            status: error.response?.status || 'Network Error',
            success: false,
            message: error.response?.data?.message || error.message,
            error: true
          };
        }
      }
    }

    setResults(testResults);
    setTesting(false);
    
    // Check if we had auth errors and should try refreshing
    const hasAuthErrors = Object.values(testResults).some(result => result.needsRefresh);
    if (hasAuthErrors) {
      toast.warning("Authentication issues detected. Try refreshing your session.");
    }
  };

  const refreshToken = () => {
    // Call the auth store's refresh function
    if (refreshUserData) {
      toast.info("Attempting to refresh authentication...");
      refreshUserData();
    } else {
      toast.error("Refresh function not available");
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-semibold flex items-center">
          <FiDatabase className="mr-2" /> API Diagnostics
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={refreshToken}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 text-sm rounded flex items-center"
          >
            <FiRefreshCw className="mr-1" /> Refresh Auth
          </button>
          <button 
            onClick={testEndpoints}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded flex items-center"
          >
            {testing ? <LoadingSpinner size="small" /> : <><FiCode className="mr-1" /> Test API Endpoints</>}
          </button>
        </div>
      </div>
      
      {showResults && (
        <div className="text-sm">
          <div className="mb-2">
            <button 
              onClick={() => setShowResults(false)} 
              className="text-gray-500 text-xs"
            >
              Hide Results
            </button>
          </div>
          
          {Object.keys(results).length === 0 ? (
            <p className="text-gray-500">No test results yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(results).map(([name, result]) => (
                <div key={name} className={`p-2 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex justify-between">
                    <span className="font-medium">{name}</span>
                    <span className={`${result.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.status} {result.success ? '✓' : '✗'}
                    </span>
                  </div>
                  {result.success ? (
                    <div className="text-xs text-gray-600 mt-1">
                      <div>Response time: {result.responseTime}</div>
                      {result.dataKeys && <div>Data contains: {result.dataKeys}</div>}
                    </div>
                  ) : (
                    <div className="text-xs text-red-600 mt-1">
                      <div>{result.message}</div>
                      {result.needsRefresh && (
                        <div className="mt-1 text-yellow-700">
                          Your authentication token may have expired. Try refreshing your session.
                        </div>
                      )}
                      {name === 'Token Status' && result.tokenPreview && (
                        <div className="mt-1 font-mono">{result.tokenPreview}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const VolunteerProfile = () => {
  const { user, token, refreshUserData, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [formModified, setFormModified] = useState(false);

  // Form state for editable fields
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    profileInfo: {
      bio: '',
      experience: 'Beginner',
      education: '',
      occupation: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    interests: [],
    skills: [],
    availability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    },
    preferredLocations: [],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    // Added fields from onboarding
    maxDistance: 10,
    hasDriverLicense: false,
    hasVehicle: false,
    hasCriminalRecord: false,
    criminalRecordDetails: '',
    volunteerHours: 0
  });

  // Available interests and skills for selection
  const interestOptions = [
    'Environment',
    'Education',
    'Community Service',
    'Animal Welfare',
    'Healthcare',
    'Disaster Relief',
    'Food Security',
    'Homelessness',
    'Elderly Care',
    'Children & Youth',
    'Arts & Culture',
    'Sports & Recreation',
    'Mental Health',
    'Disability Support',
    'Veteran Support'
  ];
  
  const skillOptions = [
    'Customer Service',
    'Manual Labor',
    'Teaching/Education',
    'Gardening',
    'Administration',
    'Technology',
    'Cooking',
    'Healthcare',
    'Communication',
    'Organization',
    'Compassion',
    'Driving',
    'Environmental Knowledge',
    'Patience',
    'Leadership',
    'Fundraising',
    'Social Media',
    'Photography',
    'Writing',
    'Event Planning'
  ];
  
  // Common locations for volunteers
  const commonLocations = [
    'Downtown',
    'North Side',
    'South Side',
    'East Side',
    'West Side',
    'Suburb',
    'City Center',
    'Rural Areas',
    'Schools',
    'Community Centers',
    'Religious Centers',
    'Parks',
    'Hospitals',
    'Shelters',
    'Food Banks'
  ];
  
  // Time slots for availability
  const timeSlots = [
    'Morning (8am-12pm)',
    'Afternoon (12pm-5pm)',
    'Evening (5pm-9pm)'
  ];

  // Add axios config check
  useEffect(() => {
    // Check if axios is properly configured
    if (!axios.defaults.baseURL) {
      axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      console.log('Set axios default baseURL:', axios.defaults.baseURL);
    }
  }, []);

  useEffect(() => {
    // Fetch fresh data directly from the API
    const loadProfileData = async () => {
      if (user && token) {
        try {
          await fetchUserProfile();
        } catch (error) {
          console.error("Error initializing profile:", error);
          toast.error("Could not load profile data. Please refresh and try again.");
        }
      } else {
        toast.warning("Authentication required. Please log in again.");
        setLoading(false);
      }
    };
    
    loadProfileData();
  }, [user, token, refreshUserData]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userId = user?.id || user?._id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Debug information
      console.log('=== PROFILE DEBUGGING ===');
      console.log('API Base URL:', apiBaseUrl);
      console.log('User ID:', userId);
      console.log('User object:', user);
      
      // Initialize with basic structure
      let profileData = {
        personalInfo: {
          name: '',
          email: '',
          phone: ''
        },
        profileInfo: {
          bio: '',
          education: '',
          experience: 'Beginner',
          occupation: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          }
        },
        skills: [],
        interests: [],
        availability: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: []
        },
        volunteerHours: 0,
        preferredLocations: [],
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        maxDistance: 10,
        hasDriverLicense: false,
        hasVehicle: false,
        hasCriminalRecord: false,
        criminalRecordDetails: ''
      };
      
      // Direct API call to profile endpoint - now using just one endpoint
      try {
        console.log('Fetching user profile data...');
        // Use the volunteer profile endpoint
        const response = await axios.get(`${apiBaseUrl}/api/volunteers/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          console.log('Profile data fetched successfully');
          
          // Simplified data handling - no need to check for nested structures
          const userData = response.data.data || response.data;
          
          if (userData) {
            // Map API user fields directly to our form structure
            profileData = {
              personalInfo: {
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phoneNumber || ''
              },
              profileInfo: {
                bio: userData.bio || '',
                education: userData.education || '',
                experience: userData.experience || 'Beginner',
                occupation: userData.occupation || '',
                address: userData.address || {
                  street: '',
                  city: '',
                  state: '',
                  zipCode: ''
                }
              },
              skills: Array.isArray(userData.skills) ? userData.skills : [],
              interests: Array.isArray(userData.interests) ? userData.interests : [],
              availability: userData.availability || {
                monday: [],
                tuesday: [],
                wednesday: [],
                thursday: [],
                friday: [],
                saturday: [],
                sunday: []
              },
              volunteerHours: userData.totalHours || 0, // Note: renamed from volunteerHours to totalHours in User model
              preferredLocations: Array.isArray(userData.preferredLocations) ? userData.preferredLocations : [],
              emergencyContact: userData.emergencyContact || {
                name: '',
                relationship: '',
                phone: ''
              },
              maxDistance: userData.maxDistance || 10,
              hasDriverLicense: userData.hasDriverLicense !== undefined ? userData.hasDriverLicense : false,
              hasVehicle: userData.hasVehicle !== undefined ? userData.hasVehicle : false,
              hasCriminalRecord: userData.hasCriminalRecord !== undefined ? userData.hasCriminalRecord : false,
              criminalRecordDetails: userData.criminalRecordDetails || ''
            };
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error.message);
        
        // Show specific error message based on response
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            toast.error('Authentication error. Please try logging in again.');
          } else if (error.response.status === 404) {
            // Profile not found - ask user if they want to create a volunteer profile
            toast.info('No volunteer profile found. Creating one for you...');
            
            // Try to create a volunteer profile automatically
            const created = await createVolunteerProfile();
            if (created) {
              // Profile created successfully and fetchUserProfile will be called again
              return; // Exit the current function since we'll fetch the profile again
            }
          } else if (error.response.data && error.response.data.message) {
            toast.error(`Error: ${error.response.data.message}`);
          } else {
            toast.error(`Server error (${error.response.status}). Please try again later.`);
          }
        } else if (error.request) {
          // Request made but no response received
          toast.error('No response from server. Please check your connection.');
        } else {
          // Other errors
          toast.error(`Error: ${error.message}`);
        }
        
        // Use auth data for minimal profile when API fails
        if (user) {
          profileData.personalInfo.name = user.name || '';
          profileData.personalInfo.email = user.email || '';
          profileData.personalInfo.phone = user.phoneNumber || '';
        }
      }
      
      // Ensure required fields have at least some value
      ensureRequiredFields(profileData);
      
      // Set form data and backup data
      setFormData(profileData);
      setOriginalData(JSON.parse(JSON.stringify(profileData)));
      setFormModified(false);
      setUserProfile(profileData);
    } catch (error) {
      console.error('Error in profile processing:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to ensure required fields exist
  const ensureRequiredFields = (profileData) => {
    // Make sure the profile has at least some data in important fields
    if (!profileData.personalInfo.name && user?.name) {
      profileData.personalInfo.name = user.name;
    }
    
    if (!profileData.personalInfo.email && user?.email) {
      profileData.personalInfo.email = user.email;
    }
    
    // Make sure availability has all days initialized
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
      if (!profileData.availability[day]) {
        profileData.availability[day] = [];
      }
    });
    
    // Ensure experience level exists
    if (!profileData.profileInfo.experience) {
      profileData.profileInfo.experience = 'Beginner';
    }
  };

  const handleChange = (section, field, value) => {
    setFormModified(true);
    
    if (section === 'skills' || section === 'interests' || section === 'preferredLocations') {
      setFormData(prev => {
        const newArray = value 
          ? [...prev[section], field] 
          : prev[section].filter(item => item !== field);
        return { ...prev, [section]: newArray };
      });
      return;
    }
    
    if (section === 'availability') {
      const [day, timeSlot] = field.split('.');
      setFormData(prev => {
        const availabilityForDay = [...prev.availability[day]];
        
        if (value) {
          if (!availabilityForDay.includes(timeSlot)) {
            availabilityForDay.push(timeSlot);
          }
        } else {
          const index = availabilityForDay.indexOf(timeSlot);
          if (index !== -1) {
            availabilityForDay.splice(index, 1);
          }
        }
        
        return {
          ...prev,
          availability: {
            ...prev.availability,
            [day]: availabilityForDay
          }
        };
      });
      return;
    }
    
    if (field) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const userId = user?.id || user?._id;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // Simplified - no need to split data between different endpoints
      // All volunteer data is sent to a single endpoint
      const profileData = {
        // Personal info
        name: formData.personalInfo.name,
        phoneNumber: formData.personalInfo.phone,
        
        // Profile info
        bio: formData.profileInfo.bio,
        education: formData.profileInfo.education,
        occupation: formData.profileInfo.occupation,
        experience: formData.profileInfo.experience,
        address: formData.profileInfo.address,
        
        // Other volunteer fields
        skills: formData.skills,
        interests: formData.interests,
        preferredLocations: formData.preferredLocations,
        availability: formData.availability,
        emergencyContact: formData.emergencyContact,
        maxDistance: formData.maxDistance,
        hasDriverLicense: formData.hasDriverLicense,
        hasVehicle: formData.hasVehicle,
        hasCriminalRecord: formData.hasCriminalRecord,
        criminalRecordDetails: formData.criminalRecordDetails
      };
      
      console.log('Submitting profile data:', profileData);
      
      // Single API call to update profile
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.put(
        `${apiBaseUrl}/api/volunteers/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Profile update response:', response.data);
      
      // Update auth store with user data if needed
      if (response.data && response.data.data) {
        updateUser({
          name: response.data.data.name,
          phoneNumber: response.data.data.phoneNumber,
          role: 'volunteer'
        });
      }
      
      toast.success('Profile updated successfully');
      
      // Refresh profile data
      await fetchUserProfile();
      setFormModified(false);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.response) {
        toast.error(error.response.data?.message || 'Failed to update profile. Please try again.');
      } else {
        toast.error('Network error. Please check your connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    // Reset any changes by fetching the profile again
    fetchUserProfile();
    setEditMode(false);
  };

  const formatHours = () => {
    if (!userProfile) return "0";
    return userProfile.volunteerHours?.toString() || "0";
  };

  // Test API function - update to reflect single User model
  const testAPIDirectly = async () => {
    setLoading(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const userId = user?.id || user?._id;
      
      console.log("=== Manual API Testing ===");
      console.log("API Base URL:", apiBaseUrl);
      console.log("User ID:", userId);
      console.log("Token available:", !!token);
      console.log("Token preview:", token ? `${token.substring(0, 15)}...` : 'No token');
      
      // First check token validity
      let tokenExpired = false;
      
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const expiry = payload.exp;
            
            if (expiry && expiry * 1000 < Date.now()) {
              tokenExpired = true;
              console.log("⚠️ Token appears to be expired");
              toast.warning("Your authentication token appears to be expired");
            }
          }
        } catch (error) {
          console.log("⚠️ Could not validate token format");
        }
      }
      
      // Test volunteer profile endpoint - now just using the user model with role filter
      try {
        const volunteerResponse = await axios.get(`${apiBaseUrl}/api/volunteers/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Volunteer profile endpoint:", volunteerResponse.data);
        toast.success("Volunteer profile endpoint works!");
      } catch (error) {
        console.error("❌ Volunteer profile error:", error.message);
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Response:", error.response.data);
          
          if (error.response.status === 401 || error.response.status === 403) {
            toast.error(`Volunteer profile endpoint failed: Authentication error`);
            if (!tokenExpired) {
              toast.info("Try refreshing your session data");
            }
          } else if (error.response.status === 404) {
            toast.error(`Volunteer profile not found. You may need to complete registration.`);
          } else {
            toast.error(`Volunteer profile endpoint failed: ${error.message}`);
          }
        } else {
          toast.error(`Volunteer profile endpoint failed: ${error.message}`);
        }
      }
      
      // Test user endpoint
      try {
        const userResponse = await axios.get(`${apiBaseUrl}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ User endpoint:", userResponse.data);
        toast.success("User endpoint works!");
      } catch (error) {
        console.error("❌ User endpoint error:", error.message);
        if (error.response) {
          console.error("Status:", error.response.status);
          console.error("Response:", error.response.data);
          
          if (error.response.status === 401 || error.response.status === 403) {
            toast.error(`User endpoint failed: Authentication error`);
            if (!tokenExpired) {
              toast.info("Try refreshing your session data");
            }
          } else {
            toast.error(`User endpoint failed: ${error.message}`);
          }
        } else {
          toast.error(`User endpoint failed: ${error.message}`);
        }
      }
      
      if (tokenExpired) {
        toast.info("Attempting to refresh your authentication...");
        refreshUserData();
      }
      
    } catch (error) {
      console.error("Test failed:", error);
      toast.error("API test failed");
    } finally {
      setLoading(false);
    }
  };

  // Add function to create a volunteer profile if one doesn't exist
  const createVolunteerProfile = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Basic volunteer profile data with current user info
      const initialProfileData = {
        // Ensure the role is set to volunteer
        role: 'volunteer',
        // Add any available data from auth store
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        // Add empty arrays for required fields
        skills: [],
        interests: [],
        preferredLocations: [],
        // Set defaults
        experience: 'Beginner',
        availability: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: []
        }
      };
      
      // Call the create profile endpoint
      const response = await axios.post(
        `${apiBaseUrl}/api/volunteers/profile`,
        initialProfileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Volunteer profile created:', response.data);
      toast.success('Volunteer profile created! You can now update your details.');
      
      // Fetch the newly created profile
      await fetchUserProfile();
      return true;
    } catch (error) {
      console.error('Error creating volunteer profile:', error);
      toast.error('Failed to create volunteer profile. Please try again later.');
      setLoading(false);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Volunteer Profile</h1>
        
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" color="indigo" message="Loading your profile..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Volunteer Profile</h1>
      
      {/* Add API Test Button at the top */}
      <div className="mb-4 bg-white shadow-sm rounded-lg p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">API Connection Status</h2>
          <p className="text-sm text-gray-600">Test your connection to the server</p>
        </div>
        <button
          onClick={testAPIDirectly}
          disabled={loading}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center"
        >
          <FiDatabase className="mr-2" /> Test API Connection
        </button>
      </div>
      
      {/* Include the API Tester component with refresh capability */}
      <ApiTester token={token} userId={user?.id || user?._id} refreshUserData={refreshUserData} />
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        {/* Profile Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Volunteer Profile</h2>
            <p className="text-gray-600">Manage your volunteer information</p>
          </div>
          <div className="flex items-center">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                <FiEdit2 className="mr-2" /> Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={cancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
                >
                  {saving ? <LoadingSpinner size="small" /> : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Volunteer Stats */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="text-center w-full">
              <p className="text-sm text-gray-600">Total Volunteer Hours</p>
              <p className="text-2xl font-bold text-blue-600">{formatHours()}</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.personalInfo?.name || ''}
                    onChange={(e) => handleChange('personalInfo', 'name', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.personalInfo?.name || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email Address</label>
                {editMode ? (
                  <input
                    type="email"
                    value={formData.personalInfo?.email || ''}
                    onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.personalInfo?.email || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.personalInfo?.phone || ''}
                    onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.personalInfo?.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Profile Details</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Bio</label>
              {editMode ? (
                <textarea
                  value={formData.profileInfo?.bio || ''}
                  onChange={(e) => handleChange('profileInfo', 'bio', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{formData.profileInfo?.bio || 'No bio provided'}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Education</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.profileInfo?.education || ''}
                    onChange={(e) => handleChange('profileInfo', 'education', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.profileInfo?.education || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Experience Level</label>
                {editMode ? (
                  <select
                    value={formData.profileInfo?.experience || 'Beginner'}
                    onChange={(e) => handleChange('profileInfo', 'experience', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.profileInfo?.experience || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Occupation</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.profileInfo?.occupation || ''}
                    onChange={(e) => handleChange('profileInfo', 'occupation', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.profileInfo?.occupation || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Street Address</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.profileInfo?.address.street || ''}
                    onChange={(e) => handleChange('profileInfo', 'address', {
                      ...formData.profileInfo.address,
                      street: e.target.value
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.profileInfo?.address.street || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">City</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.profileInfo?.address.city || ''}
                    onChange={(e) => handleChange('profileInfo', 'address', {
                      ...formData.profileInfo.address,
                      city: e.target.value
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.profileInfo?.address.city || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">State</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.profileInfo?.address.state || ''}
                    onChange={(e) => handleChange('profileInfo', 'address', {
                      ...formData.profileInfo.address,
                      state: e.target.value
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.profileInfo?.address.state || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">ZIP Code</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.profileInfo?.address.zipCode || ''}
                    onChange={(e) => handleChange('profileInfo', 'address', {
                      ...formData.profileInfo.address,
                      zipCode: e.target.value
                    })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.profileInfo?.address.zipCode || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Interests and Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Areas of Interest</h3>
              {editMode ? (
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map(interest => (
                    <div key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`interest-${interest}`}
                        checked={formData.interests.includes(interest)}
                        onChange={(e) => handleChange('interests', interest, e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`interest-${interest}`}>{interest}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.length > 0 ? (
                    formData.interests.map(interest => (
                      <span key={interest} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No interests selected</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Skills</h3>
              {editMode ? (
                <div className="grid grid-cols-2 gap-2">
                  {skillOptions.map(skill => (
                    <div key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`skill-${skill}`}
                        checked={formData.skills.includes(skill)}
                        onChange={(e) => handleChange('skills', skill, e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`skill-${skill}`}>{skill}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length > 0 ? (
                    formData.skills.map(skill => (
                      <span key={skill} className="bg-green-100 text-green-800 px-3 py-1 rounded">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills selected</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Availability</h3>
            {editMode ? (
              <div className="grid grid-cols-7 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="border rounded p-3">
                    <h4 className="font-medium mb-2 capitalize">{day}</h4>
                    {timeSlots.map(slot => (
                      <div key={`${day}-${slot}`} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`${day}-${slot}`}
                          checked={formData.availability[day].includes(slot)}
                          onChange={(e) => handleChange('availability', `${day}.${slot}`, e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor={`${day}-${slot}`} className="text-sm">{slot}</label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2 text-sm">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="border rounded p-3">
                    <h4 className="font-medium mb-2 capitalize">{day}</h4>
                    {formData.availability[day].length > 0 ? (
                      formData.availability[day].map(slot => (
                        <div key={`${day}-${slot}`} className="mb-1 text-blue-600">
                          {slot}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">Not available</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preferred Locations */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Preferred Locations</h3>
            {editMode ? (
              <div className="grid grid-cols-3 gap-2">
                {commonLocations.map(location => (
                  <div key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`location-${location}`}
                      checked={formData.preferredLocations.includes(location)}
                      onChange={() => handleChange('preferredLocations', location)}
                      className="mr-2"
                    />
                    <label htmlFor={`location-${location}`}>{location}</label>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.preferredLocations.length > 0 ? (
                  formData.preferredLocations.map(location => (
                    <span key={location} className="bg-purple-100 text-purple-800 px-3 py-1 rounded">
                      {location}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No preferred locations selected</p>
                )}
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Contact Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleChange('emergencyContact', 'name', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.emergencyContact.name || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Relationship</label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleChange('emergencyContact', 'relationship', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.emergencyContact.relationship || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => handleChange('emergencyContact', 'phone', e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{formData.emergencyContact.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Preferences & Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Additional Preferences & Information</h3>
            
            {/* Maximum Distance */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Maximum Distance Willing to Travel (miles)</label>
              {editMode ? (
                <div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={formData.maxDistance}
                    onChange={(e) => handleChange('maxDistance', '', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 px-2 mt-1">
                    <span>5 miles</span>
                    <span>{formData.maxDistance} miles</span>
                    <span>50 miles</span>
                  </div>
                </div>
              ) : (
                <p className="p-2 bg-gray-50 rounded">{formData.maxDistance} miles</p>
              )}
            </div>
            
            {/* Transportation Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Driver's License</label>
                {editMode ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasDriverLicense"
                      checked={formData.hasDriverLicense}
                      onChange={(e) => handleChange('hasDriverLicense', '', e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="hasDriverLicense">I have a valid driver's license</label>
                  </div>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    {formData.hasDriverLicense ? 'Yes' : 'No'}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Vehicle Access</label>
                {editMode ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasVehicle"
                      checked={formData.hasVehicle}
                      onChange={(e) => handleChange('hasVehicle', '', e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="hasVehicle">I have access to a vehicle</label>
                  </div>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    {formData.hasVehicle ? 'Yes' : 'No'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Background Information */}
            <div className={formData.hasCriminalRecord ? "bg-yellow-50 p-4 rounded-md border border-yellow-200" : ""}>
              <div className="mb-3">
                <label className="block text-gray-700 mb-2">Background Information</label>
                {editMode ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hasCriminalRecord"
                      checked={formData.hasCriminalRecord}
                      onChange={(e) => handleChange('hasCriminalRecord', '', e.target.checked)}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="hasCriminalRecord">I have a criminal record</label>
                  </div>
                ) : (
                  <p className="p-2 bg-gray-50 rounded">
                    {formData.hasCriminalRecord ? 'Yes' : 'No'}
                  </p>
                )}
              </div>
              
              {(formData.hasCriminalRecord || formData.criminalRecordDetails) && (
                <div>
                  <label className="block text-gray-700 mb-2">Criminal Record Details</label>
                  {editMode ? (
                    <textarea
                      value={formData.criminalRecordDetails}
                      onChange={(e) => handleChange('criminalRecordDetails', '', e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded">
                      {formData.criminalRecordDetails || 'No details provided'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    This information is kept confidential and only shared with organizations when required by law.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VolunteerProfile; 





