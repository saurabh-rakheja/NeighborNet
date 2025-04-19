import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuthStore from "../../../../store/authStore";
import { eventApi } from "../../../../services/eventApi";
import { volunteerApi } from "../../../../services/volunteerApi";
import Swal from "sweetalert2";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [volunteersSignedUp, setVolunteersSignedUp] = useState([]);
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [userRegistration, setUserRegistration] = useState({
    isRegistered: false,
    status: null,
    applicationId: null,
  });
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please log in to view event details");
      navigate("/auth/login", { state: { from: `/dashboard/events/${id}` } });
      return;
    }

    const fetchEventDetails = async () => {
      try {
        setLoading(true);

        // Fetch event details
        const eventResponse = await eventApi.getEventById(id);

        if (eventResponse.success) {
          setEvent(eventResponse.data);

          // Check if user is the organizer of this event
          if (
            eventResponse.data.organizerId &&
            user &&
            user._id === eventResponse.data.organizerId._id
          ) {
            setIsOrganizer(true);
          }

          // Check if the current volunteer is registered for this event
          if (
            user &&
            user.role === "volunteer" &&
            eventResponse.data.registeredVolunteers
          ) {
            const registration = eventResponse.data.registeredVolunteers.find(
              (reg) => reg.volunteer && reg.volunteer.toString() === user._id
            );

            if (registration) {
              setUserRegistration({
                isRegistered: true,
                status: registration.status,
                applicationId: registration._id,
              });
            }
          }
        } else {
          throw new Error(eventResponse.message || "Failed to load event");
        }

        // Try to fetch volunteer profile
        if (user && user.role === "volunteer") {
          try {
            const profileResponse = await volunteerApi.getProfile();
            if (profileResponse.success) {
              setVolunteerProfile(profileResponse.data);
            }
          } catch (error) {
            console.error("Error fetching volunteer profile:", error);
            // Continue even if profile fetch fails
          }
        }
      } catch (error) {
        const errorMessage = error.message || "Error loading event details";
        toast.error(errorMessage);
        console.error("Error fetching event:", error);
        navigate("/dashboard/events");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchEventDetails();
    }
  }, [id, navigate, user, isAuthenticated]);

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const shareEvent = () => {
    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: event.title,
          text: `Check out this volunteer opportunity: ${event.title}`,
          url: url,
        })
        .then(() => console.log("Share successful"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      // Fallback
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success("Event link copied to clipboard!");
        })
        .catch((err) => {
          toast.error("Failed to copy link");
        });
    }
  };

  const fetchVolunteerList = async () => {
    setShowVolunteers(!showVolunteers);

    if (!showVolunteers && volunteersSignedUp.length === 0) {
      try {
        const response = await eventApi.getAttendees(id);

        if (response.success) {
          setVolunteersSignedUp(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch volunteers");
        }
      } catch (error) {
        console.error("Error fetching volunteers:", error);
        toast.error("Failed to load volunteer list");
      }
    }
  };

  const handleWithdrawFromEvent = async () => {
    try {
      if (!isAuthenticated || !user || user.role !== "volunteer") {
        toast.error(
          "You must be logged in as a volunteer to withdraw from events"
        );
        return;
      }

      setWithdrawing(true);

      // Ask for confirmation and reason
      const result = await Swal.fire({
        title: "Withdraw from Event",
        text: "Are you sure you want to withdraw from this event? This action cannot be undone.",
        icon: "warning",
        input: "textarea",
        inputLabel: "Reason (optional)",
        inputPlaceholder: "Please provide a reason for withdrawing...",
        showCancelButton: true,
        confirmButtonText: "Withdraw",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f97316",
      });

      if (result.isConfirmed) {
        // Call the API to withdraw from the event
        const response = await volunteerApi.withdrawFromEvent(id, result.value);

        if (response.success) {
          // Update local state
          setUserRegistration({
            ...userRegistration,
            status: "withdrawn",
          });

          toast.success("Successfully withdrawn from the event");
        } else {
          throw new Error(response.message || "Failed to withdraw from event");
        }
      }
    } catch (error) {
      console.error("Error withdrawing from event:", error);
      toast.error(
        error.message || "An error occurred while withdrawing from the event"
      );
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <svg
            className="h-24 w-24 text-gray-300 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Event not found
          </h2>
          <p className="text-gray-500 mb-8">
            This event may have been removed or is no longer available.
          </p>
          <Link
            to="/dashboard/events"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Explore Other Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/dashboard/events"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Events
        </Link>
      </div>

      {/* Event Header Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="bg-white/20 rounded-full px-4 py-1.5 text-sm flex items-center">
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(event.startDate)}
              </div>
              <div
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  event.status === "Upcoming"
                    ? "bg-green-600"
                    : event.status === "Ongoing"
                    ? "bg-blue-600"
                    : event.status === "Completed"
                    ? "bg-gray-600"
                    : "bg-red-600"
                }`}
              >
                {event.status}
              </div>
              <div className="bg-white/20 rounded-full px-4 py-1.5 text-sm">
                {event.category}
              </div>
            </div>
            <p className="text-white/80 text-lg mb-8">
              Organized by{" "}
              <span className="font-semibold">
                {event.organizerId?.name || "Unknown"}
              </span>
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={shareEvent}
                className="flex items-center bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 16.684a1 1 0 001.414 0l2.828-2.828a1 1 0 10-1.414-1.414l-2.828 2.828a1 1 0 000 1.414zM8.684 7.316a1 1 0 10-1.414 0l-2.828 2.828a1 1 0 101.414 1.414l2.828-2.828a1 1 0 000-1.414z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3a9 9 0 100 18 9 9 0 000-18z"
                  />
                </svg>
                Share Event
              </button>
              {isOrganizer && (
                <Link
                  to={`/dashboard/events/${id}/edit`}
                  className="flex items-center bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm font-medium"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Event
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 w-full md:w-72">
            <h3 className="text-lg font-semibold mb-4">Volunteer Stats</h3>
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-sm font-medium">Spots filled:</span>
              <span className="text-xl font-bold">
                {event.volunteersRegistered} / {event.volunteersNeeded}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5 mb-4">
              <div
                className="bg-white h-2.5 rounded-full"
                style={{
                  width: `${Math.min(
                    (event.volunteersRegistered / event.volunteersNeeded) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
            <button
              onClick={fetchVolunteerList}
              className="w-full mt-4 bg-white text-indigo-600 font-medium py-2.5 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              {showVolunteers ? "Hide" : "View"} Volunteers
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                About This Event
              </h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>{event.description}</p>
              </div>
            </div>
          </div>

          {/* Skills Required */}
          {event.skillsRequired && event.skillsRequired.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Skills Needed
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Volunteer List */}
          {showVolunteers && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Registered Volunteers
                </h2>
                {volunteersSignedUp.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <svg
                      className="h-16 w-16 text-gray-300 mx-auto mb-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-gray-500 text-lg">
                      No volunteers have signed up yet.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {volunteersSignedUp.map((volunteer) => (
                      <li
                        key={volunteer.id}
                        className="py-4 flex items-center gap-4"
                      >
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {volunteer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {volunteer.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {volunteer.email}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Event Details Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Event Details
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Date & Time
                    </h3>
                    <p className="mt-1 text-gray-800 font-medium">
                      {formatDate(event.startDate)}
                      {event.startDate !== event.endDate &&
                        ` - ${formatDate(event.endDate)}`}
                    </p>
                    <p className="text-gray-700">
                      {formatTime(event.startDate)} -{" "}
                      {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Location
                    </h3>
                    {event.location && (
                      <div className="mt-1">
                        <p className="text-gray-800 font-medium">
                          {event.location.address}
                        </p>
                        <p className="text-gray-700">
                          {event.location.city}, {event.location.state}{" "}
                          {event.location.zipCode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-lg w-12 h-12 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Organized by
                    </h3>
                    <p className="mt-1 text-gray-800 font-medium">
                      {event.organizerId?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md overflow-hidden">
            <div className="p-8 text-white">
              <h2 className="text-xl font-bold mb-4">Ready to volunteer?</h2>
              <p className="mb-6 opacity-90">
                Join this event and make a difference in your community.
              </p>

              {/* Show registration status or actions */}
              {user && user.role === "volunteer" && (
                <>
                  {userRegistration.isRegistered ? (
                    <div className="space-y-4">
                      <div className="bg-white/10 p-3 rounded-lg text-center">
                        <p className="font-medium">
                          Your Status:{" "}
                          <span className="text-white capitalize">
                            {userRegistration.status}
                          </span>
                        </p>
                      </div>

                      {userRegistration.status === "approved" && (
                        <button
                          onClick={handleWithdrawFromEvent}
                          disabled={withdrawing}
                          className="w-full bg-orange-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {withdrawing ? (
                            <span className="flex items-center justify-center">
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            "Withdraw from Event"
                          )}
                        </button>
                      )}

                      {userRegistration.status === "withdrawn" && (
                        <p className="text-center text-white/80 italic">
                          You have withdrawn from this event.
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      className="w-full bg-white text-indigo-600 font-medium py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                      onClick={() => navigate(`/events/${id}/apply`)}
                    >
                      Apply to Volunteer
                    </button>
                  )}
                </>
              )}

              {!user || user.role !== "volunteer" ? (
                <button
                  className="w-full bg-white text-indigo-600 font-medium py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                  onClick={() => navigate("/dashboard/events")}
                >
                  Find More Opportunities
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
