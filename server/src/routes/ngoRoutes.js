const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeRoles } = require("../middlewares/auth");
const userController = require("../controllers/userController");
const eventController = require("../controllers/eventController");
const Event = require("../models/eventSchema");
const User = require("../models/userSchema");
const EventApplication = require("../models/eventApplicationSchema");

// All NGO routes require authentication and NGO role
router.use(authenticateUser);
router.use(authorizeRoles("ngo", "admin"));

// NGO Profile routes
router.get("/profile", userController.getNgoProfile);
router.put("/profile", userController.updateNgoProfile);

// Dashboard statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    // Get the NGO's ID from the authenticated user
    const ngoId = req.user.id;

    // Get total events created by this NGO
    const totalEvents = await Event.countDocuments({ organizerId: ngoId });

    // Get active events (upcoming or ongoing)
    const activeEvents = await Event.countDocuments({
      organizerId: ngoId,
      status: { $in: ["Upcoming", "Ongoing"] },
    });

    // Get volunteers who participated in this NGO's events
    const eventsWithVolunteers = await Event.find({
      organizerId: ngoId,
    }).select("registeredVolunteers");

    // Extract unique volunteer IDs from all events
    const uniqueVolunteerIds = new Set();
    let totalVolunteersCount = 0;
    let activeVolunteersCount = 0;
    let totalHours = 0;

    eventsWithVolunteers.forEach((event) => {
      if (event.registeredVolunteers && event.registeredVolunteers.length) {
        event.registeredVolunteers.forEach((registration) => {
          if (registration.volunteer) {
            uniqueVolunteerIds.add(registration.volunteer.toString());
            totalVolunteersCount++;
            if (registration.status === "approved") {
              activeVolunteersCount++;
            }
          }
        });
      }
    });

    // Get pending applications
    const pendingApplications = await Event.countDocuments({
      organizerId: ngoId,
      "registeredVolunteers.status": "pending",
    });

    // Get volunteer participation data for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Return the statistics
    res.status(200).json({
      success: true,
      totalEvents,
      activeEvents,
      totalVolunteers: uniqueVolunteerIds.size,
      activeVolunteers: activeVolunteersCount,
      totalHours,
      pendingApplications,
      eventsByMonth: [3, 5, 4, 6, 8, 7], // Placeholder data
      volunteersByMonth: [12, 19, 15, 20, 30, 25], // Placeholder data
    });
  } catch (error) {
    console.error("Error getting NGO dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard statistics",
    });
  }
});

// Events routes
router.get("/events", eventController.getMyEvents);
router.get("/events/:id", eventController.getEventById);
router.post("/events", eventController.createEvent);
router.put("/events/:id", eventController.updateEvent);
router.delete("/events/:id", eventController.deleteEvent);

// Volunteers routes
router.get("/volunteers", async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get the NGO's ID from the authenticated user
    const ngoId = req.user.id;

    // Find all events created by this NGO
    const ngoEvents = await Event.find({ organizerId: ngoId });

    // Extract volunteer IDs from all events
    const volunteerIds = new Set();
    ngoEvents.forEach((event) => {
      if (event.registeredVolunteers && event.registeredVolunteers.length) {
        event.registeredVolunteers.forEach((registration) => {
          if (registration.volunteer) {
            volunteerIds.add(registration.volunteer.toString());
          }
        });
      }
    });

    // Get filter params
    const search = req.query.search;

    // Build filter query
    const filter = {
      _id: { $in: Array.from(volunteerIds) },
      role: "volunteer",
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get volunteers and count
    const totalCount = await User.countDocuments(filter);
    const volunteers = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Send response
    res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      volunteers,
    });
  } catch (error) {
    console.error("Error getting volunteers for NGO:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteers",
    });
  }
});

router.get("/volunteers/:id", async (req, res) => {
  try {
    const volunteerId = req.params.id;
    const volunteer = await User.findOne({
      _id: volunteerId,
      role: "volunteer",
    });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    res.status(200).json({
      success: true,
      volunteer,
    });
  } catch (error) {
    console.error("Error getting volunteer details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteer details",
    });
  }
});

