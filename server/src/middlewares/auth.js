const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const authenticateUser = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token provided" });
    }

    // Verify token and extract user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists" });
    }

    // Check if token has been invalidated
    if (user.tokenVersion !== decoded.version) {
      return res.status(401).json({ success: false, message: "Token invalid" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      console.error("Error in authentication middleware:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

// Traditional role-based authorization
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

// Capability-based authorization
const authorizeCapabilities = (capability) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    // Check capabilities based on the requirement
    switch (capability) {
      case "volunteer":
        // User has volunteer capabilities if they're a volunteer or have skills
        if (
          req.user.role === "volunteer" ||
          (req.user.skills && req.user.skills.length > 0)
        ) {
          return next();
        }
        break;

      case "ngo":
        // User has NGO capabilities if they're an NGO or have organization info
        if (req.user.role === "ngo" || req.user.organization) {
          return next();
        }
        break;

      case "admin":
        // Only admins have admin capabilities
        if (req.user.role === "admin" || req.user.isAdmin) {
          return next();
        }
        break;

      default:
        // Unknown capability, deny access
        break;
    }

    return res.status(403).json({
      success: false,
      message: `You don't have the required capabilities to access this route`,
    });
  };
};

const csrfProtection = async (req, res, next) => {
  const token = req.headers["x-csrf-token"];

  if (!token || token !== req.session.csrfToken) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid CSRF token" });
  }

  next();
};

module.exports = {
  authenticateUser,
  authorizeRoles,
  authorizeCapabilities,
  csrfProtection,
};
