const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeRoles } = require("../middlewares/auth");
const eventController = require("../controllers/eventController");
const Registration = require("../models/registrationSchema");
const Event = require("../models/eventSchema");
const Participation = require("../models/participationSchema");
const mongoose = require("mongoose");

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

// Registration routes - all use the new Registration model
router.post(
  "/:id/register",
  authorizeRoles("volunteer"),
  eventController.registerForEvent
);

// Legacy routes that now map to the same registration function
router.post(
  "/:id/apply",
  authorizeRoles("volunteer"),
  eventController.registerForEvent
);
router.post(
  "/:id/applications",
  authorizeRoles("volunteer"),
  eventController.registerForEvent
);

// Get volunteer's applications (registrations)
router.get("/applications", authorizeRoles("volunteer"), async (req, res) => {
  try {
    const volunteerId = req.user.id;
    console.log("Fetching registrations for volunteer ID:", volunteerId);

    // Use the Registration model instead of EventApplication
    const Registration = require("../models/registrationSchema");

    // Use the static method from our Registration model
    const registrations = await Registration.getVolunteerRegistrations(
      volunteerId
    );

    console.log(`Found ${registrations.length} registrations`);

    // Process registrations to ensure they have the required structure for frontend compatibility
    const processedRegistrations = registrations.map((reg) => {
      const regObj = reg.toObject();

      // Format for backward compatibility with the old applications structure
      return {
        _id: regObj._id,
        status: regObj.status,
        applicationDate: regObj.registrationDate || regObj.createdAt,
        motivationLetter: regObj.motivationLetter,
        skillsRelevance: regObj.skillsRelevance,
        event: regObj.eventId,
        volunteer: regObj.volunteerId,
        ngo: regObj.organizerId,
        // Include any other fields needed by the frontend
        responseDate: regObj.responseDate,
        feedback: regObj.volunteerFeedback || regObj.organizerFeedback,
        hoursLogged: regObj.hoursLogged,
        certificate: regObj.certificate,
      };
    });

    res.status(200).json({
      success: true,
      applications: processedRegistrations,
    });
  } catch (error) {
    console.error("Error fetching volunteer registrations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch registrations",
    });
  }
});

// Withdraw application/registration route for volunteers
router.put(
  "/applications/:id/withdraw",
  authorizeRoles("volunteer"),
  async (req, res) => {
    try {
      const registrationId = req.params.id;
      const volunteerId = req.user.id;
      const { reason } = req.body;

      // Use Registration model instead of EventApplication
      const Registration = require("../models/registrationSchema");

      // Find the registration
      const registration = await Registration.findOne({
        _id: registrationId,
        volunteerId: volunteerId,
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Registration not found",
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
      registration.responseDate = new Date();

      // Add withdrawal reason if provided
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
        message: "Registration withdrawn successfully",
        registration,
      });
    } catch (error) {
      console.error("Error withdrawing registration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to withdraw registration",
      });
    }
  }
);

