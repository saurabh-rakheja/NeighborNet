const Registration = require("../models/registrationSchema");
const Event = require("../models/eventSchema");
const User = require("../models/userSchema");

/**
 * Registration Controller
 * Handles all operations related to event registrations
 */

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private (Volunteer)
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId, motivationLetter, skillsRelevance } = req.body;
    const volunteerId = req.user.id;

    // Validate request
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    // Check if volunteer role
    if (req.user.role !== "volunteer") {
      return res.status(403).json({
        success: false,
        message: "Only volunteers can register for events",
      });
    }

    // Check if volunteer is verified
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    // Check if volunteer profile is complete
    if (!volunteer.volunteerInfo || !volunteer.profile) {
      return res.status(400).json({
        success: false,
        message: "Please complete your profile before registering for events",
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event is active and upcoming
    if (event.status !== "Upcoming") {
      return res.status(400).json({
        success: false,
        message: "Cannot register for past, ongoing, or cancelled events",
      });
    }

    // Check if event is full
    if (event.volunteersRegistered >= event.volunteersNeeded) {
      return res.status(400).json({
        success: false,
        message: "This event is already at capacity",
      });
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      volunteerId,
      eventId,
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Create registration
    const registration = new Registration({
      eventId,
      volunteerId,
      organizerId: event.organizerId,
      status: event.requiresApproval ? "Pending" : "Approved",
      motivationLetter:
        motivationLetter || "Interested in volunteering for this event",
      skillsRelevance: skillsRelevance || "",
    });

    await registration.save();

    // Update event volunteers count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { volunteersRegistered: 1 },
    });

    res.status(201).json({
      success: true,
      data: registration,
      message: event.requiresApproval
        ? "Registration submitted. Awaiting approval from the organizer."
        : "Successfully registered for the event",
    });
  } catch (error) {
    console.error("Error in registerForEvent:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get all of a volunteer's registrations
// @route   GET /api/registrations/volunteer
// @access  Private (Volunteer)
exports.getVolunteerRegistrations = async (req, res) => {
  try {
    const volunteerId = req.user.id;
    const { status } = req.query;

    // Check if volunteer role
    if (req.user.role !== "volunteer") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Build query
    const query = { volunteerId };
    if (status) {
      query.status = status;
    }

    // Use the static method from the schema
    const registrations = await Registration.getVolunteerRegistrations(
      volunteerId
    );

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Error in getVolunteerRegistrations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get all registrations for an event
// @route   GET /api/registrations/event/:eventId
// @access  Private (NGO, Admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.query;

    // Check if NGO or admin role
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // If NGO, check if they own the event
    if (req.user.role === "ngo") {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      if (event.organizerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view registrations for this event",
        });
      }
    }

    // Build query
    const query = { eventId };
    if (status) {
      query.status = status;
    }

    // Use the static method from the schema
    const registrations = await Registration.getEventRegistrations(eventId);

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Error in getEventRegistrations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update registration status (approve/reject)
// @route   PATCH /api/registrations/:id/status
// @access  Private (NGO, Admin)
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate request
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    // Check if valid status
    const validStatuses = ["Approved", "Rejected", "Withdrawn", "No-Show"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Find the registration
    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check authorization
    if (
      req.user.role === "ngo" &&
      registration.organizerId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this registration",
      });
    }

    // Update registration
    registration.status = status;
    registration.responseDate = new Date();
    if (notes) {
      registration.notes = notes;
    }

    await registration.save();

    // Handle volunteer count for rejections or withdrawals
    if (status === "Rejected" || status === "Withdrawn") {
      await Event.findByIdAndUpdate(registration.eventId, {
        $inc: { volunteersRegistered: -1 },
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
      message: `Registration ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Error in updateRegistrationStatus:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Check in a volunteer
// @route   POST /api/registrations/:id/check-in
// @access  Private (NGO, Admin)
exports.checkInVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the registration
    const registration = await Registration.findById(id)
      .populate("eventId", "title startDate endDate organizerId")
      .populate("volunteerId", "name email");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check authorization
    if (
      req.user.role === "ngo" &&
      registration.organizerId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to check in this volunteer",
      });
    }

    // Check if registration is approved
    if (registration.status !== "Approved") {
      return res.status(400).json({
        success: false,
        message: `Cannot check in a volunteer with status: ${registration.status}`,
      });
    }

    // Use the model method to check in
    await registration.checkIn();

    res.status(200).json({
      success: true,
      data: registration,
      message: `${registration.volunteerId.name} checked in successfully`,
    });
  } catch (error) {
    console.error("Error in checkInVolunteer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Check out a volunteer
// @route   POST /api/registrations/:id/check-out
// @access  Private (NGO, Admin)
exports.checkOutVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { hoursLogged } = req.body;

    // Find the registration
    const registration = await Registration.findById(id)
      .populate("eventId", "title")
      .populate("volunteerId", "name email");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check authorization
    if (
      req.user.role === "ngo" &&
      registration.organizerId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to check out this volunteer",
      });
    }

    // Check if volunteer is checked in
    if (registration.status !== "Attended") {
      return res.status(400).json({
        success: false,
        message: "Volunteer must be checked in before checking out",
      });
    }

    // Use the model method to check out
    await registration.checkOut(hoursLogged);

    res.status(200).json({
      success: true,
      data: registration,
      message: `${registration.volunteerId.name} checked out successfully with ${registration.hoursLogged} hours logged`,
    });
  } catch (error) {
    console.error("Error in checkOutVolunteer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Submit feedback for an event
// @route   POST /api/registrations/:id/feedback
// @access  Private (Volunteer, NGO)
exports.submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback, rating } = req.body;

    // Validate request
    if (!feedback || !rating) {
      return res.status(400).json({
        success: false,
        message: "Feedback and rating are required",
      });
    }

    // Find the registration
    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Process based on user role
    if (req.user.role === "volunteer") {
      // Check if volunteer owns this registration
      if (registration.volunteerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to submit feedback for this registration",
        });
      }

      registration.volunteerFeedback = feedback;
      registration.volunteerRating = rating;
    } else if (req.user.role === "ngo") {
      // Check if NGO is the organizer
      if (registration.organizerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to submit feedback for this registration",
        });
      }

      registration.organizerFeedback = feedback;
      registration.organizerRating = rating;
    } else {
      return res.status(403).json({
        success: false,
        message: "Only volunteers and organizers can submit feedback",
      });
    }

    await registration.save();

    res.status(200).json({
      success: true,
      data: registration,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Error in submitFeedback:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Issue certificate for a completed registration
// @route   POST /api/registrations/:id/certificate
// @access  Private (NGO, Admin)
exports.issueCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { certificateId, downloadUrl } = req.body;

    // Find the registration
    const registration = await Registration.findById(id)
      .populate("volunteerId", "name email")
      .populate("eventId", "title");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check authorization
    if (
      req.user.role === "ngo" &&
      registration.organizerId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to issue certificate for this registration",
      });
    }

    // Check if registration is completed
    if (registration.status !== "Completed") {
      return res.status(400).json({
        success: false,
        message: "Can only issue certificates for completed registrations",
      });
    }

    // Update certificate information
    registration.certificate.issued = true;
    registration.certificate.issueDate = new Date();
    registration.certificate.certificateId =
      certificateId || `CERT-${Date.now()}`;
    registration.certificate.downloadUrl = downloadUrl || "";

    await registration.save();

    res.status(200).json({
      success: true,
      data: registration,
      message: `Certificate issued successfully to ${registration.volunteerId.name}`,
    });
  } catch (error) {
    console.error("Error in issueCertificate:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get a single registration by ID
// @route   GET /api/registrations/:id
// @access  Private (Volunteer, NGO, Admin)
exports.getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Registration.findById(id)
      .populate(
        "eventId",
        "title description startDate endDate location category image"
      )
      .populate(
        "volunteerId",
        "name email profile.phoneNumber profile.profilePicture"
      )
      .populate("organizerId", "name profile.organization");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Authorization check
    if (
      req.user.role === "volunteer" &&
      registration.volunteerId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this registration",
      });
    }

    if (
      req.user.role === "ngo" &&
      registration.organizerId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this registration",
      });
    }

    res.status(200).json({
      success: true,
      data: registration,
    });
  } catch (error) {
    console.error("Error in getRegistrationById:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Cancel/withdraw from an event
// @route   DELETE /api/registrations/:id
// @access  Private (Volunteer)
exports.withdrawRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const volunteerId = req.user.id;

    // Find the registration
    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check if this is the volunteer's registration
    if (registration.volunteerId.toString() !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to withdraw this registration",
      });
    }

    // Check if registration can be withdrawn
    if (!["Pending", "Approved"].includes(registration.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw registration with status: ${registration.status}`,
      });
    }

    // Update registration status
    registration.status = "Withdrawn";
    if (reason) {
      registration.notes = reason;
    }

    await registration.save();

    // Decrement event volunteers count
    await Event.findByIdAndUpdate(registration.eventId, {
      $inc: { volunteersRegistered: -1 },
    });

    res.status(200).json({
      success: true,
      message: "Successfully withdrawn from the event",
    });
  } catch (error) {
    console.error("Error in withdrawRegistration:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/registrations/stats
// @access  Private (Admin, NGO)
exports.getRegistrationStats = async (req, res) => {
  try {
    // Check if user is NGO or admin
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    let query = {};

    // If NGO, only show their events
    if (req.user.role === "ngo") {
      query.organizerId = req.user.id;
    }

    // Count registrations by status
    const stats = {
      total: await Registration.countDocuments(query),
      pending: await Registration.countDocuments({
        ...query,
        status: "Pending",
      }),
      approved: await Registration.countDocuments({
        ...query,
        status: "Approved",
      }),
      attended: await Registration.countDocuments({
        ...query,
        status: "Attended",
      }),
      completed: await Registration.countDocuments({
        ...query,
        status: "Completed",
      }),
      rejected: await Registration.countDocuments({
        ...query,
        status: "Rejected",
      }),
      withdrawn: await Registration.countDocuments({
        ...query,
        status: "Withdrawn",
      }),
      noShow: await Registration.countDocuments({
        ...query,
        status: "No-Show",
      }),
    };

    // Get total volunteer hours
    const hoursResult = await Registration.aggregate([
      { $match: { ...query, status: "Completed" } },
      { $group: { _id: null, totalHours: { $sum: "$hoursLogged" } } },
    ]);

    stats.totalHours = hoursResult.length > 0 ? hoursResult[0].totalHours : 0;

    // Get recent registrations
    const recentRegistrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("eventId", "title")
      .populate("volunteerId", "name");

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentRegistrations,
      },
    });
  } catch (error) {
    console.error("Error in getRegistrationStats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
