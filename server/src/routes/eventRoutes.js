const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeRoles } = require("../middlewares/auth");
const eventController = require("../controllers/eventController");
const EventApplication = require("../models/eventApplicationSchema");
const Event = require("../models/eventSchema");
const Participation = require("../models/participationSchema");
const Shift = require("../models/shiftSchema");

// Create a router for public endpoints
const publicRouter = express.Router();

// ******* PUBLIC ROUTES *******
// Get all events - public
publicRouter.get("/", eventController.getAllEvents);

// Get a single event - public
publicRouter.get("/:id([0-9a-fA-F]{24})", eventController.getEventById);

// Apply the public routes
router.use(publicRouter);

// ******* PROTECTED ROUTES *******
// Apply authentication middleware to all routes below
router.use(authenticateUser);

// Special routes that must be defined BEFORE generic ID routes
router.get(
  "/:id([0-9a-fA-F]{24})/attendees",
  eventController.getEventAttendees
);

// NGO routes
router.get(
  "/my-events",
  authorizeRoles("ngo", "admin"),
  eventController.getMyEvents
);
router.get(
  "/ngo/dashboard",
  authorizeRoles("ngo", "admin"),
  eventController.getNGODashboardEvents
);
router.get("/ngo/:ngoId", eventController.getEventsByNGO);

// CRUD operations
router.post("/", authorizeRoles("ngo", "admin"), eventController.createEvent);
router.put("/:id", authorizeRoles("ngo", "admin"), eventController.updateEvent);
router.delete(
  "/:id",
  authorizeRoles("ngo", "admin"),
  eventController.deleteEvent
);

// Registration routes
router.post(
  "/:id/register",
  authorizeRoles("volunteer"),
  eventController.registerForEvent
);
router.post(
  "/:id/apply",
  authorizeRoles("volunteer"),
  eventController.registerForEvent
);

// Withdraw application route for volunteers
router.put(
  "/applications/:id/withdraw",
  authorizeRoles("volunteer"),
  async (req, res) => {
    try {
      const applicationId = req.params.id;
      const volunteerId = req.user.id;

      // Find the application
      const application = await EventApplication.findOne({
        _id: applicationId,
        volunteer: volunteerId,
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
      if (req.body.reason) {
        application.notes = req.body.reason;
      }

      await application.save();

      res.status(200).json({
        success: true,
        message: "Application withdrawn successfully",
        application,
      });
    } catch (error) {
      console.error("Error withdrawing application:", error);
      res.status(500).json({
        success: false,
        message: "Failed to withdraw application",
      });
    }
  }
);

// Get volunteer's applications
router.get("/applications", authorizeRoles("volunteer"), async (req, res) => {
  try {
    const volunteerId = req.user.id;

    // Find applications made by this volunteer
    const applications = await EventApplication.find({
      volunteer: volunteerId,
    })
      .populate("event", "title date location organizerId status")
      .populate("ngo", "name profile")
      .sort({ applicationDate: -1 });

    // Process applications to ensure they have the required structure
    const processedApplications = applications.map((app) => {
      const appObj = app.toObject();

      // Add organization name if available
      if (appObj.ngo && appObj.ngo.name) {
        if (!appObj.event) appObj.event = {};
        appObj.event.organizationName = appObj.ngo.name;
      }

      return appObj;
    });

    res.status(200).json({
      success: true,
      applications: processedApplications,
    });
  } catch (error) {
    console.error("Error fetching volunteer applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
});

// Volunteer withdrawal from an event (after being approved)
router.put(
  "/:eventId/withdraw-participation",
  authorizeRoles("volunteer"),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const volunteerId = req.user.id;
      const { reason } = req.body;

      // Find the event
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Find the volunteer's registration in the event
      if (
        !event.registeredVolunteers ||
        !Array.isArray(event.registeredVolunteers)
      ) {
        return res.status(404).json({
          success: false,
          message: "You are not registered for this event",
        });
      }

      const volunteerIndex = event.registeredVolunteers.findIndex(
        (reg) =>
          reg.volunteer &&
          reg.volunteer.toString() === volunteerId &&
          reg.status === "approved"
      );

      if (volunteerIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "You are not approved for this event",
        });
      }

      // Update the volunteer's status to "withdrawn"
      event.registeredVolunteers[volunteerIndex].status = "withdrawn";
      event.registeredVolunteers[volunteerIndex].notes =
        reason || "Volunteer withdrew from the event";
      event.registeredVolunteers[volunteerIndex].updatedAt = new Date();

      await event.save();

      // Also update the application if it exists
      const application = await EventApplication.findOne({
        event: eventId,
        volunteer: volunteerId,
        status: "approved",
      });

      if (application) {
        application.status = "withdrawn";
        application.notes = reason || "Volunteer withdrew from the event";
        application.responseDate = new Date();
        await application.save();
      }

      res.status(200).json({
        success: true,
        message: "Successfully withdrawn from the event",
      });
    } catch (error) {
      console.error("Error withdrawing from event:", error);
      res.status(500).json({
        success: false,
        message: "Failed to withdraw from event",
      });
    }
  }
);

