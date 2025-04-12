const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userSchema");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;

    // Check if user already exists via email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Validate NGO registration
    if (role === 'ngo' && !organization) {
      return res.status(400).json({ success: false, message: "Organization name is required for NGO accounts" });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || 'volunteer', // Default to volunteer if not specified
      ...(organization && { organization }), // Add organization if provided
    });

    // Hash password via pre-save middleware
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, version: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(401).json({
        success: false,
        message: "Account is locked due to too many failed login attempts. Try again later."
      });
    }

    // Check if password is correct
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Reset login attempts
    if (user.loginAttempts > 0) {
      await User.updateOne(
        { _id: user._id },
        { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, version: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

// Get current user (me)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -tokenVersion -loginAttempts -lockUntil");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Increment token version to invalidate existing tokens
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { tokenVersion: 1 }
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with that email"
      });
    }

    // Generate password reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In a real application, send an email with the reset link
    // Instead, we'll just return the token for testing purposes
    // URL would be: `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    // Don't expose the token in production
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
      resetUrl // Only include this for development/testing
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    
    // Reset user fields in case of error
    if (error.user) {
      error.user.passwordResetToken = undefined;
      error.user.passwordResetExpires = undefined;
      await error.user.save({ validateBeforeSave: false });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Password and token are required"
      });
    }

    // Hash token to compare with stored token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or has expired"
      });
    }

    // Set new password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Increment token version to invalidate existing tokens
    user.tokenVersion += 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password"
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    // Increment token version to invalidate existing tokens
    user.tokenVersion += 1;
    await user.save();

    // Generate new token
    const token = jwt.sign(
      { id: user._id, role: user.role, version: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      token
    });
  } catch (error) {
    console.error("Error in updatePassword:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
}; 