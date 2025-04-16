const User = require("../models/userSchema");

// Get current user profile
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -loginAttempts -lockUntil -tokenVersion");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update current user profile
exports.updateCurrentUserProfile = async (req, res) => {
  try {
    // Fields that cannot be updated through this endpoint
    const restrictedFields = [
      "role", "password", "email", "tokenVersion", 
      "loginAttempts", "lockUntil"
    ];
    
    // Create a sanitized update object
    const updateData = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (!restrictedFields.includes(key)) {
        updateData[key] = value;
      }
    }
    
    // Update user document
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -loginAttempts -lockUntil -tokenVersion");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Get volunteer profile specific fields
exports.getVolunteerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("volunteerInfo")
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }
    
    // Check if user has volunteer-specific fields
    if (!user.volunteerInfo) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.volunteerInfo,
    });
  } catch (error) {
    console.error("Error fetching volunteer profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get NGO profile specific fields
exports.getNgoProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("ngoInfo")
      .lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found",
      });
    }
    
    // Check if user has NGO fields
    if (!user.ngoInfo || !user.ngoInfo.organization) {
      return res.status(404).json({
        success: false,
        message: "NGO profile not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.ngoInfo,
    });
  } catch (error) {
    console.error("Error fetching NGO profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update volunteer profile
exports.updateVolunteerProfile = async (req, res) => {
  try {
    const updateData = {};
    
    // Map request body to volunteerInfo
    if (Object.keys(req.body).length > 0) {
      updateData['volunteerInfo'] = req.body;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("volunteerInfo");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.volunteerInfo,
    });
  } catch (error) {
    console.error("Error updating volunteer profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Update NGO profile
exports.updateNgoProfile = async (req, res) => {
  try {
    const updateData = {};
    
    // Map request body to ngoInfo
    if (Object.keys(req.body).length > 0) {
      updateData['ngoInfo'] = req.body;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("ngoInfo");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.ngoInfo,
    });
  } catch (error) {
    console.error("Error updating NGO profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Extract query parameters
    const { role, search } = req.query;
    
    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'ngoInfo.organization': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const users = await User.find(query)
      .select("-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Admin: Get user details by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}; 