// NGO removing a volunteer from an event
router.put(
  "/:eventId/remove-volunteer/:volunteerId",
  authorizeRoles("ngo", "admin"),
  async (req, res) => {
    try {
      const { eventId, volunteerId } = req.params;
      const ngoId = req.user.id;
      const { reason } = req.body;

      // Find the event and verify it belongs to this NGO
      const event = await Event.findOne({
        _id: eventId,
        organizerId: ngoId,
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found or you don't have permission to manage it",
        });
      }

      // Find the volunteer's registration in the event
      if (
        !event.registeredVolunteers ||
        !Array.isArray(event.registeredVolunteers)
      ) {
        return res.status(404).json({
          success: false,
          message: "Volunteer is not registered for this event",
        });
      }

      const volunteerIndex = event.registeredVolunteers.findIndex(
        (reg) => reg.volunteer && reg.volunteer.toString() === volunteerId
      );

      if (volunteerIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Volunteer is not registered for this event",
        });
      }

      // Update the volunteer's status to "removed"
      event.registeredVolunteers[volunteerIndex].status = "removed";
      event.registeredVolunteers[volunteerIndex].notes =
        reason || "Removed by event organizer";
      event.registeredVolunteers[volunteerIndex].updatedAt = new Date();

      await event.save();

      // Also update the application if it exists
      const application = await EventApplication.findOne({
        event: eventId,
        volunteer: volunteerId,
      });

      if (application) {
        application.status = "removed";
        application.notes = reason || "Removed by event organizer";
        application.responseDate = new Date();
        await application.save();
      }

      res.status(200).json({
        success: true,
        message: "Volunteer removed from the event successfully",
      });
    } catch (error) {
      console.error("Error removing volunteer from event:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove volunteer from event",
      });
    }
  }
);

// Remove volunteer from event (NGO only)
router.delete(
  "/:id/volunteers/:volunteerId",
  authorizeRoles("ngo"),
  async (req, res) => {
    try {
      const { id: eventId, volunteerId } = req.params;
      const ngoId = req.user.id;
      const { reason } = req.body;

      // Check if the event belongs to the NGO
      const event = await Event.findOne({ _id: eventId, ngo: ngoId });
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found or you do not have permission",
        });
      }

      // Find the participation record
      const participation = await Participation.findOne({
        eventId,
        volunteerId,
        status: "Confirmed",
      });

      if (!participation) {
        return res.status(404).json({
          success: false,
          message: "Volunteer not found in this event",
        });
      }

      // Update participation status
      participation.status = "Removed";
      if (reason) {
        participation.notes = reason;
      }
      await participation.save();

      // Decrement event volunteers count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { volunteersRegistered: -1 },
      });

      // If shift exists, remove volunteer from shift
      if (participation.shiftId) {
        await Shift.findByIdAndUpdate(participation.shiftId, {
          $pull: { volunteers: { volunteerId } },
        });
      }

      // Notify the volunteer
      // TODO: Send notification to volunteer

      res.status(200).json({
        success: true,
        message: "Volunteer removed from event successfully",
      });
    } catch (error) {
      console.error("Error removing volunteer from event:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove volunteer from event",
      });
    }
  }
);

module.exports = router;
