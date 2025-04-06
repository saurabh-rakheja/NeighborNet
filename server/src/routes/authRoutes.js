const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authContoller");
const { authenticateUser } = require("../middlewares/auth");

// Public routes
router.post("/register", authController.register);
router.post("/register-ngo", authController.registerNGO);
router.post("/register-volunteer", authController.registerVolunteer);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

// Protected routes
router.use(authenticateUser); // Apply authentication middleware to all routes below
router.get("/me", authController.getMe);
router.put("/update-me", authController.updateMe);
router.delete("/delete-me", authController.deleteMe);

module.exports = router;
