const Volunteer = require("../models/volunteerSchema");
const User = require("../models/userSchema");

// Create a volunteer profile
exports.createVolunteerProfile = async (req, res) => {
  try {
    // Check if volunteer profile already exists for this user
    const existingVolunteer = await Volunteer.findOne({ user: req.user.id });
    
    if (existingVolunteer) {
      return res.status(400).json({
        success: false,
        message: "Volunteer profile already exists for this user",
      });
    }
    
    // Create new volunteer profile
    const volunteerData = {
      user: req.user.id,
      ...req.body,
    };
    
    const volunteer = await Volunteer.create(volunteerData);
    
    res.status(201).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    console.error("Error creating volunteer profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get volunteer profile
exports.getVolunteerProfile = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user.id });
    
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    console.error("Error fetching volunteer profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update volunteer profile
exports.updateVolunteerProfile = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    console.error("Error updating volunteer profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all volunteers (admin only)
exports.getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().populate({
      path: "user",
      select: "name email",
    });
    
    res.status(200).json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    });
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update volunteer verification status (admin only)
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { volunteerId, verificationStatus } = req.body;
    
    if (!["Pending", "Verified", "Rejected"].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status",
      });
    }
    
    const volunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { verificationStatus },
      { new: true, runValidators: true }
    );
    
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}; 