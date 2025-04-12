const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeRoles } = require("../middlewares/auth");
const userController = require("../controllers/userController");

// === Public Routes ===
// No public routes here, authentication is required for all user operations

// === User Routes (requires authentication) ===
// Get current user profile
router.get(
  "/profile",
  authenticateUser,
  userController.getCurrentUserProfile
);

// Update current user's basic profile information
router.put(
  "/profile",
  authenticateUser,
  userController.updateCurrentUserProfile
);

// === Volunteer-specific Routes ===
// Get current user's volunteer profile
router.get(
  "/volunteer-profile",
  authenticateUser,
  userController.getVolunteerProfile
);

// Update current user's volunteer profile
router.put(
  "/volunteer-profile",
  authenticateUser,
  userController.updateVolunteerProfile
);

// === NGO-specific Routes ===
// Get current user's NGO profile
router.get(
  "/ngo-profile",
  authenticateUser,
  userController.getNgoProfile
);

// Update current user's NGO profile
router.put(
  "/ngo-profile",
  authenticateUser,
  userController.updateNgoProfile
);

// === Admin Routes ===
// Get all users
router.get(
  "/",
  authenticateUser,
  authorizeRoles("admin"),
  userController.getAllUsers
);

// Get specific user details
router.get(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  userController.getUserById
);

// Update user verification status
router.patch(
  "/verify",
  authenticateUser,
  authorizeRoles("admin"),
  userController.updateVerificationStatus
);

module.exports = router; 