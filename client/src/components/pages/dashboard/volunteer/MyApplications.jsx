import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiChevronRight,
  FiChevronDown,
  FiFilter,
  FiSearch,
  FiXCircle,
  FiCheckCircle,
  FiSlash,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { volunteerApi } from "../../../../services/volunteerApi";

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await volunteerApi.getApplications();

        if (response.success) {
          setApplications(response.applications || []);
          setFilteredApplications(response.applications || []);
        } else {
          toast.error("Failed to fetch applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error(
          error.message || "An error occurred while fetching applications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...applications];

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((app) => app.status === filter);
    }

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (app) =>
          app.event?.title?.toLowerCase().includes(searchLower) ||
          app.event?.organizationName?.toLowerCase().includes(searchLower) ||
          app.event?.location?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredApplications(result);
  }, [applications, filter, search]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Withdraw application
  const handleWithdrawApplication = async (applicationId) => {
    try {
      setWithdrawing(true);
      setWithdrawingId(applicationId);

      const result = await Swal.fire({
        title: "Withdraw Application",
        text: "Are you sure you want to withdraw this application? This action cannot be undone.",
        icon: "warning",
        input: "textarea",
        inputLabel: "Reason (optional)",
        inputPlaceholder: "Enter reason for withdrawal...",
        showCancelButton: true,
        confirmButtonText: "Withdraw",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f97316",
      });

      if (result.isConfirmed) {
        const response = await volunteerApi.withdrawApplication(
          applicationId,
          result.value
        );

        if (response.success) {
          // Update the application in state
          const updatedApplications = applications.map((app) =>
            app._id === applicationId ? { ...app, status: "withdrawn" } : app
          );
          setApplications(updatedApplications);

          toast.success("Application withdrawn successfully");
        } else {
          throw new Error(response.message || "Failed to withdraw application");
        }
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error(
        error.message || "An error occurred while withdrawing application"
      );
    } finally {
      setWithdrawing(false);
      setWithdrawingId(null);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiAlertCircle className="mr-1 w-3 h-3" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1 w-3 h-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiXCircle className="mr-1 w-3 h-3" />
            Rejected
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FiSlash className="mr-1 w-3 h-3" />
            Withdrawn
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FiCheckCircle className="mr-1 w-3 h-3" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status || "Unknown"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            My Applications
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your volunteer event applications
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search applications..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          {/* Status filter */}
          <div className="relative min-w-[150px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="completed">Completed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <FiChevronDown className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Applications list */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FiAlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No applications found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter !== "all" || search
              ? "Try adjusting your filters or search term"
              : "You haven't applied to any volunteer events yet."}
          </p>
          <div className="mt-6">
            <Link
              to="/dashboard/events"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Browse Events
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredApplications.map((application) => (
            <div
              key={application._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {application.event?.title || "Unknown Event"}
                      </h3>
                      <StatusBadge status={application.status} />
                    </div>

                    {/* Organization */}
                    {application.event?.organizationName && (
                      <p className="text-indigo-600 font-medium mb-2">
                        {application.event.organizationName}
                      </p>
                    )}

                    {/* Application details */}
                    <div className="space-y-2 text-sm text-gray-700 mt-4 mb-4">
                      {/* Application date */}
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Applied On:</span>
                        <span>{formatDate(application.applicationDate)}</span>
                      </div>

                      {/* Event date */}
                      {application.event?.date && (
                        <div className="flex items-center">
                          <FiCalendar className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500" />
                          <span>{formatDate(application.event.date)}</span>
                        </div>
                      )}

                      {/* Location */}
                      {application.event?.location && (
                        <div className="flex items-start">
                          <FiMapPin className="flex-shrink-0 mr-2 h-4 w-4 text-gray-500 mt-0.5" />
                          <span>{application.event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Application message */}
                    {application.motivationLetter && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Your Application Message:
                        </h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {application.motivationLetter}
                        </p>
                      </div>
                    )}

                    {/* Response/notes */}
                    {application.notes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Response:
                        </h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {application.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 min-w-[140px]">
                    <Link
                      to={`/dashboard/events/${application.event?._id}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Event
                    </Link>

                    {(application.status === "pending" ||
                      application.status === "approved") && (
                      <button
                        onClick={() =>
                          handleWithdrawApplication(application._id)
                        }
                        disabled={withdrawing}
                        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                          withdrawing && withdrawingId === application._id
                            ? "bg-orange-400 cursor-wait"
                            : "bg-orange-500 hover:bg-orange-600"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                      >
                        {withdrawing && withdrawingId === application._id ? (
                          <>
                            <span className="animate-spin mr-1.5 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Withdrawing...
                          </>
                        ) : (
                          <>
                            <FiSlash className="mr-1.5 h-4 w-4" />
                            Withdraw
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
