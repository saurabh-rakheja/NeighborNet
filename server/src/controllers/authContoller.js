const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userSchema");

//-----------------//
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
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

//-----------------//
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, version: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
    );

    res.json({
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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Register as NGO
// @route   POST /api/auth/register-ngo
// @access  Public
exports.registerNGO = async (req, res) => {
  try {
    const { name, email, password, organization } = req.body;

    // Check required fields
    if (!name || !email || !password || !organization) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide name, email, password, and organization"
      });
    }

    // Check if user already exists via email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create new NGO user
    user = new User({
      name,
      email,
      password,
      role: 'ngo',
      organization,
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
    console.error("Error in registerNGO:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Register as Volunteer 
// @route   POST /api/auth/register-volunteer
// @access  Public
exports.registerVolunteer = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide name, email, and password"
      });
    }

    // Check if user already exists via email
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Create new volunteer user
    user = new User({
      name,
      email,
      password,
      role: 'volunteer',
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
      },
    });
  } catch (error) {
    console.error("Error in registerVolunteer:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

//-----------------//
// @desc    Forgot password - Generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate password reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset token via email (implement email service here)
    console.log(`Password reset token: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Password reset token sent to email",
      resetToken,
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Reset password
// @route   PATCH /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by reset token and check expiration
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get current user's profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/auth/update-me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const { name, email, organization } = req.body;
    
    // Set fields to update
    const updateFields = { name, email };
    
    // For NGO users, allow updating organization
    if (req.user.role === 'ngo' && organization) {
      updateFields.organization = organization;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error in updateMe:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete current user's account
// @route   DELETE /api/auth/delete-me
// @access  Private
exports.deleteMe = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { active: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(204).json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error in deleteMe:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};