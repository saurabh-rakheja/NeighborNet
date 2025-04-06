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

    // Check if user still exists
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
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

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required for this route",
      });
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

const csrfProtection = async (req, res, next) => {
  const token = req.headers["x-csrf-token"];

  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ success: false, message: "Invalid CSRF token" });
  }

  next();
};

module.exports = { authenticateUser, authorizeRoles, csrfProtection };