// Get volunteer event history (events they've participated in)
router.get("/volunteers/:id/events", async (req, res) => {
  try {
    const volunteerId = req.params.id;

    // First verify the volunteer exists
    const volunteer = await User.findOne({
      _id: volunteerId,
      role: "volunteer",
    });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }

    // Find events this volunteer has participated in
    // This implementation would depend on your data model
    // For example, if you have an EventApplication or Attendance model
    const applications = await EventApplication.find({
      volunteer: volunteerId,
      status: { $in: ["approved", "completed"] },
    }).populate("event");

    // Extract the events with relevant information
    const events = applications.map((app) => ({
      id: app.event._id,
      title: app.event.title,
      date: app.event.date,
      status: app.status === "completed" ? "Completed" : "Approved",
      hours: app.hoursContributed || app.event.duration || 0,
    }));

    res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Error getting volunteer events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch volunteer event history",
    });
  }
});

// Applications routes
router.get("/applications", async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get the NGO's ID from the authenticated user
    const ngoId = req.user.id;

    // Build filter query
    const filter = { ngo: ngoId };

    // Add status filter if provided
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    // Add search filter if provided
    if (req.query.search) {
      // We'll need to join with the event and volunteer (user) collections
      // This is a simplified approach - in a production environment,
      // you might want to use aggregation for more complex queries
    }

    // Get applications and count
    const totalCount = await EventApplication.countDocuments(filter);

    // Query applications with populated references
    let applications = await EventApplication.find(filter)
      .populate("event", "title date location")
      .populate("volunteer", "name email profile")
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(limit);

    // Process applications to ensure they have the required structure
    // This prevents null reference errors on the client side
    applications = applications.map((application) => {
      // Convert to plain object so we can modify it safely
      const app = application.toObject();

      // Ensure volunteer data exists
      if (!app.volunteer) {
        app.volunteer = {
          name: "Unknown Volunteer",
          email: "No email provided",
          profile: {},
        };
      }

      // Ensure event data exists
      if (!app.event) {
        app.event = {
          title: "Unknown Event",
          date: new Date(),
        };
      }

      return app;
    });

    // Send response
    res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      applications,
    });
  } catch (error) {
    console.error("Error getting applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
});

// Get count of pending applications
router.get("/applications/pending/count", async (req, res) => {
  try {
    // Get the NGO's ID from the authenticated user
    const ngoId = req.user.id;

    // Count pending applications for this NGO
    const count = await EventApplication.countDocuments({
      ngo: ngoId,
      status: "pending",
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error counting pending applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to count pending applications",
    });
  }
});

router.get("/applications/:id", async (req, res) => {
  try {
    const applicationId = req.params.id;
    const ngoId = req.user.id;

    // Find the application with populated references
    const application = await EventApplication.findOne({
      _id: applicationId,
      ngo: ngoId,
    })
      .populate("event", "title date location description")
      .populate("volunteer", "name email profile volunteerInfo");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Error getting application details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application details",
    });
  }
});

router.put("/applications/:id/approve", async (req, res) => {
  try {
    const applicationId = req.params.id;
    const ngoId = req.user.id;

    // Find the application
    const application = await EventApplication.findOne({
      _id: applicationId,
      ngo: ngoId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application status
    application.status = "approved";
    application.responseDate = new Date();

    // Add response notes if provided
    if (req.body.notes) {
      application.notes = req.body.notes;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      application,
    });
  } catch (error) {
    console.error("Error approving application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve application",
    });
  }
});

router.put("/applications/:id/reject", async (req, res) => {
  try {
    const applicationId = req.params.id;
    const ngoId = req.user.id;
    const { reason } = req.body;

    // Find the application
    const application = await EventApplication.findOne({
      _id: applicationId,
      ngo: ngoId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application status
    application.status = "rejected";
    application.responseDate = new Date();

    // Add rejection reason if provided
    if (reason) {
      application.notes = reason;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      application,
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject application",
    });
  }
});

// Withdraw a volunteer application
router.put("/applications/:id/withdraw", async (req, res) => {
  try {
    const applicationId = req.params.id;
    const ngoId = req.user.id;
    const { reason } = req.body;

    // Find the application
    const application = await EventApplication.findOne({
      _id: applicationId,
      ngo: ngoId,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application status
    application.status = "withdrawn";
    application.responseDate = new Date();

    // Add withdrawal reason if provided
    if (reason) {
      application.notes = reason;
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: "Volunteer application withdrawn successfully",
      application,
    });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to withdraw application",
    });
  }
});

// Messaging/feedback
router.post("/volunteers/:id/feedback", async (req, res) => {
  try {
    const { message } = req.body;
    const volunteerId = req.params.id;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // Here you would implement your messaging logic
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending message to volunteer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

module.exports = router;
