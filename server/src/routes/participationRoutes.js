const express = require("express");
const router = express.Router();
const participationController = require("../controllers/participationController");
const {
  authenticateUser,
  authorizeCapabilities,
} = require("../middlewares/auth");

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Volunteer routes - accessible to anyone with volunteer capabilities
router.post(
  "/register",
  authorizeCapabilities("volunteer"),
  participationController.registerForEvent
);
router.get(
  "/volunteer",
  authorizeCapabilities("volunteer"),
  participationController.getVolunteerRegistrations
);
router.delete(
  "/:id",
  authorizeCapabilities("volunteer"),
  participationController.cancelRegistration
);
router.put(
  "/:id/withdraw",
  authorizeCapabilities("volunteer"),
  participationController.withdrawFromParticipation
);

// NGO routes - accessible to anyone with NGO capabilities
router.get(
  "/event/:eventId",
  authorizeCapabilities("ngo"),
  participationController.getEventParticipations
);
router.put(
  "/checkin/:id",
  authorizeCapabilities("ngo"),
  participationController.checkInVolunteer
);
router.put(
  "/checkout/:id",
  authorizeCapabilities("ngo"),
  participationController.checkOutVolunteer
);

// Admin routes - only accessible to admins
router.get(
  "/",
  authorizeCapabilities("admin"),
  participationController.getAllParticipations
);

module.exports = router;
