const express = require("express");
const router = express.Router();
const { authenticateUser, authorizeRoles } = require("../middlewares/auth");
const shiftController = require("../controllers/shiftController");

// Create a new shift - authenticated organizer or admin
router.post(
  "/",
  authenticateUser,
  shiftController.createShift
);

// Get shifts for an event - public
router.get(
  "/event/:eventId",
  shiftController.getShiftsByEvent
);

// Update shift - authenticated organizer or admin
router.put(
  "/:id",
  authenticateUser,
  shiftController.updateShift
);

// Delete shift - authenticated organizer or admin
router.delete(
  "/:id",
  authenticateUser,
  shiftController.deleteShift
);

// Sign up for a shift - authenticated volunteer
router.post(
  "/:shiftId/signup",
  authenticateUser,
  shiftController.signUpForShift
);

// Check in volunteer - authenticated organizer or admin
router.post(
  "/:shiftId/checkin/:volunteerId",
  authenticateUser,
  shiftController.checkInVolunteer
);

// Check out volunteer - authenticated organizer or admin
router.post(
  "/:shiftId/checkout/:volunteerId",
  authenticateUser,
  shiftController.checkOutVolunteer
);

module.exports = router; 