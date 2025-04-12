const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxLength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      maxLength: [100, "Email cannot exceed 100 characters"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: [6, "Password cannot be less than 6 characters"],
      select: false,
    },
    role: {
      type: String,
      default: "admin",
      enum: {
        values: ["admin", "superadmin"],
        message: "Invalid role for admin",
      },
    },
    // Basic profile
    phoneNumber: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String, // URL to image
      default: "/images/default-admin.png",
    },
    
    // Admin specific fields
    department: {
      type: String,
      enum: ["IT", "HR", "Operations", "Support", "Management"],
      default: "Support",
    },
    permissions: {
      manageUsers: { type: Boolean, default: true },
      manageNGOs: { type: Boolean, default: true },
      manageVolunteers: { type: Boolean, default: true },
      manageProjects: { type: Boolean, default: true },
      manageAdmins: { type: Boolean, default: false }, // Only superadmin can manage other admins
      systemSettings: { type: Boolean, default: false }, // Only superadmin can change system settings
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
    
    // Authentication and security
    tokenVersion: {
      type: Number,
      default: 0,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to hash password
adminSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    // Set password changed date
    if (this.isNew) this.passwordChangedAt = Date.now() - 1000;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password matches
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if password was changed after a token was issued
adminSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to create password reset token
adminSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Method to increment login attempts
adminSchema.methods.incrementLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Otherwise, increment login attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock the account if we've reached max attempts (5) and it's not locked already
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 60 * 60 * 1000 }; // 1 hour lock
  }

  return this.updateOne(updates);
};

// Method to check if account is locked
adminSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model("Admin", adminSchema); 