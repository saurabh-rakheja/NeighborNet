import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../../../store/authStore";
import useUserStore from "../../../../store/slices/userStore";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit,
  FiCalendar,
  FiAward,
  FiHeart,
  FiStar,
  FiSave,
  FiX,
  FiPlus,
  FiTrash2,
  FiClock,
  FiBarChart2,
  FiChevronDown,
} from "react-icons/fi";
import { toast } from "react-toastify";

// Create API instance with auth token
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Predefined lists of common skills and interests
const COMMON_SKILLS = [
  "Communication",
  "Leadership",
  "Event Planning",
  "Social Media",
  "Teaching",
  "Customer Service",
  "First Aid",
  "Food Preparation",
  "Administrative",
  "Tutoring",
  "Crisis Management",
  "Fundraising",
  "Public Speaking",
  "Gardening",
  "Animal Care",
  "Counseling",
  "Computer Skills",
  "Graphic Design",
  "Writing",
  "Photography",
  "Translation",
  "Project Management",
  "Marketing",
  "Web Development",
  "Research",
];

const COMMON_INTERESTS = [
  "Environmental Conservation",
  "Animal Welfare",
  "Education",
  "Poverty Alleviation",
  "Healthcare",
  "Disaster Relief",
  "Human Rights",
  "Children & Youth",
  "Senior Care",
  "Disability Support",
  "Homelessness",
  "Mental Health",
  "Arts & Culture",
  "Community Development",
  "Sports & Recreation",
  "Veterans Services",
  "Food Security",
  "Refugee Support",
  "Women's Empowerment",
  "LGBTQ+ Support",
  "Literacy",
  "Technology Access",
  "Politics & Advocacy",
  "Religious Activities",
  "History & Preservation",
];

