import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiFilter,
  FiSearch,
  FiMail,
  FiClock,
  FiCalendar,
  FiChevronDown,
  FiExternalLink,
  FiStar,
  FiDownload,
  FiUpload,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
} from "react-icons/fi";
import useAuthStore from "../../../../store/authStore";

const VolunteerManagement = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [isSelectAll, setIsSelectAll] = useState(false);

  // Fetch volunteers data
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/ngo/volunteers", {
          params: {
            status: filter !== "all" ? filter : undefined,
            search: searchTerm || undefined,
            page: currentPage,
            limit: 10,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        setVolunteers(response.data.volunteers);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
        toast.error("Failed to load volunteers");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, [filter, searchTerm, currentPage]);

  // Handle volunteer selection
  const handleVolunteerSelection = (volunteerId) => {
    if (selectedVolunteers.includes(volunteerId)) {
      setSelectedVolunteers(selectedVolunteers.filter(id => id !== volunteerId));
    } else {
      setSelectedVolunteers([...selectedVolunteers, volunteerId]);
    }
  };

  // Handle select all volunteers
  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedVolunteers([]);
    } else {
      setSelectedVolunteers(volunteers.map(volunteer => volunteer._id));
    }
    setIsSelectAll(!isSelectAll);
  };

  // Filter handlers
  const handleFilterChange = (status) => {
    setFilter(status);
    setCurrentPage(1);
    setShowFilterMenu(false);
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Message selected volunteers
  const handleMessageVolunteers = () => {
    if (selectedVolunteers.length === 0) {
      toast.warning("Please select at least one volunteer to message");
      return;
    }
    navigate("/dashboard/volunteers/message", { state: { selectedVolunteers } });
  };

  // Export selected volunteers data
  const handleExportVolunteers = () => {
    if (selectedVolunteers.length === 0) {
      toast.warning("Please select at least one volunteer to export");
      return;
    }
    toast.success(`Exporting data for ${selectedVolunteers.length} volunteers`);
    // This would be replaced with actual export functionality
  };

  // Get volunteer initials for avatar
  const getInitials = (name) => {
    if (!name) return "VL";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate volunteer status
  const getVolunteerStatus = (volunteer) => {
    if (!volunteer) return "Unknown";
    
    // Example logic - would be based on your application's status tracking
    if (volunteer.active && volunteer.lastActivity && (new Date() - new Date(volunteer.lastActivity)) < 30 * 24 * 60 * 60 * 1000) {
      return "Active";
    } else if (volunteer.active) {
      return "Inactive";
    } else {
      return "Former";
    }
  };

  // Volunteer status badge
  const StatusBadge = ({ status }) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-800";
    
    switch (status.toLowerCase()) {
      case "active":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case "inactive":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case "former":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      default:
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Volunteer Management</h1>
            <p className="text-gray-600">
              Track and manage your organization's volunteers
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleMessageVolunteers}
              disabled={selectedVolunteers.length === 0}
              className={`px-4 py-2 rounded-lg shadow font-medium transition-colors flex items-center ${
                selectedVolunteers.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FiMail className="mr-2" /> Message Selected
              {selectedVolunteers.length > 0 && ` (${selectedVolunteers.length})`}
            </button>
            <button
              onClick={handleExportVolunteers}
              disabled={selectedVolunteers.length === 0}
              className={`px-4 py-2 rounded-lg shadow font-medium transition-colors flex items-center ${
                selectedVolunteers.length === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              <FiDownload className="mr-2" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center"
            >
              <FiFilter className="mr-2" />
              Filter: {filter === "all" ? "All Volunteers" : filter}
              <FiChevronDown className="ml-2" />
            </button>
            
            {showFilterMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                <ul className="py-1">
                  <li>
                    <button
                      onClick={() => handleFilterChange("all")}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filter === "all" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      All Volunteers
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleFilterChange("active")}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filter === "active" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      Active
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleFilterChange("inactive")}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filter === "inactive" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      Inactive
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleFilterChange("former")}
                      className={`block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${filter === "former" ? "bg-blue-50 text-blue-600" : ""}`}
                    >
                      Former
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1 md:max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search volunteers by name, email, skills..."
                className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1 rounded-md"
              >
                <span className="sr-only">Search</span>
                <FiSearch className="text-sm" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Volunteers List */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4 text-gray-300">
              <FiUsers className="inline-block" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No volunteers found</h3>
            <p className="text-gray-600 mb-6">
              {filter !== "all"
                ? `You don't have any ${filter.toLowerCase()} volunteers.`
                : "You don't have any volunteers yet."}
            </p>
            <button
              onClick={() => navigate("/dashboard/volunteers/invite")}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg shadow font-medium transition-colors inline-flex items-center"
            >
              <FiUserPlus className="mr-2" /> Invite Volunteers
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={isSelectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills & Interests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {volunteers.map((volunteer) => (
                    <tr key={volunteer._id} className="hover:bg-gray-50">
                      <td className="px-2 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVolunteers.includes(volunteer._id)}
                          onChange={() => handleVolunteerSelection(volunteer._id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                            {volunteer.profile?.profilePicture ? (
                              <img
                                src={volunteer.profile.profilePicture}
                                alt={volunteer.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              getInitials(volunteer.name)
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {volunteer.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {volunteer.email}
                            </div>
                            {volunteer.profile?.phoneNumber && (
                              <div className="text-xs text-gray-500">
                                {volunteer.profile.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {volunteer.volunteerInfo?.skills?.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {volunteer.volunteerInfo.skills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                                  {skill}
                                </span>
                              ))}
                              {volunteer.volunteerInfo.skills.length > 3 && (
                                <span className="bg-gray-50 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                  +{volunteer.volunteerInfo.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">No skills listed</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {volunteer.volunteerInfo?.interests?.length > 0
                            ? volunteer.volunteerInfo.interests.slice(0, 2).join(", ") +
                              (volunteer.volunteerInfo.interests.length > 2
                                ? ` & ${volunteer.volunteerInfo.interests.length - 2} more`
                                : "")
                            : "No interests listed"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiClock className="mr-1 text-xs text-gray-500" />{" "}
                          {volunteer.volunteerInfo?.totalHours || 0} hours
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <FiCalendar className="mr-1 text-xs" />{" "}
                          Last active: {formatDate(volunteer.lastActivity || null)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={getVolunteerStatus(volunteer)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/dashboard/volunteers/${volunteer._id}`)}
                            className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50"
                            title="View Profile"
                          >
                            <FiExternalLink />
                          </button>
                          <button
                            onClick={() => navigate(`/dashboard/volunteers/message/${volunteer._id}`)}
                            className="text-green-600 hover:text-green-800 px-2 py-1 rounded-md hover:bg-green-50"
                            title="Send Message"
                          >
                            <FiMail />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Tips Section */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-medium text-blue-800 flex items-center mb-3">
          <FiHelpCircle className="mr-2" /> Tips for Volunteer Management
        </h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Regularly reach out to inactive volunteers to re-engage them</li>
          <li>Recognize top volunteers with badges or featured spotlights</li>
          <li>Collect feedback after events to improve the volunteer experience</li>
          <li>Send personalized thank-you messages after volunteer shifts</li>
        </ul>
      </div>
    </div>
  );
};

export default VolunteerManagement; 