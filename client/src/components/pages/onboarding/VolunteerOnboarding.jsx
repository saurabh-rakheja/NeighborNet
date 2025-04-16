import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../../../store/authStore';
import useUserStore from '../../../store/slices/userStore';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiInfo,
  FiLoader,
  FiPlus,
  FiMinus,
  FiClock,
  FiMap,
  FiArrowLeft,
  FiArrowRight,
  FiSave
} from 'react-icons/fi';

const VolunteerOnboarding = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, refreshUserData } = useAuthStore();
  const { profile, fetchProfile, isLoading: profileLoading } = useUserStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const hasInitialized = useRef(false);
  
  // Set initial form data
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    dateOfBirth: '',
    
    // Profile information
    bio: '',
    education: '',
    occupation: '',
    experience: 'Beginner', // Default to Beginner
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    
    // Skills & Interests
    skills: [],
    interests: [],
    
    // Availability and preferences
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
    maxDistance: 15,
    
    // Additional information
    hasDriverLicense: false,
    hasVehicle: false,
    hasCriminalRecord: false,
    criminalRecordDetails: '',
    additionalInfo: ''
  });
  
  // Fetch user data when component mounts
  useEffect(() => {
    // Skip data fetching if we've already loaded it
    if (hasInitialized.current) {
      return;
    }
    
    // Mark as initialized to prevent future fetches
    hasInitialized.current = true;
    
    const fetchUserData = async () => {
      try {
        // Simple check for existing user data - only fetch if needed
        if (user) {
          // Use existing user data
          const updatedFormData = {
            name: user.name || '',
            phone: user.profile?.phoneNumber || '',
            address: user.profile?.address?.street || '',
            city: user.profile?.address?.city || '',
            state: user.profile?.address?.state || '',
            zipCode: user.profile?.address?.zipCode || '',
            country: user.profile?.address?.country || 'India',
            dateOfBirth: user.volunteerInfo?.dateOfBirth || '',
            bio: user.profile?.bio || '',
            education: user.volunteerInfo?.education || '',
            occupation: user.volunteerInfo?.occupation || '',
            experience: user.volunteerInfo?.experience || 'Beginner',
            emergencyContact: user.volunteerInfo?.emergencyContact || {
              name: '',
              relationship: '',
              phone: ''
            },
            skills: user.volunteerInfo?.skills || [],
            interests: user.volunteerInfo?.interests || [],
            availability: user.volunteerInfo?.availability || {
              monday: [],
              tuesday: [],
              wednesday: [],
              thursday: [],
              friday: [],
              saturday: [],
              sunday: []
            },
            preferredLocations: user.volunteerInfo?.preferredLocations || [],
            maxDistance: user.volunteerInfo?.maxDistance || 15,
            hasDriverLicense: user.volunteerInfo?.hasDriverLicense || false,
            hasVehicle: user.volunteerInfo?.hasVehicle || false,
            hasCriminalRecord: false,
            criminalRecordDetails: '',
            additionalInfo: user.volunteerInfo?.additionalInfo || ''
          };
          
          setFormData(updatedFormData);
        }
      } catch (error) {
        console.error('Error initializing form data:', error);
        // Continue with default form values
      }
    };
    
    fetchUserData();
  // Only run once on mount  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const totalSteps = 5;
  
  // Available skills options
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
  
  // Interest categories
  const interestCategories = [
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
  
  // Time slots for availability
  const timeSlots = [
    'Morning (8am-12pm)',
    'Afternoon (12pm-5pm)',
    'Evening (5pm-9pm)'
  ];
  
  // Common location types
  const commonLocations = [
    'Downtown',
    'City Parks',
    'Schools',
    'Community Centers',
    'Soup Kitchens',
    'Shelters',
    'Hospitals',
    'Retirement Homes',
    'Libraries',
    'Beaches/Waterfront',
    'Suburban Areas'
  ];
  
  // Handle standard form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Handle skills selection
  const handleSkillToggle = (skill) => {
    if (formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: formData.skills.filter(s => s !== skill)
      });
    } else {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill]
      });
    }
  };
  
  // Handle interests selection
  const handleInterestToggle = (interest) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interest)
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
    }
  };
  
  // Handle availability selection
  const handleAvailabilityToggle = (day, timeSlot) => {
    const currentDayAvailability = formData.availability[day];
    
    if (currentDayAvailability.includes(timeSlot)) {
      setFormData({
        ...formData,
        availability: {
          ...formData.availability,
          [day]: currentDayAvailability.filter(t => t !== timeSlot)
        }
      });
    } else {
      setFormData({
        ...formData,
        availability: {
          ...formData.availability,
          [day]: [...currentDayAvailability, timeSlot]
        }
      });
    }
  };
  
  // Handle preferred locations
  const handleLocationToggle = (location) => {
    if (formData.preferredLocations.includes(location)) {
      setFormData({
        ...formData,
        preferredLocations: formData.preferredLocations.filter(l => l !== location)
      });
    } else {
      setFormData({
        ...formData,
        preferredLocations: [...formData.preferredLocations, location]
      });
    }
  };
  
  // Validate current step before proceeding
  const validateStep = () => {
    let isValid = true;
    let errorMessage = '';
    
    // Validation for Step 1: Personal Information
    if (currentStep === 1) {
      if (!formData.name) {
        isValid = false;
        errorMessage = 'Name is required';
      } else if (!formData.phone) {
        isValid = false;
        errorMessage = 'Phone number is required';
      }
    }
    
    // Validation for Step 2: Profile Information
    else if (currentStep === 2) {
      if (!formData.emergencyContact.name) {
        isValid = false;
        errorMessage = 'Emergency contact name is required';
      } else if (!formData.emergencyContact.phone) {
        isValid = false;
        errorMessage = 'Emergency contact phone is required';
      } else if (!formData.emergencyContact.relationship) {
        isValid = false;
        errorMessage = 'Relationship to emergency contact is required';
      }
    }
    
    // Validation for Step 3: Skills & Interests
    else if (currentStep === 3) {
      if (formData.skills.length === 0) {
        isValid = false;
        errorMessage = 'Please select at least one skill';
      } else if (formData.interests.length === 0) {
        isValid = false;
        errorMessage = 'Please select at least one interest area';
      }
    }
    
    // Step 4 and 5 don't need strict validation
    
    if (!isValid) {
      toast.error(errorMessage);
    }
    
    return isValid;
  };
  
  // Validate entire form before final submission
  const validateEntireForm = () => {
    // Required fields across all steps
    if (!formData.name || !formData.phone) {
      toast.error('Personal information is incomplete');
      setCurrentStep(1); // Go back to step 1
      return false;
    }
    
    if (!formData.emergencyContact.name || !formData.emergencyContact.phone) {
      toast.error('Emergency contact information is incomplete');
      setCurrentStep(2); // Go back to step 2
      return false;
    }
    
    if (formData.skills.length === 0 || formData.interests.length === 0) {
      toast.error('Skills and interests information is incomplete');
      setCurrentStep(3); // Go back to step 3
      return false;
    }
    
    return true;
  };
  
  // Navigate to next step
  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(prevStep => Math.min(prevStep + 1, totalSteps));
    }
  };
  
  // Navigate to previous step
  const handlePreviousStep = () => {
    setCurrentStep(prevStep => Math.max(prevStep - 1, 1));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep < totalSteps) {
      handleNextStep();
      return;
    }
    
    // Validate the entire form before submission
    if (!validateEntireForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Format data for API submission
      const formattedData = {
        name: formData.name,
        profile: {
          phoneNumber: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          bio: formData.bio
        },
        volunteerInfo: {
          dateOfBirth: formData.dateOfBirth,
          education: formData.education,
          occupation: formData.occupation,
          experience: formData.experience,
          emergencyContact: formData.emergencyContact,
          skills: formData.skills,
          interests: formData.interests,
          availability: formData.availability,
          preferredLocations: formData.preferredLocations,
          maxDistance: Number(formData.maxDistance),
          hasDriverLicense: formData.hasDriverLicense,
          hasVehicle: formData.hasVehicle,
          hasCriminalRecord: formData.hasCriminalRecord,
          criminalRecordDetails: formData.criminalRecordDetails,
          additionalInfo: formData.additionalInfo
        }
      };
      
      // Submit the data
      const result = await updateUserProfile(formattedData);
      
      if (result && result.success) {
        // Show success message
        toast.success('Onboarding completed successfully!');
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        console.error('Profile update failed:', result);
        
        // Show more descriptive error message
        const errorMsg = result?.message || 'Profile update failed. Please check your information and try again.';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Extract the most useful error message
      let errorMsg = 'Unable to submit your profile. ';
      
      if (error.response) {
        // Server responded with error
        if (error.response.data && error.response.data.message) {
          errorMsg += error.response.data.message;
        } else {
          errorMsg += `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // No response received
        errorMsg += 'No response from server. Please check your internet connection.';
      } else {
        // Other error
        errorMsg += error.message || 'Unknown error occurred.';
      }
      
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Step indicator
  const StepIndicator = () => {
    return (
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute h-1 bg-gray-200 top-1/2 transform -translate-y-1/2 left-0 right-0 z-0"></div>
        
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
          <div 
            key={step} 
            className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
              step < currentStep 
                ? 'bg-green-500 text-white'
                : step === currentStep
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border-2 border-gray-300 text-gray-500'
            }`}
          >
            {step < currentStep ? (
              <FiCheckCircle className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{step}</span>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Step title and description
  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Personal Information",
          subtitle: "Let's start with your basic information"
        };
      case 2:
        return {
          title: "Profile Details",
          subtitle: "Tell us more about yourself"
        };
      case 3:
        return {
          title: "Skills & Interests",
          subtitle: "What are you good at and what causes do you care about?"
        };
      case 4:
        return {
          title: "Availability & Preferences",
          subtitle: "When and where can you volunteer?"
        };
      case 5:
        return {
          title: "Additional Information",
          subtitle: "Just a few more details to complete your profile"
        };
      default:
        return { title: "", subtitle: "" };
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Volunteer Profile</h1>
        <p className="mt-2 text-lg text-gray-600">
          Help us match you with the perfect volunteering opportunities
        </p>
      </div>
      
      {fetchError && (
        <div className="bg-yellow-50 p-4 border-l-4 border-yellow-500 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiInfo className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {fetchError} <span className="font-medium">You can still proceed with the form.</span>
                {fetchError.includes('login') && (
                  <span className="ml-2">
                    <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-500">
                      Login here
                    </Link>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-8">
        {/* Step indicator */}
        <StepIndicator />
        
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{getStepContent().title}</h2>
          <p className="mt-1 text-sm text-gray-600">{getStepContent().subtitle}</p>
        </div>
        
        <div className="p-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="flex items-center">
                  <FiUser className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => {
                      handleChange(e);
                      console.log('Name field changed to:', e.target.value);
                    }}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex items-center">
                  <FiPhone className="text-gray-400 mr-2" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="flex items-center">
                  <FiCalendar className="text-gray-400 mr-2" />
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <div className="flex items-center">
                  <FiMapPin className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Step 2: Profile Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (Tell us about yourself)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share a bit about yourself, your motivations for volunteering, and any relevant experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
                <p className="mt-1 text-sm text-gray-500">
                  This helps organizations get to know you better.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                    Education (Optional)
                  </label>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="Highest level of education or degree"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Volunteering Experience Level
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner - Little to no prior volunteering experience</option>
                    <option value="Intermediate">Intermediate - Some volunteering experience</option>
                    <option value="Expert">Expert - Extensive volunteering experience</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    This helps match you with appropriate opportunities.
                  </p>
                </div>
                
                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation (Optional)
                  </label>
                  <input
                    type="text"
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    placeholder="Current job or profession"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-md p-4 border border-blue-100">
                <h3 className="text-md font-medium text-blue-800 mb-2 flex items-center">
                  <FiInfo className="mr-2" />
                  Emergency Contact Information
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  This information will only be used in case of emergency.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      id="emergencyContact.name"
                      name="emergencyContact.name"
                      value={formData.emergencyContact.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      id="emergencyContact.relationship"
                      name="emergencyContact.relationship"
                      value={formData.emergencyContact.relationship}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="emergencyContact.phone"
                      name="emergencyContact.phone"
                      value={formData.emergencyContact.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Skills & Interests */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiInfo className="mr-1" />
                  Skills & Abilities
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Select all the skills you have that might be useful for volunteering.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        formData.skills.includes(skill)
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Causes & Interests
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Select the causes you're most passionate about. This helps us match you with relevant opportunities.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {interestCategories.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        formData.interests.includes(interest)
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Availability & Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiClock className="mr-1" />
                  Availability
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Select the times you're typically available to volunteer. This helps organizations find suitable shifts for you.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded-md">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Day
                        </th>
                        {timeSlots.map(slot => (
                          <th key={slot} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            {slot}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.keys(formData.availability).map(day => (
                        <tr key={day} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700 border-r">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </td>
                          {timeSlots.map(slot => (
                            <td key={`${day}-${slot}`} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border-r">
                              <button
                                type="button"
                                onClick={() => handleAvailabilityToggle(day, slot)}
                                className={`w-6 h-6 rounded-full ${
                                  formData.availability[day].includes(slot)
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                } flex items-center justify-center focus:outline-none`}
                              >
                                {formData.availability[day].includes(slot) ? '✓' : ''}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FiMapPin className="mr-1" />
                  Preferred Locations
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Select the areas where you prefer to volunteer.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {commonLocations.map(location => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => handleLocationToggle(location)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        formData.preferredLocations.includes(location)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="maxDistance" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Distance Willing to Travel (miles)
                </label>
                <input
                  type="range"
                  id="maxDistance"
                  name="maxDistance"
                  min="5"
                  max="50"
                  step="5"
                  value={formData.maxDistance}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 px-2">
                  <span>5 miles</span>
                  <span>{formData.maxDistance} miles</span>
                  <span>50 miles</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 5: Additional Information */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="hasDriverLicense"
                      name="hasDriverLicense"
                      type="checkbox"
                      checked={formData.hasDriverLicense}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="hasDriverLicense" className="font-medium text-gray-700">
                      I have a valid driver's license
                    </label>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="hasVehicle"
                      name="hasVehicle"
                      type="checkbox"
                      checked={formData.hasVehicle}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="hasVehicle" className="font-medium text-gray-700">
                      I have access to a vehicle
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-md p-4 border border-yellow-100">
                <h3 className="text-md font-medium text-yellow-800 mb-2 flex items-center">
                  <FiInfo className="mr-2" />
                  Background Information
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Some volunteer opportunities may require background checks, particularly when working with vulnerable populations.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="hasCriminalRecord"
                        name="hasCriminalRecord"
                        type="checkbox"
                        checked={formData.hasCriminalRecord}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="hasCriminalRecord" className="font-medium text-gray-700">
                        I have a criminal record
                      </label>
                      <p className="text-gray-500">
                        Having a criminal record doesn't automatically disqualify you from volunteering.
                      </p>
                    </div>
                  </div>
                  
                  {formData.hasCriminalRecord && (
                    <div>
                      <label htmlFor="criminalRecordDetails" className="block text-sm font-medium text-gray-700 mb-1">
                        Please provide details
                      </label>
                      <textarea
                        id="criminalRecordDetails"
                        name="criminalRecordDetails"
                        rows="3"
                        value={formData.criminalRecordDetails}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Information (Optional)
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows="3"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Any other details you'd like to share..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
          <button
            type="button"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiArrowLeft className="mr-2" /> Previous
          </button>
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next <FiArrowRight className="ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" /> Complete Profile
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VolunteerOnboarding; 