const VolunteerProfile = () => {
  const { user } = useAuthStore();
  const {
    profile,
    skills,
    interests,
    fetchProfile,
    fetchSkills,
    fetchInterests,
    updateProfile,
    updateSkills,
    updateInterests,
  } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    bio: "",
    birthdate: "",
    // Volunteer specific fields
    availability: {},
    skills: [],
    interests: [],
    preferredLocations: [],
    experience: "Beginner",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    education: "",
    occupation: "",
    maxDistance: 15,
    hasDriverLicense: false,
    hasVehicle: false,
    hasCriminalRecord: false,
    criminalRecordDetails: "",
    additionalInfo: "",
    totalHours: 0,
    // NGO specific fields
    organization: "",
    organizationDescription: "",
    organizationWebsite: "",
    organizationMission: "",
    organizationFoundedYear: "",
    organizationSize: "",
    organizationRegistrationNumber: "",
    organizationTaxId: "",
    organizationLogo: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // State for dropdowns
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedInterest, setSelectedInterest] = useState("");
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [interestDropdownOpen, setInterestDropdownOpen] = useState(false);
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false);
  const [showCustomInterestInput, setShowCustomInterestInput] = useState(false);

  // Fetch user data directly from the API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch complete user profile from the API
        const response = await api.get("/users/profile");

        if (response.data.success) {
          const userData = response.data.data;
          setUserData(userData);

          // Map API response to component state
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            role: userData.role || "volunteer",
            phone: userData.profile?.phoneNumber || "",
            address: userData.profile?.address?.street || "",
            city: userData.profile?.address?.city || "",
            state: userData.profile?.address?.state || "",
            zipCode: userData.profile?.address?.zipCode || "",
            country: userData.profile?.address?.country || "India",
            bio: userData.profile?.bio || "",
            birthdate: userData.volunteerInfo?.dateOfBirth
              ? new Date(userData.volunteerInfo.dateOfBirth)
                  .toISOString()
                  .split("T")[0]
              : "",
            // Volunteer specific fields
            availability: userData.volunteerInfo?.availability || {},
            skills: userData.volunteerInfo?.skills || [],
            interests: userData.volunteerInfo?.interests || [],
            preferredLocations:
              userData.volunteerInfo?.preferredLocations || [],
            experience: userData.volunteerInfo?.experience || "Beginner",
            emergencyContact: {
              name: userData.volunteerInfo?.emergencyContact?.name || "",
              relationship:
                userData.volunteerInfo?.emergencyContact?.relationship || "",
              phone: userData.volunteerInfo?.emergencyContact?.phone || "",
            },
            education: userData.volunteerInfo?.education || "",
            occupation: userData.volunteerInfo?.occupation || "",
            maxDistance: userData.volunteerInfo?.maxDistance || 15,
            hasDriverLicense: userData.volunteerInfo?.hasDriverLicense || false,
            hasVehicle: userData.volunteerInfo?.hasVehicle || false,
            hasCriminalRecord:
              userData.volunteerInfo?.hasCriminalRecord || false,
            criminalRecordDetails:
              userData.volunteerInfo?.criminalRecordDetails || "",
            additionalInfo: userData.volunteerInfo?.additionalInfo || "",
            totalHours: userData.volunteerInfo?.totalHours || 0,
            // NGO specific fields
            organization: userData.ngoInfo?.organization || "",
            organizationDescription:
              userData.ngoInfo?.details?.description || "",
            organizationWebsite: userData.ngoInfo?.details?.website || "",
            organizationMission: userData.ngoInfo?.details?.mission || "",
            organizationFoundedYear:
              userData.ngoInfo?.details?.foundedYear || "",
            organizationSize: userData.ngoInfo?.details?.size || "",
            organizationRegistrationNumber:
              userData.ngoInfo?.details?.registrationNumber || "",
            organizationTaxId: userData.ngoInfo?.details?.taxId || "",
            organizationLogo: userData.ngoInfo?.logo || "",
          });
        } else {
          toast.error("Failed to load profile data");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data from API:", error);

        // Fallback to store data if API fails
        try {
          await fetchProfile();
          await fetchSkills();
          await fetchInterests();

          if (profile) {
            setFormData({
              name: profile.name || "",
              email: profile.email || user?.email || "",
              role: user?.role || "volunteer",
              phone: profile.phone || "",
              address: profile.address || "",
              city: profile.city || "",
              state: profile.state || "",
              zipCode: profile.zipCode || "",
              country: "India",
              bio: profile.bio || "",
              birthdate: profile.birthdate
                ? new Date(profile.birthdate).toISOString().split("T")[0]
                : "",
              availability: profile.availability || {},
              skills: skills || [],
              interests: interests || [],
              preferredLocations: profile.preferredLocations || [],
              experience: profile.experience || "Beginner",
              emergencyContact: profile.emergencyContact || {
                name: "",
                relationship: "",
                phone: "",
              },
              education: profile.education || "",
              occupation: profile.occupation || "",
              maxDistance: profile.maxDistance || 15,
              hasDriverLicense: profile.hasDriverLicense || false,
              hasVehicle: profile.hasVehicle || false,
              hasCriminalRecord: profile.hasCriminalRecord || false,
              criminalRecordDetails: profile.criminalRecordDetails || "",
              additionalInfo: profile.additionalInfo || "",
              totalHours: profile.totalHours || 0,
              // NGO specific fields
              organization: profile.organization || "",
              organizationDescription: profile.organizationDescription || "",
              organizationWebsite: profile.organizationWebsite || "",
              organizationMission: profile.organizationMission || "",
              organizationFoundedYear: profile.organizationFoundedYear || "",
              organizationSize: profile.organizationSize || "",
              organizationRegistrationNumber:
                profile.organizationRegistrationNumber || "",
              organizationTaxId: profile.organizationTaxId || "",
              organizationLogo: profile.organizationLogo || "",
            });
          }
        } catch (storeError) {
          console.error("Error fetching from store:", storeError);
          toast.error("Failed to load profile data");
        }

        setLoading(false);
      }
    };

    fetchUserData();
  }, [
    fetchProfile,
    fetchSkills,
    fetchInterests,
    profile,
    skills,
    interests,
    user,
  ]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle adding a skill from dropdown
  const handleSelectSkill = (skill) => {
    // Check if skill already exists
    if (formData.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      toast.info("This skill is already in your profile");
      return;
    }

    const updatedSkills = [...formData.skills, skill];
    setFormData({
      ...formData,
      skills: updatedSkills,
    });

    setSelectedSkill("");
    setSkillDropdownOpen(false);
  };

  // Handle adding a custom skill
  const handleAddCustomSkill = () => {
    if (!newSkill.trim()) return;

    // Check if skill already exists
    if (
      formData.skills.some(
        (s) => s.toLowerCase() === newSkill.toLowerCase().trim()
      )
    ) {
      toast.info("This skill is already in your profile");
      setNewSkill("");
      return;
    }

    const updatedSkills = [...formData.skills, newSkill.trim()];
    setFormData({
      ...formData,
      skills: updatedSkills,
    });

    setNewSkill("");
    setShowCustomSkillInput(false);
  };

  // Handle adding an interest from dropdown
  const handleSelectInterest = (interest) => {
    // Check if interest already exists
    if (formData.interests.includes(interest)) {
      toast.info("This interest is already in your profile");
      return;
    }

    const updatedInterests = [...formData.interests, interest];
    setFormData({
      ...formData,
      interests: updatedInterests,
    });

    setSelectedInterest("");
    setInterestDropdownOpen(false);
  };

  // Handle adding a custom interest
  const handleAddCustomInterest = () => {
    if (!newInterest.trim()) return;

    // Check if interest already exists
    if (formData.interests.includes(newInterest.trim())) {
      toast.info("This interest is already in your profile");
      setNewInterest("");
      return;
    }

    const updatedInterests = [...formData.interests, newInterest.trim()];
    setFormData({
      ...formData,
      interests: updatedInterests,
    });

    setNewInterest("");
    setShowCustomInterestInput(false);
  };

  // Handle removing a skill
  const handleRemoveSkill = (index) => {
    const updatedSkills = [...formData.skills];
    updatedSkills.splice(index, 1);
    setFormData({
      ...formData,
      skills: updatedSkills,
    });
  };

  // Handle removing an interest
  const handleRemoveInterest = (index) => {
    const updatedInterests = [...formData.interests];
    updatedInterests.splice(index, 1);
    setFormData({
      ...formData,
      interests: updatedInterests,
    });
  };

  // Function to add a custom preferred location
  const handleAddCustomLocation = () => {
    if (!newLocation.trim()) return;

    // Check if location already exists to avoid duplicates
    if (formData.preferredLocations.includes(newLocation.trim())) {
      toast.info("This location is already in your preferences");
      setNewLocation("");
      return;
    }

    const updatedLocations = [
      ...formData.preferredLocations,
      newLocation.trim(),
    ];
    setFormData({
      ...formData,
      preferredLocations: updatedLocations,
    });
    setNewLocation("");
  };

  // Handle locations input key press for easier entry
  const handleLocationKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomLocation();
    }
  };

  // Handle form submission - update directly through API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Prepare data for API update - map to match userSchema
      const apiUpdateData = {
        name: formData.name,
        profile: {
          phoneNumber: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
          bio: formData.bio,
        },

        // Volunteer-specific fields
        volunteerInfo: {
          dateOfBirth: formData.birthdate,
          skills: formData.skills,
          interests: formData.interests,
          experience: formData.experience,
          preferredLocations: formData.preferredLocations,
          availability: formData.availability,
          emergencyContact: {
            name: formData.emergencyContact.name,
            relationship: formData.emergencyContact.relationship,
            phone: formData.emergencyContact.phone,
          },
          education: formData.education,
          occupation: formData.occupation,
          maxDistance: Number(formData.maxDistance),
          hasDriverLicense: formData.hasDriverLicense,
          hasVehicle: formData.hasVehicle,
          hasCriminalRecord: formData.hasCriminalRecord,
          criminalRecordDetails: formData.criminalRecordDetails,
          additionalInfo: formData.additionalInfo,
        },
      };

      // Only add organization fields if the user is an NGO
      if (formData.role === "ngo") {
        apiUpdateData.ngoInfo = {
          organization: formData.organization,
          details: {},
        };

        // Only include valid organizational details (skip empty enum fields)
        if (formData.organizationDescription)
          apiUpdateData.ngoInfo.details.description =
            formData.organizationDescription;
        if (formData.organizationWebsite)
          apiUpdateData.ngoInfo.details.website = formData.organizationWebsite;
        if (formData.organizationMission)
          apiUpdateData.ngoInfo.details.mission = formData.organizationMission;
        if (formData.organizationFoundedYear)
          apiUpdateData.ngoInfo.details.foundedYear =
            formData.organizationFoundedYear;
        if (formData.organizationRegistrationNumber)
          apiUpdateData.ngoInfo.details.registrationNumber =
            formData.organizationRegistrationNumber;
        if (formData.organizationTaxId)
          apiUpdateData.ngoInfo.details.taxId = formData.organizationTaxId;

        // Handle enum field - don't send empty string
        if (formData.organizationSize) {
          apiUpdateData.ngoInfo.details.size = formData.organizationSize;
        }

        // Add logo only if it exists
        if (formData.organizationLogo) {
          apiUpdateData.ngoInfo.logo = formData.organizationLogo;
        }
      }

      console.log("Updating profile with data:", apiUpdateData);

      // Update user profile through API
      const response = await api.put("/users/profile", apiUpdateData);

      if (response.data.success) {
        // Also update through the store for state consistency
        await updateProfile({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          bio: formData.bio,
          birthdate: formData.birthdate,
          preferredLocations: formData.preferredLocations,
          experience: formData.experience,
          education: formData.education,
          occupation: formData.occupation,
        });

        await updateSkills(formData.skills);
        await updateInterests(formData.interests);

        toast.success("Profile updated successfully");
        setEditMode(false);

        // Refresh user data
        const updatedResponse = await api.get("/users/profile");
        if (updatedResponse.data.success) {
          setUserData(updatedResponse.data.data);
        }
      } else {
        toast.error("Failed to update profile");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        "Failed to update profile: " +
          (error.response?.data?.message || error.message)
      );
      setLoading(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form data to current user data
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.profile?.phoneNumber || "",
        address: userData.profile?.address?.street || "",
        city: userData.profile?.address?.city || "",
        state: userData.profile?.address?.state || "",
        zipCode: userData.profile?.address?.zipCode || "",
        country: userData.profile?.address?.country || "India",
        bio: userData.profile?.bio || "",
        birthdate: userData.volunteerInfo?.dateOfBirth
          ? new Date(userData.volunteerInfo.dateOfBirth)
              .toISOString()
              .split("T")[0]
          : "",
        // Make sure we include all fields here too
        availability: userData.volunteerInfo?.availability || {},
        skills: userData.volunteerInfo?.skills || [],
        interests: userData.volunteerInfo?.interests || [],
        preferredLocations: userData.volunteerInfo?.preferredLocations || [],
        experience: userData.volunteerInfo?.experience || "Beginner",
        emergencyContact: {
          name: userData.volunteerInfo?.emergencyContact?.name || "",
          relationship:
            userData.volunteerInfo?.emergencyContact?.relationship || "",
          phone: userData.volunteerInfo?.emergencyContact?.phone || "",
        },
        education: userData.volunteerInfo?.education || "",
        occupation: userData.volunteerInfo?.occupation || "",
        maxDistance: userData.volunteerInfo?.maxDistance || 15,
        hasDriverLicense: userData.volunteerInfo?.hasDriverLicense || false,
        hasVehicle: userData.volunteerInfo?.hasVehicle || false,
        hasCriminalRecord: userData.volunteerInfo?.hasCriminalRecord || false,
        criminalRecordDetails:
          userData.volunteerInfo?.criminalRecordDetails || "",
        additionalInfo: userData.volunteerInfo?.additionalInfo || "",
        totalHours: userData.volunteerInfo?.totalHours || 0,
        // NGO specific fields
        organization: userData.ngoInfo?.organization || "",
        organizationDescription: userData.ngoInfo?.details?.description || "",
        organizationWebsite: userData.ngoInfo?.details?.website || "",
        organizationMission: userData.ngoInfo?.details?.mission || "",
        organizationFoundedYear: userData.ngoInfo?.details?.foundedYear || "",
        organizationSize: userData.ngoInfo?.details?.size || "",
        organizationRegistrationNumber:
          userData.ngoInfo?.details?.registrationNumber || "",
        organizationTaxId: userData.ngoInfo?.details?.taxId || "",
        organizationLogo: userData.ngoInfo?.logo || "",
      });
    }
    setEditMode(false);
  };

  // Create a function to generate avatar URL
  const getAvatarUrl = (name) => {
    // Use UI Avatars service to generate an avatar based on name
    // If no name is provided, use a default placeholder
    const userName = name || "Volunteer";
    // Encode the name for URL and specify size, background color, and text color
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userName
    )}&size=128&background=6366F1&color=ffffff&bold=true`;
  };

  if (loading && !userData && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Section with Profile Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/30 flex items-center justify-center overflow-hidden">
              <img
                src={getAvatarUrl(formData.name)}
                alt={formData.name || "Volunteer"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {formData.name || "Volunteer"}
            </h1>
            <p className="text-white/80 mb-4">
              {formData.bio || "No bio provided yet"}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg"
                >
                  <FiEdit className="text-sm" /> Edit Profile
                </button>
              )}

              {editMode && (
                <>
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-green-500/80 hover:bg-green-500 transition-colors px-4 py-2 rounded-lg"
                    disabled={loading}
                  >
                    <FiSave className="text-sm" /> Save Changes
                  </button>

                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg"
                    disabled={loading}
                  >
                    <FiX className="text-sm" /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Statistics Section - Moved here */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <FiBarChart2 className="mr-2 text-indigo-500" /> Volunteer Statistics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <h3 className="font-medium text-gray-700 mb-2">Total Hours</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {formData.totalHours}
            </p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <h3 className="font-medium text-gray-700 mb-2">Experience Level</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {formData.experience}
            </p>
          </div>

          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <h3 className="font-medium text-gray-700 mb-2">
              Preferred Locations
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {formData.preferredLocations.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Contact Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FiUser className="mr-2 text-indigo-500" /> Contact Information
          </h2>

          {editMode ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birthdate
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start">
                <FiMail className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-700">
                    {formData.email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FiPhone className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-700">
                    {formData.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FiMapPin className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-700">
                    {formData.address ||
                    formData.city ||
                    formData.state ||
                    formData.zipCode ||
                    formData.country ? (
                      <>
                        {formData.address || ""}
                        {(formData.city ||
                          formData.state ||
                          formData.zipCode) && (
                          <>
                            {formData.address && <br />}
                            {[
                              formData.city || "",
                              formData.state || "",
                              formData.zipCode || "",
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </>
                        )}
                        {formData.country && (
                          <>
                            <br />
                            {formData.country}
                          </>
                        )}
                      </>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FiCalendar className="text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Birthdate</p>
                  <p className="text-gray-700">
                    {formData.birthdate
                      ? new Date(formData.birthdate).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Skills & Expertise */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FiAward className="mr-2 text-indigo-500" /> Skills & Expertise
          </h2>

          {editMode ? (
            <div className="space-y-4">
              {/* Skill Dropdown */}
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <div
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      setSkillDropdownOpen(!skillDropdownOpen);
                      setShowCustomSkillInput(false);
                    }}
                  >
                    <span
                      className={
                        selectedSkill ? "text-gray-800" : "text-gray-400"
                      }
                    >
                      {selectedSkill || "Select a skill"}
                    </span>
                    <FiChevronDown
                      className={`transition ${
                        skillDropdownOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (selectedSkill) {
                        handleSelectSkill(selectedSkill);
                      } else {
                        setSkillDropdownOpen(!skillDropdownOpen);
                      }
                    }}
                    className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  >
                    <FiPlus />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {skillDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search skills..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                      />
                    </div>

                    <div className="py-1">
                      {COMMON_SKILLS.filter((skill) =>
                        skill
                          .toLowerCase()
                          .includes(selectedSkill.toLowerCase())
                      ).map((skill, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 text-gray-700 hover:bg-indigo-50 cursor-pointer"
                          onClick={() => handleSelectSkill(skill)}
                        >
                          {skill}
                        </div>
                      ))}

                      {/* Custom skill option */}
                      <div
                        className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 cursor-pointer border-t border-gray-200"
                        onClick={() => {
                          setShowCustomSkillInput(true);
                          setSkillDropdownOpen(false);
                        }}
                      >
                        + Add a custom skill
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Skill Input */}
              {showCustomSkillInput && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter a custom skill"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddCustomSkill}
                    className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  >
                    <FiPlus />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}

                {formData.skills.length === 0 && (
                  <p className="text-gray-500 text-sm italic">
                    No skills added yet
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {formData.skills && formData.skills.length > 0 ? (
                formData.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No skills added yet
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Interests */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FiHeart className="mr-2 text-indigo-500" /> Interests
          </h2>

          {editMode ? (
            <div className="space-y-4">
              {/* Interest Dropdown */}
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <div
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      setInterestDropdownOpen(!interestDropdownOpen);
                      setShowCustomInterestInput(false);
                    }}
                  >
                    <span
                      className={
                        selectedInterest ? "text-gray-800" : "text-gray-400"
                      }
                    >
                      {selectedInterest || "Select an interest"}
                    </span>
                    <FiChevronDown
                      className={`transition ${
                        interestDropdownOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (selectedInterest) {
                        handleSelectInterest(selectedInterest);
                      } else {
                        setInterestDropdownOpen(!interestDropdownOpen);
                      }
                    }}
                    className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  >
                    <FiPlus />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {interestDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-white border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search interests..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={selectedInterest}
                        onChange={(e) => setSelectedInterest(e.target.value)}
                      />
                    </div>

                    <div className="py-1">
                      {COMMON_INTERESTS.filter((interest) =>
                        interest
                          .toLowerCase()
                          .includes(selectedInterest.toLowerCase())
                      ).map((interest, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 text-gray-700 hover:bg-indigo-50 cursor-pointer"
                          onClick={() => handleSelectInterest(interest)}
                        >
                          {interest}
                        </div>
                      ))}

                      {/* Custom interest option */}
                      <div
                        className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 cursor-pointer border-t border-gray-200"
                        onClick={() => {
                          setShowCustomInterestInput(true);
                          setInterestDropdownOpen(false);
                        }}
                      >
                        + Add a custom interest
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Interest Input */}
              {showCustomInterestInput && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Enter a custom interest"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomInterest();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddCustomInterest}
                    className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  >
                    <FiPlus />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {formData.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                  >
                    <span>{interest}</span>
                    <button
                      onClick={() => handleRemoveInterest(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}

                {formData.interests.length === 0 && (
                  <p className="text-gray-500 text-sm italic">
                    No interests added yet
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              {formData.interests && formData.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No interests added yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preferred Locations Section */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <FiMapPin className="mr-2 text-indigo-500" /> Preferred Volunteer
          Locations
        </h2>

        {editMode ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add a preferred location"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={handleLocationKeyPress}
              />
              <button
                onClick={handleAddCustomLocation}
                className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
              >
                <FiPlus />
              </button>
            </div>

            {/* Suggested Common Locations */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Suggested locations:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Downtown",
                  "City Parks",
                  "Schools",
                  "Community Centers",
                  "Soup Kitchens",
                  "Shelters",
                  "Hospitals",
                  "Retirement Homes",
                  "Libraries",
                ].map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => {
                      if (!formData.preferredLocations.includes(location)) {
                        setFormData({
                          ...formData,
                          preferredLocations: [
                            ...formData.preferredLocations,
                            location,
                          ],
                        });
                      } else {
                        toast.info(
                          "This location is already in your preferences"
                        );
                      }
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full"
                  >
                    + {location}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {formData.preferredLocations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                >
                  <span>{location}</span>
                  <button
                    onClick={() => handleRemoveLocation(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}

              {formData.preferredLocations.length === 0 && (
                <p className="text-gray-500 text-sm italic">
                  No preferred locations added yet
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            {formData.preferredLocations &&
            formData.preferredLocations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.preferredLocations.map((location, index) => (
                  <span
                    key={index}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    <FiMapPin className="mr-1 text-xs" /> {location}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                No preferred locations added yet
              </p>
            )}
          </div>
        )}
      </div>

      {/* Availability Schedule Section */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <FiClock className="mr-2 text-indigo-500" /> Availability Schedule
        </h2>

        {editMode ? (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 mb-4">
              Select the times you're available to volunteer each day
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ].map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <h3 className="capitalize font-medium text-gray-700 mb-3 pb-2">
                    {day}
                  </h3>
                  <div className="space-y-2">
                    {["morning", "afternoon", "evening"].map((timeSlot) => (
                      <label
                        key={`${day}-${timeSlot}`}
                        className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                          formData.availability[day]?.includes(timeSlot)
                            ? "bg-indigo-100 text-indigo-700"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.availability[day]?.includes(timeSlot) ||
                            false
                          }
                          onChange={(e) => {
                            const currentSlots =
                              formData.availability[day] || [];
                            let newSlots;

                            if (e.target.checked) {
                              newSlots = [...currentSlots, timeSlot];
                            } else {
                              newSlots = currentSlots.filter(
                                (slot) => slot !== timeSlot
                              );
                            }

                            setFormData({
                              ...formData,
                              availability: {
                                ...formData.availability,
                                [day]: newSlots,
                              },
                            });
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex items-center">
                          <span
                            className={`text-sm ${
                              formData.availability[day]?.includes(timeSlot)
                                ? "font-medium"
                                : ""
                            }`}
                          >
                            {timeSlot === "morning" && "🌅 "}
                            {timeSlot === "afternoon" && "☀️ "}
                            {timeSlot === "evening" && "🌙 "}
                            <span className="capitalize">{timeSlot}</span>
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center mt-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  // Quick select all weekday mornings
                  const newAvailability = { ...formData.availability };
                  [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                  ].forEach((day) => {
                    newAvailability[day] = ["morning"];
                  });
                  setFormData({ ...formData, availability: newAvailability });
                }}
                className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 rounded-md"
              >
                Weekday Mornings
              </button>
              <button
                type="button"
                onClick={() => {
                  // Quick select all weekend days
                  const newAvailability = { ...formData.availability };
                  ["saturday", "sunday"].forEach((day) => {
                    newAvailability[day] = ["morning", "afternoon", "evening"];
                  });
                  setFormData({ ...formData, availability: newAvailability });
                }}
                className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1 rounded-md"
              >
                All Weekend
              </button>
              <button
                type="button"
                onClick={() => {
                  // Clear all selections
                  setFormData({ ...formData, availability: {} });
                }}
                className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md"
              >
                Clear All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(formData.availability || {}).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((day) => (
                  <div
                    key={day}
                    className={`rounded-lg p-4 transition-all ${
                      formData.availability[day]?.length > 0
                        ? "bg-gray-50"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <h3 className="capitalize font-medium mb-2 flex items-center">
                      {day === "saturday" || day === "sunday" ? "🔆 " : "📅 "}
                      {day}
                    </h3>

                    {formData.availability[day]?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.availability[day].map((timeSlot, index) => (
                          <span
                            key={index}
                            className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs capitalize flex items-center"
                          >
                            {timeSlot === "morning" && "🌅 "}
                            {timeSlot === "afternoon" && "☀️ "}
                            {timeSlot === "evening" && "🌙 "}
                            {timeSlot}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic">
                        Not available
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FiClock className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500">
                  No availability schedule provided
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click 'Edit Profile' to set your volunteer availability
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Volunteer Information Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Volunteer Details */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FiUser className="mr-2 text-indigo-500" /> Volunteer Details
          </h2>

          {editMode ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Distance Willing to Travel (miles)
                </label>
                <input
                  type="number"
                  name="maxDistance"
                  value={formData.maxDistance}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Transportation
                </label>

                <div className="flex items-center">
                  <input
                    id="hasDriverLicense"
                    type="checkbox"
                    name="hasDriverLicense"
                    checked={formData.hasDriverLicense}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hasDriverLicense: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="hasDriverLicense"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    I have a driver's license
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="hasVehicle"
                    type="checkbox"
                    name="hasVehicle"
                    checked={formData.hasVehicle}
                    onChange={(e) =>
                      setFormData({ ...formData, hasVehicle: e.target.checked })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="hasVehicle"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    I have my own vehicle
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Background Check
                </label>

                <div className="flex items-center">
                  <input
                    id="hasCriminalRecord"
                    type="checkbox"
                    name="hasCriminalRecord"
                    checked={formData.hasCriminalRecord}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hasCriminalRecord: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="hasCriminalRecord"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    I have a criminal record
                  </label>
                </div>

                {formData.hasCriminalRecord && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">
                      Please provide details
                    </label>
                    <textarea
                      name="criminalRecordDetails"
                      value={formData.criminalRecordDetails}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Occupation</p>
                  <p className="text-gray-700">
                    {formData.occupation || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Education</p>
                  <p className="text-gray-700">
                    {formData.education || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Experience Level</p>
                  <p className="text-gray-700">{formData.experience}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Max Travel Distance</p>
                  <p className="text-gray-700">{formData.maxDistance} miles</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Transportation</p>
                <div className="mt-1 space-y-1">
                  <p className="text-gray-700 flex items-center">
                    <span
                      className={`mr-2 ${
                        formData.hasDriverLicense
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.hasDriverLicense ? "✓" : "✗"}
                    </span>
                    Driver's License
                  </p>
                  <p className="text-gray-700 flex items-center">
                    <span
                      className={`mr-2 ${
                        formData.hasVehicle ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {formData.hasVehicle ? "✓" : "✗"}
                    </span>
                    Own Vehicle
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Background Check</p>
                <p className="text-gray-700 flex items-center">
                  <span
                    className={`mr-2 ${
                      !formData.hasCriminalRecord
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {!formData.hasCriminalRecord ? "✓" : "✗"}
                  </span>
                  {formData.hasCriminalRecord
                    ? "Has criminal record"
                    : "No criminal record"}
                </p>
                {formData.hasCriminalRecord &&
                  formData.criminalRecordDetails && (
                    <p className="text-gray-700 mt-1 text-sm italic">
                      {formData.criminalRecordDetails}
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FiPhone className="mr-2 text-indigo-500" /> Emergency Contact
          </h2>

          {editMode ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        name: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        relationship: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        phone: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {formData.emergencyContact.name ||
              formData.emergencyContact.phone ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Contact Name</p>
                    <p className="text-gray-700">
                      {formData.emergencyContact.name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Relationship</p>
                    <p className="text-gray-700">
                      {formData.emergencyContact.relationship || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-gray-700">
                      {formData.emergencyContact.phone || "Not provided"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  No emergency contact information provided
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Additional Notes Section when in edit mode */}
      {editMode && (
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FiStar className="mr-2 text-indigo-500" /> Additional Information
          </h2>

          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Any additional information you'd like to share about yourself as a volunteer..."
          ></textarea>
        </div>
      )}

      {/* Bio Section when in edit mode */}
      {editMode && (
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
            <FiStar className="mr-2 text-indigo-500" /> Bio & Personal Statement
          </h2>

          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tell us about yourself, your volunteer experience, and what causes you're passionate about..."
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default VolunteerProfile;
