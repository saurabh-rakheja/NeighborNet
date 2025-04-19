import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiSearch,
  FiX,
  FiMail,
  FiPhone,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiStar,
  FiCheck,
  FiBriefcase,
  FiEye,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { ngoApi } from "../../../../services/ngoApi";
import { api } from "../../../../services/api";

const NGOVolunteers = () => {
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [filteredCount, setFilteredCount] = useState(0);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [activeVolunteers, setActiveVolunteers] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [pageSize] = useState(10);

  // Fetch volunteers with filters
  const fetchVolunteers = async () => {
    try {
      setLoading(true);

      // Build query parameters for API request
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      // Make API call to get volunteers using the ngoApi instead of directly calling users endpoint
      const response = await ngoApi.getVolunteers(params);

      // Get the data from the response - adjust based on your actual API response structure
      const volunteers = response.volunteers || [];
      const totalCount = response.totalCount || volunteers.length;
      const totalPages =
        response.totalPages || Math.ceil(volunteers.length / pageSize);

      // Transform the data to match our expected structure
      const transformedVolunteers = volunteers.map((volunteer) => ({
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.profile?.phoneNumber || "Not provided",
        city: volunteer.profile?.address?.city || "Not provided",
        state: volunteer.profile?.address?.state || "",
        skills: volunteer.volunteerInfo?.skills || [],
        rating: volunteer.volunteerInfo?.rating || 0,
        joinedDate: volunteer.createdAt,
        eventsParticipated: volunteer.volunteerInfo?.eventsParticipated || 0,
        hoursContributed: volunteer.volunteerInfo?.totalHours || 0,
      }));

      // Calculate stats from the volunteer data
      const activeVolunteerCount = volunteers.length;

      const totalHoursValue = volunteers.reduce(
        (total, volunteer) =>
          total + (volunteer.volunteerInfo?.totalHours || 0),
        0
      );

      // Set state with transformed data
      setVolunteers(transformedVolunteers);
      setFilteredCount(totalCount);
      setTotalVolunteers(totalCount);
      setActiveVolunteers(activeVolunteerCount);
      setTotalHours(totalHoursValue);
      setTotalPages(totalPages);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to load volunteers",
        text: "Please try again later",
      });
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchVolunteers();
  }, [currentPage, searchTerm]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle pagination
  const goToPage = (page) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Toggle filters visibility on mobile
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  // Get rating stars display
  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <FiStar
            key={`full-${i}`}
            className="w-4 h-4 text-yellow-400 fill-current"
          />
        ))}
        {halfStar && <FiStar className="w-4 h-4 text-yellow-400 half-filled" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-1 text-gray-600 text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Export volunteers data
  const handleExport = async () => {
    try {
      setLoading(true);

      // Get all volunteer users from the API using ngoApi
      const response = await ngoApi.getVolunteers({
        limit: 1000, // Get all volunteers for export
      });

      const volunteers = response.volunteers || [];

      // Transform the data to match our expected structure
      const transformedVolunteers = volunteers.map((volunteer) => ({
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.profile?.phoneNumber || "Not provided",
        city: volunteer.profile?.address?.city || "Not provided",
        state: volunteer.profile?.address?.state || "",
        skills: volunteer.volunteerInfo?.skills || [],
        rating: volunteer.volunteerInfo?.rating || 0,
        joinedDate: volunteer.createdAt,
        eventsParticipated: volunteer.volunteerInfo?.eventsParticipated || 0,
        hoursContributed: volunteer.volunteerInfo?.totalHours || 0,
      }));

      // Generate CSV headers
      const headers = [
        "Name",
        "Email",
        "Phone",
        "Location",
        "Skills",
        "Rating",
        "Joined Date",
        "Events Participated",
        "Hours Contributed",
      ].join(",");

      // Generate CSV rows from transformed data
      const rows = transformedVolunteers.map((v) => {
        return [
          v.name,
          v.email,
          v.phone,
          `${v.city}, ${v.state}`,
          (v.skills || []).join(";"),
          v.rating,
          formatDate(v.joinedDate),
          v.eventsParticipated,
          v.hoursContributed,
        ].join(",");
      });

      // Combine headers and rows to create CSV
      const csvData = [headers, ...rows].join("\n");

      // Create a blob and download link
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);
      a.setAttribute("download", "volunteers.csv");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setLoading(false);
    } catch (error) {
      console.error("Error exporting volunteers:", error);
      Swal.fire({
        icon: "error",
        title: "Export failed",
        text: "Unable to export volunteer data. Please try again.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Volunteers</h2>
        <button
          onClick={handleExport}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <FiDownload className="mr-2" /> Export List
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg mr-4">
              <FiUsers className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Total Volunteers
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {totalVolunteers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <FiCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Active Volunteers
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {activeVolunteers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <FiCalendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Hours</h3>
              <p className="text-2xl font-bold text-gray-900">{totalHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters for desktop */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 hidden md:block">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search volunteers..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg w-full md:w-64"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter toggle for mobile */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 md:hidden">
        <button
          onClick={toggleFilters}
          className="flex items-center justify-between w-full"
        >
          <span className="flex items-center text-gray-700">
            <FiFilter className="mr-2" /> Filters
          </span>
          <span className="text-sm text-gray-500">
            {searchTerm && "Search: " + searchTerm}
          </span>
        </button>

        {isFiltersOpen && (
          <div className="mt-4 pt-4 border-t">
            <div>
              <label className="block text-gray-600 font-medium mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg w-full"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Volunteers List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : volunteers.length > 0 ? (
          <div className="divide-y">
            {volunteers.map((volunteer) => (
              <div
                key={volunteer.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start">
                    <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white mr-4">
                      {volunteer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {volunteer.name}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 gap-y-1 gap-x-4 mt-1">
                        <span className="flex items-center">
                          <FiMail className="mr-1 text-gray-400" />
                          {volunteer.email}
                        </span>
                        <span className="flex items-center">
                          <FiPhone className="mr-1 text-gray-400" />
                          {volunteer.phone}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="flex items-center">
                          <FiBriefcase className="mr-1 text-gray-400" />
                          {volunteer.city}, {volunteer.state}
                        </span>
                      </div>
                      <div className="flex items-center mt-1.5">
                        {getRatingStars(volunteer.rating)}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">
                          Skills:{" "}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {volunteer.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:text-right flex flex-col items-start md:items-end">
                    <div className="flex items-center text-sm">
                      <FiCalendar className="mr-1 text-gray-400" />
                      <span className="text-gray-500">
                        Joined on {formatDate(volunteer.joinedDate)}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {volunteer.eventsParticipated} events participated
                      </div>
                      <div className="text-sm text-gray-600">
                        {volunteer.hoursContributed} hours contributed
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/ngo-dashboard/volunteers/${volunteer.id}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg mr-2 inline-flex items-center"
                      >
                        <FiEye className="mr-2" /> View Profile
                      </Link>
                      <button
                        className="border border-gray-300 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg"
                        onClick={() => {
                          // Show message input dialog
                          Swal.fire({
                            title: `Send message to ${volunteer.name}`,
                            input: "textarea",
                            inputPlaceholder: "Type your message here...",
                            showCancelButton: true,
                            confirmButtonText: "Send",
                            cancelButtonText: "Cancel",
                            showLoaderOnConfirm: true,
                            preConfirm: (message) => {
                              if (!message.trim()) {
                                Swal.showValidationMessage(
                                  "Please enter a message"
                                );
                                return false;
                              }

                              // Use ngoApi to send message
                              return ngoApi
                                .submitVolunteerFeedback(volunteer.id, {
                                  message: message.trim(),
                                })
                                .then((response) => {
                                  return response;
                                })
                                .catch((error) => {
                                  console.error(
                                    "Error sending message:",
                                    error
                                  );
                                  Swal.showValidationMessage(
                                    `Failed to send message: ${
                                      error.response?.data?.message ||
                                      "Network error"
                                    }`
                                  );
                                });
                            },
                            allowOutsideClick: () => !Swal.isLoading(),
                          }).then((result) => {
                            if (result.isConfirmed) {
                              Swal.fire({
                                title: "Success!",
                                text: "Your message was sent successfully",
                                icon: "success",
                              });
                            }
                          });
                        }}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No volunteers found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "No volunteers match your search criteria."
                : "You don't have any volunteers yet."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {volunteers.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {volunteers.length} of {totalVolunteers} volunteers
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FiChevronLeft />
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index + 1)}
                className={`w-10 h-10 rounded-lg ${
                  currentPage === index + 1
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGOVolunteers;
