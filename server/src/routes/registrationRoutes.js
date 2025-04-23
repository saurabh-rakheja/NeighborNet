const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const { authenticateUser, authorizeRoles } = require("../middlewares/auth");

/**
 * Registration Routes
 * All routes are protected and require authentication
 */

// Base registration operations
router.post(
  "/",
  authenticateUser,
  authorizeRoles("volunteer"),
  registrationController.registerForEvent
);
router.get(
  "/:id",
  authenticateUser,
  registrationController.getRegistrationById
);

// Volunteer-specific routes
router.get(
  "/volunteer",
  authenticateUser,
  authorizeRoles("volunteer"),
  registrationController.getVolunteerRegistrations
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("volunteer"),
  registrationController.withdrawRegistration
);

// NGO/Admin routes for event registration management
router.get(
  "/event/:eventId",
  authenticateUser,
  authorizeRoles("ngo", "admin"),
  registrationController.getEventRegistrations
);
router.patch(
  "/:id/status",
  authenticateUser,
  authorizeRoles("ngo", "admin"),
  registrationController.updateRegistrationStatus
);
router.post(
  "/:id/check-in",
  authenticateUser,
  authorizeRoles("ngo", "admin"),
  registrationController.checkInVolunteer
);
router.post(
  "/:id/check-out",
  authenticateUser,
  authorizeRoles("ngo", "admin"),
  registrationController.checkOutVolunteer
);
router.post(
  "/:id/certificate",
  authenticateUser,
  authorizeRoles("ngo", "admin"),
  registrationController.issueCertificate
);

// Feedback routes (both volunteer and NGO can submit)
router.post(
  "/:id/feedback",
  authenticateUser,
  registrationController.submitFeedback
);

// Admin/NGO dashboard statistics
router.get(
  "/stats",
  authenticateUser,
  authorizeRoles("ngo", "admin"),
  registrationController.getRegistrationStats
);

module.exports = router;
