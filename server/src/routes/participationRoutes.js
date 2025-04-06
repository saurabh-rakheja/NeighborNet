const express = require("express");
const router = express.Router();
const participationController = require("../controllers/participationController");
const { authenticateUser, authorizeRoles } = require("../middlewares/auth");

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Volunteer routes
router.post("/register", authorizeRoles("volunteer"), participationController.registerForEvent);
router.get("/volunteer", authorizeRoles("volunteer"), participationController.getVolunteerRegistrations);
router.delete("/:id", authorizeRoles("volunteer"), participationController.cancelRegistration);

// NGO routes
router.get("/event/:eventId", authorizeRoles("ngo", "admin"), participationController.getEventParticipations);
router.put("/checkin/:id", authorizeRoles("ngo", "admin"), participationController.checkInVolunteer);
router.put("/checkout/:id", authorizeRoles("ngo", "admin"), participationController.checkOutVolunteer);

// Admin routes
router.get("/", authorizeRoles("admin"), participationController.getAllParticipations);

module.exports = router; 