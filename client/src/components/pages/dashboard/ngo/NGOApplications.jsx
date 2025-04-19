import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiSearch,
  FiX,
  FiCheck,
  FiXCircle,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiFileText,
  FiCalendar,
  FiSlash,
} from "react-icons/fi";
import { ngoApi } from "../../../../services/ngoApi";
import Swal from "sweetalert2";

const NGOApplications = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState(null);

  // Fetch applications with filtering, search, and pagination
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare params for API call
      const params = {
        page: currentPage,
        limit: 10,
        status: filter !== "all" ? filter : undefined,
        search: search || undefined,
      };

      // Call the real API
      const response = await ngoApi.getApplications(params);

      if (response.success) {
        setApplications(response.applications || []);
        setTotalApplications(response.totalCount || 0);
        setTotalPages(response.totalPages || 1);
      } else {
        throw new Error(response.message || "Failed to fetch applications");
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error loading applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [currentPage, filter, search]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleApplicationAction = async (
    applicationId,
    action,
    reason = ""
  ) => {
    try {
      setLoading(true);

      let response;
      if (action === "approved") {
        response = await ngoApi.approveApplication(applicationId);
      } else if (action === "rejected") {
        response = await ngoApi.rejectApplication(applicationId, reason);
      } else if (action === "withdrawn") {
        response = await ngoApi.withdrawApplication(applicationId, reason);
      }

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: `Application ${action}`,
          text: `The application has been ${action} successfully.`,
        });

        // Refetch after updating
        fetchApplications();
      } else {
        throw new Error(response.message || `Failed to ${action} application`);
      }
    } catch (err) {
      console.error(`Error ${action} application:`, err);
      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text: err.message || `Failed to ${action} application`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Show confirmation dialog before rejecting an application
  const confirmReject = (applicationId) => {
    Swal.fire({
      title: "Reject Application",
      text: "Are you sure you want to reject this application?",
      icon: "warning",
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: "Enter reason for rejection...",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        handleApplicationAction(applicationId, "rejected", result.value);
      }
    });
  };

  // Show confirmation dialog before approving an application
  const confirmApprove = (applicationId) => {
    Swal.fire({
      title: "Approve Application",
      text: "Are you sure you want to approve this application?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        handleApplicationAction(applicationId, "approved");
      }
    });
  };

  // Show confirmation dialog before withdrawing an application
  const confirmWithdraw = (applicationId) => {
    Swal.fire({
      title: "Withdraw Application",
      text: "Are you sure you want to withdraw this volunteer application?",
      icon: "warning",
      input: "textarea",
      inputLabel: "Reason (optional)",
      inputPlaceholder: "Enter reason for withdrawal...",
      showCancelButton: true,
      confirmButtonText: "Withdraw",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f97316",
    }).then((result) => {
      if (result.isConfirmed) {
        handleApplicationAction(applicationId, "withdrawn", result.value);
      }
    });
  };

  // Component for the pagination controls
  const Pagination = () => (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <FiChevronLeft />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-1 rounded ${
            currentPage === page
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() =>
          currentPage < totalPages && setCurrentPage(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <FiChevronRight />
      </button>
    </div>
  );

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Volunteer Applications
        </h2>
        <p className="text-gray-600 mt-1">
          Manage volunteer applications for your events
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={filter}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-auto shadow-sm"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="search-applications"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search Applications
            </label>
            <div className="relative rounded-lg shadow-sm">
              <input
                id="search-applications"
                type="text"
                placeholder="Search by name, email, or event..."
                value={search}
                onChange={handleSearchChange}
                className="border border-gray-300 rounded-lg pl-10 pr-10 py-2 w-full focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error message if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Applications list */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiUsers className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No applications found
            </h3>
            <p className="text-gray-500 mt-2">
              {filter !== "all"
                ? `No ${filter} applications to display.`
                : search
                ? "No applications matching your search."
                : "There are no volunteer applications at this time."}
            </p>
          </div>
        ) : (
          <div className="p-4 grid gap-4">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  {/* Left side: Volunteer & Event info */}
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 text-lg font-semibold text-indigo-700 flex-shrink-0">
                        {application.volunteer && application.volunteer.name
                          ? application.volunteer.name.charAt(0)
                          : "?"}
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.volunteer && application.volunteer.name
                              ? application.volunteer.name
                              : "Unknown Volunteer"}
                          </h3>
                          <StatusBadge status={application.status} />
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:space-x-4">
                          <span className="flex items-center text-sm text-gray-500">
                            <FiMail className="mr-1 h-4 w-4 text-gray-400" />
                            {application.volunteer &&
                            application.volunteer.email
                              ? application.volunteer.email
                              : "No email provided"}
                          </span>
                          <span className="flex items-center text-sm text-gray-500">
                            <FiPhone className="mr-1 h-4 w-4 text-gray-400" />
                            {application.volunteer &&
                            application.volunteer.profile &&
                            application.volunteer.profile.phoneNumber
                              ? application.volunteer.profile.phoneNumber
                              : "Not provided"}
                          </span>
                        </div>
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <h4 className="text-md font-medium text-gray-700">
                            Applied for:{" "}
                            <span className="text-indigo-600">
                              {application.event && application.event.title
                                ? application.event.title
                                : "Unknown Event"}
                            </span>
                          </h4>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <FiCalendar className="mr-1 h-4 w-4 text-gray-400" />
                            <span>
                              Event Date:{" "}
                              {application.event && application.event.date
                                ? formatDate(application.event.date)
                                : "Date not available"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Application Message:
                          </h4>
                          <p className="mt-1 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                            {application.motivationLetter ||
                              "No message provided."}
                          </p>
                        </div>
                        {application.skillsRelevance && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700">
                              Relevant Skills:
                            </h4>
                            <p className="mt-1 text-sm text-gray-600">
                              {application.skillsRelevance}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Status and actions */}
                  <div className="flex flex-col items-start md:items-end mt-4 md:mt-0">
                    <div className="text-sm text-gray-500">
                      Applied: {formatDate(application.applicationDate)}
                    </div>

                    {application.status === "pending" && (
                      <div className="mt-4 space-x-3">
                        <button
                          onClick={() => confirmApprove(application._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FiCheck className="mr-1.5 h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => confirmReject(application._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiXCircle className="mr-1.5 h-4 w-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => confirmWithdraw(application._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          <FiSlash className="mr-1.5 h-4 w-4" />
                          Withdraw
                        </button>
                      </div>
                    )}

                    {application.status === "approved" && (
                      <div className="mt-4">
                        <button
                          onClick={() => confirmWithdraw(application._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          <FiSlash className="mr-1.5 h-4 w-4" />
                          Withdraw
                        </button>
                      </div>
                    )}

                    {application.responseDate && (
                      <div className="mt-2 text-sm text-gray-500">
                        Responded: {formatDate(application.responseDate)}
                      </div>
                    )}

                    {application.notes && (
                      <div className="mt-3 text-sm bg-gray-50 p-3 rounded border border-gray-100 max-w-md">
                        <span className="font-medium">Notes:</span>{" "}
                        {application.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center py-4">
                <Pagination />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && applications.length > 0 && (
        <div className="text-sm text-gray-500 mb-6">
          Showing {applications.length} of {totalApplications} applications
        </div>
      )}
    </div>
  );
};

// Status badge component
const StatusBadge = ({ status }) => {
  // Handle undefined or null status
  const safeStatus = status || "unknown";

  const getStatusConfig = () => {
    switch (safeStatus) {
      case "approved":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          icon: <FiCheck className="w-3 h-3 mr-1" />,
        };
      case "rejected":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          icon: <FiXCircle className="w-3 h-3 mr-1" />,
        };
      case "pending":
        return {
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          icon: <FiAlertCircle className="w-3 h-3 mr-1" />,
        };
      case "withdrawn":
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: <FiSlash className="w-3 h-3 mr-1" />,
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: null,
        };
    }
  };

  const { bgColor, textColor, icon } = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {icon}
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
};

export default NGOApplications;
