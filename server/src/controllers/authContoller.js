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
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Validate NGO registration
    if (role === "ngo" && !organization) {
      // Use name as organization name if not provided
      req.body.organization = name;
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      role: role || "volunteer",
      ...(organization && { organization }),
    };

    const user = await User.create(userData);

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
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

//-----------------//
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(401).json({
        success: false,
        message:
          "Account is locked due to too many failed login attempts. Try again later.",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment login attempts if the method exists
      if (user.incrementLoginAttempts) {
        await user.incrementLoginAttempts();
      }
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Reset login attempts if they exist
    if (user.loginAttempts > 0) {
      await User.updateOne(
        { _id: user._id },
        { $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } }
      );
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
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Use name as organization if not provided
    const orgName = organization || name;

    // Check if user already exists via email
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create new NGO user
    const user = await User.create({
      name,
      email,
      password,
      role: "ngo",
      organization: orgName,
    });

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
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
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
        message: "Please provide name, email, and password",
      });
    }

    // Check if user already exists via email
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create new volunteer user
    const user = await User.create({
      name,
      email,
      password,
      role: "volunteer",
    });

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
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// @desc    Register as Admin (only accessible by superadmin)
// @route   POST /api/auth/register-admin
// @access  Private (superadmin only)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, department, permissions } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Check if the requesting user is a superadmin (this route should be protected)
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmins can create admin accounts",
      });
    }

    // Check if user already exists via email
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create new admin user
    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
      department: department || "Support",
      permissions: permissions || {},
    });

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
        department: user.department,
      },
    });
  } catch (error) {
    console.error("Error in registerAdmin:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

//-----------------//
// @desc    Forgot password - Generate reset token
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email, userType } = req.body;

    if (!email || !userType) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide email and user type",
        });
    }

    // Find user based on model type
    let user;
    if (userType === "volunteer") {
      user = await User.findOne({ email });
    } else if (userType === "ngo") {
      user = await User.findOne({ email });
    } else if (userType === "admin") {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate password reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset token via email (implement email service here)
    console.log(`Password reset token: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: "Password reset token sent to email",
      resetToken, // Remove in production
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
    const { password, userType } = req.body;

    if (!password || !userType) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide password and user type",
        });
    }

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by reset token and check expiration based on model type
    let user;
    if (userType === "volunteer") {
      user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
    } else if (userType === "ngo") {
      user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
    } else if (userType === "admin") {
      user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });
    }

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
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
    // User is already attached to request by the authenticateUser middleware
    res.json({
      success: true,
      data: req.user,
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
    const { name, email } = req.body;
    const userId = req.user.id;

    // Base fields to update for all user types
    const updateFields = { name, email };

    // Update specific fields based on user type
    let updatedUser;

    updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateMe:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete current user (soft delete by setting active to false)
// @route   DELETE /api/auth/me
// @access  Private
exports.deleteMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { active: false },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(204)
      .json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error in deleteMe:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
