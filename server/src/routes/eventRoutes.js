const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeRoles } = require("../middlewares/auth");
const eventController = require("../controllers/eventController");

// Public routes
// Get all events - public
router.get("/", eventController.getAllEvents);

// Get a single event - public
router.get("/:id", eventController.getEventById);

// Protected routes
// Apply authentication to all routes below
router.use(authenticateUser);

// Create a new event - NGO and admin only
router.post(
  "/",
  authorizeRoles("ngo", "admin"),
  eventController.createEvent
);

// Update event - authenticated and owner (NGO) or admin
router.put(
  "/:id",
  authorizeRoles("ngo", "admin"),
  eventController.updateEvent
);

// Delete event - authenticated and owner (NGO) or admin
router.delete(
  "/:id",
  authorizeRoles("ngo", "admin"),
  eventController.deleteEvent
);

// Get events created by current NGO - NGO and admin only
router.get(
  "/my-events",
  authorizeRoles("ngo", "admin"),
  eventController.getMyEvents
);

// Get NGO events with pagination and filtering - NGO dashboard endpoint
router.get(
  "/ngo/dashboard",
  authorizeRoles("ngo", "admin"),
  eventController.getNGODashboardEvents
);

// POST register for an event (Volunteer only)
router.post('/:id/register', authorizeRoles("volunteer"), eventController.registerForEvent);

// GET all events for an NGO
router.get('/ngo/:ngoId', eventController.getEventsByNGO);

module.exports = router; 