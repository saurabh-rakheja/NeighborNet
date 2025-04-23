import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../../../store/authStore";
import {
  FiSave,
  FiX,
  FiEdit,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import api from "../../../../services/api";

const NGOProfileEditor = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    organization: "",
    organizationDescription: "",
    organizationWebsite: "",
    organizationMission: "",
    organizationFoundedYear: "",
    organizationSize: "",
    organizationRegistrationNumber: "",
    organizationTaxId: "",
  });
  const [errors, setErrors] = useState({});

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.profile?.phoneNumber || "",
        address: user.profile?.address?.street || "",
        city: user.profile?.address?.city || "",
        state: user.profile?.address?.state || "",
        zipCode: user.profile?.address?.zipCode || "",
        country: user.profile?.address?.country || "India",
        organization: user.ngoInfo?.organization || "",
        organizationDescription: user.ngoInfo?.details?.description || "",
        organizationWebsite: user.ngoInfo?.details?.website || "",
        organizationMission: user.ngoInfo?.details?.mission || "",
        organizationFoundedYear: user.ngoInfo?.details?.foundedYear || "",
        organizationSize: user.ngoInfo?.details?.size || "",
        organizationRegistrationNumber:
          user.ngoInfo?.details?.registrationNumber || "",
        organizationTaxId: user.ngoInfo?.details?.taxId || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.organization)
      newErrors.organization = "Organization name is required";
    if (
      formData.organizationWebsite &&
      !isValidURL(formData.organizationWebsite)
    ) {
      newErrors.organizationWebsite = "Please enter a valid URL";
    }
    if (formData.organizationFoundedYear) {
      const year = parseInt(formData.organizationFoundedYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1800 || year > currentYear) {
        newErrors.organizationFoundedYear = `Please enter a valid year between 1800 and ${currentYear}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidURL = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Build the profile update data object
      const profileData = {
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
        },
        ngoInfo: {
          organization: formData.organization,
          details: {
            description: formData.organizationDescription,
            website: formData.organizationWebsite,
            mission: formData.organizationMission,
            foundedYear: formData.organizationFoundedYear
              ? parseInt(formData.organizationFoundedYear)
              : undefined,
            size: formData.organizationSize,
            registrationNumber: formData.organizationRegistrationNumber,
            taxId: formData.organizationTaxId,
          },
        },
      };

      // Call the updateUserProfile method from auth store
      const response = await updateUserProfile(profileData);

      if (response.success) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.profile?.phoneNumber || "",
        address: user.profile?.address?.street || "",
        city: user.profile?.address?.city || "",
        state: user.profile?.address?.state || "",
        zipCode: user.profile?.address?.zipCode || "",
        country: user.profile?.address?.country || "India",
        organization: user.ngoInfo?.organization || "",
        organizationDescription: user.ngoInfo?.details?.description || "",
        organizationWebsite: user.ngoInfo?.details?.website || "",
        organizationMission: user.ngoInfo?.details?.mission || "",
        organizationFoundedYear: user.ngoInfo?.details?.foundedYear || "",
        organizationSize: user.ngoInfo?.details?.size || "",
        organizationRegistrationNumber:
          user.ngoInfo?.details?.registrationNumber || "",
        organizationTaxId: user.ngoInfo?.details?.taxId || "",
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Organization Profile
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-2 text-sm rounded-lg border border-gray-300 text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
          >
            <FiEdit className="mr-2" /> Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <FiX className="mr-2" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm rounded-lg border border-transparent bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-150"
            >
              <FiSave className="mr-2" />{" "}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Contact Person Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Organization Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="organization"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization Name*
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border ${
                      errors.organization ? "border-red-500" : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                  />
                  {errors.organization && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.organization}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="organizationWebsite"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Website
                  </label>
                  <input
                    type="url"
                    id="organizationWebsite"
                    name="organizationWebsite"
                    value={formData.organizationWebsite}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border ${
                      errors.organizationWebsite
                        ? "border-red-500"
                        : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    placeholder="https://example.org"
                  />
                  {errors.organizationWebsite && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.organizationWebsite}
                    </p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="organizationMission"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mission Statement
                  </label>
                  <textarea
                    id="organizationMission"
                    name="organizationMission"
                    value={formData.organizationMission}
                    onChange={handleInputChange}
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label
                    htmlFor="organizationDescription"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization Description
                  </label>
                  <textarea
                    id="organizationDescription"
                    name="organizationDescription"
                    value={formData.organizationDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="organizationFoundedYear"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Founded Year
                  </label>
                  <input
                    type="number"
                    id="organizationFoundedYear"
                    name="organizationFoundedYear"
                    value={formData.organizationFoundedYear}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border ${
                      errors.organizationFoundedYear
                        ? "border-red-500"
                        : "border-gray-300"
                    } px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500`}
                    placeholder="e.g. 2010"
                  />
                  {errors.organizationFoundedYear && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.organizationFoundedYear}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="organizationSize"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization Size
                  </label>
                  <select
                    id="organizationSize"
                    name="organizationSize"
                    value={formData.organizationSize}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Size</option>
                    <option value="Small">Small (1-10 employees)</option>
                    <option value="Medium">Medium (11-50 employees)</option>
                    <option value="Large">Large (50+ employees)</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="organizationRegistrationNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Registration Number
                  </label>
                  <input
                    type="text"
                    id="organizationRegistrationNumber"
                    name="organizationRegistrationNumber"
                    value={formData.organizationRegistrationNumber}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="organizationTaxId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tax ID
                  </label>
                  <input
                    type="text"
                    id="organizationTaxId"
                    name="organizationTaxId"
                    value={formData.organizationTaxId}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="zipCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600 mt-4 bg-blue-50 p-3 rounded-md">
            <FiInfo className="mr-2 text-blue-500" />
            <p>Fields marked with * are required</p>
          </div>
        </form>
      ) : (
        // View mode - display NGO profile information
        <div className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Basic Information
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Contact Person
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.name || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Email Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.email || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Phone Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.profile?.phoneNumber || "Not provided"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Organization Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Organization Details
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Organization Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.ngoInfo?.organization || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.ngoInfo?.details?.website ? (
                    <a
                      href={user.ngoInfo.details.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {user.ngoInfo.details.website}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Mission Statement
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.ngoInfo?.details?.mission || "Not provided"}
                </dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Organization Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.ngoInfo?.details?.description || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Founded Year
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.ngoInfo?.details?.foundedYear || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Organization Size
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.ngoInfo?.details?.size || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Registration Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.ngoInfo?.details?.registrationNumber || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tax ID</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.ngoInfo?.details?.taxId || "Not provided"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Address Information
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Street Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.profile?.address?.street || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">City</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.profile?.address?.city || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">State</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.profile?.address?.state || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Postal Code
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.profile?.address?.zipCode || "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Country</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.profile?.address?.country || "Not provided"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGOProfileEditor;