// Volunteer withdrawal from an event (after being approved)
router.put(
  "/:eventId/withdraw-participation",
  authorizeRoles("volunteer"),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const volunteerId = req.user.id;
      const { reason } = req.body;

      // Use Registration model
      const Registration = require("../models/registrationSchema");

      // Find the registration for this event and volunteer
      const registration = await Registration.findOne({
        eventId,
        volunteerId,
        status: { $in: ["Approved", "Pending", "Attended"] },
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "You are not registered for this event",
        });
      }

      // Update the registration status
      registration.status = "Withdrawn";
      if (reason) {
        registration.notes = reason;
      }
      registration.responseDate = new Date();

      await registration.save();

      // Update the event's volunteer count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { volunteersRegistered: -1 },
      });

      res.status(200).json({
        success: true,
        message: "Successfully withdrawn from the event",
        data: registration,
      });
    } catch (error) {
      console.error("Error withdrawing from event:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to withdraw from event",
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

      // Find the registration using the Registration model
      const registration = await Registration.findOne({
        eventId,
        volunteerId,
        status: { $in: ["Pending", "Approved", "Attended"] },
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Volunteer is not registered for this event",
        });
      }

      // Update the registration status to "Rejected"
      registration.status = "Rejected";
      registration.notes = reason || "Removed by event organizer";
      registration.responseDate = new Date();

      await registration.save();

      // Decrement event volunteers count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { volunteersRegistered: -1 },
      });

      res.status(200).json({
        success: true,
        message: "Volunteer removed from the event successfully",
        data: registration,
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
      const event = await Event.findOne({ _id: eventId, organizerId: ngoId });
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found or you do not have permission",
        });
      }

      // Find the registration with the new Registration model
      const registration = await Registration.findOne({
        eventId,
        volunteerId,
        status: { $in: ["Pending", "Approved", "Attended"] },
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Volunteer not found in this event",
        });
      }

      // Update registration status
      registration.status = "Rejected";
      if (reason) {
        registration.notes = reason;
      }
      registration.responseDate = new Date();

      await registration.save();

      // Decrement event volunteers count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { volunteersRegistered: -1 },
      });

      res.status(200).json({
        success: true,
        message: "Volunteer removed from event successfully",
        data: registration,
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

// Get volunteer's applications with extended debug info
router.get(
  "/volunteer-applications",
  authorizeRoles("volunteer"),
  async (req, res) => {
    try {
      const volunteerId = req.user.id;
      console.log(
        "Fetching volunteer registrations with more debug info:",
        volunteerId
      );

      // Find the user to confirm it exists
      const User = mongoose.model("User");
      const volunteer = await User.findById(volunteerId);
      if (!volunteer) {
        return res.status(400).json({
          success: false,
          message: "Volunteer not found",
          debug: { volunteerId },
        });
      }

      // Find registrations for this volunteer using Registration model
      const rawRegistrations = await Registration.find({
        volunteerId: volunteerId,
      });

      console.log(`Found ${rawRegistrations.length} raw registrations`);

      // Use the static method from Registration model for populated data
      const registrations = await Registration.getVolunteerRegistrations(
        volunteerId
      );

      console.log(`Populated ${registrations.length} registrations`);

      // Process registrations with extensive debug info
      const processedRegistrations = registrations.map((reg) => {
        const regObj = reg.toObject();

        // Format for debug compatibility with old applications structure
        const result = {
          _id: regObj._id,
          status: regObj.status,
          applicationDate: regObj.registrationDate || regObj.createdAt,
          responseDate: regObj.responseDate,
          motivationLetter: regObj.motivationLetter || "",
          skillsRelevance: regObj.skillsRelevance || "",
          notes: regObj.notes || "",
          volunteer: regObj.volunteerId,
          ngo: regObj.organizerId,
          event: regObj.eventId,
        };

        // Debug info for missing event
        if (!regObj.eventId) {
          console.warn(`Registration ${regObj._id} missing event reference`);
          result._debug = {
            missingEvent: true,
            eventId: reg.eventId,
          };
          result.event = {
            title: "Event reference missing",
            status: "unknown",
          };
        } else {
          // Add organization name if available
          if (regObj.organizerId && regObj.organizerId.name) {
            if (!result.event) result.event = {};
            result.event.organizationName = regObj.organizerId.name;
          }

          // Make sure the date field exists for backwards compatibility
          if (regObj.eventId && regObj.eventId.startDate) {
            if (!result.event) result.event = {};
            result.event.date = regObj.eventId.startDate;
          }
        }

        return result;
      });

      res.status(200).json({
        success: true,
        applications: processedRegistrations,
        debug: {
          rawCount: rawRegistrations.length,
          populatedCount: registrations.length,
          volunteerId: volunteerId,
        },
      });
    } catch (error) {
      console.error(
        "Error fetching volunteer registrations with debug:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to fetch registrations",
        error: error.message,
      });
    }
  }
);

module.exports = router;
