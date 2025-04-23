const rateLimit = require("express-rate-limit");

// Rate limiting disabled
/*
const authLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 1000000000, // 5 attempts
  message: {
    status: "error",
    message: "Too many login attempts, please try again after 15 minutes",
  },
});
*/

// Provide a dummy limiter that doesn't limit anything
const authLimiter = (req, res, next) => next();

module.exports = { authLimiter };
