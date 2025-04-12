const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeRoles } = require("../middlewares/auth");
const volunteerController = require("../controllers/volunteerController");

// Create volunteer profile - requires authentication
router.post(
  "/profile",
  authenticateUser,
  volunteerController.createVolunteerProfile
);

// Get current volunteer's profile
router.get(
  "/profile",
  authenticateUser,
  volunteerController.getVolunteerProfile
);

// Update volunteer profile
router.put(
  "/profile",
  authenticateUser,
  volunteerController.updateVolunteerProfile
);

// Get all volunteers - admin only
router.get(
  "/",
  authenticateUser,
  authorizeRoles("admin"),
  volunteerController.getAllVolunteers
);

// Update volunteer verification status - admin only
router.patch(
  "/verify",
  authenticateUser,
  authorizeRoles("admin"),
  volunteerController.updateVerificationStatus
);

module.exports = router; 