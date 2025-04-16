const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
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
      default: "volunteer",
      enum: {
        values: ["volunteer", "ngo", "admin"],
        message: "Please select a valid role",
      },
    },
    // Basic profile for all users
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: "United States" },
    },
    bio: {
      type: String,
      trim: true,
      maxLength: [500, "Bio cannot exceed 500 characters"],
    },
    profilePicture: {
      type: String, // URL to image
      default: "/images/default-avatar.png",
    },
    
    // NGO specific fields
    organization: {
      type: String,
      trim: true,
      maxLength: [100, "Organization name cannot exceed 100 characters"],
      // Required only if role is ngo
      validate: {
        validator: function(value) {
          return this.role !== 'ngo' || (value && value.length > 0);
        },
        message: 'Organization name is required for NGO accounts'
      }
    },
    organizationDetails: {
      description: { type: String, trim: true },
      website: { type: String, trim: true },
      mission: { type: String, trim: true },
      foundedYear: { type: Number },
      size: { type: String, enum: ["Small", "Medium", "Large"] },
      registrationNumber: { type: String, trim: true },
      taxId: { type: String, trim: true },
    },
    organizationLogo: {
      type: String, // URL to image
    },
    
    // Volunteer specific fields
    skills: [{
      type: String,
      trim: true,
    }],
    availability: {
      monday: [String],
      tuesday: [String],
      wednesday: [String],
      thursday: [String],
      friday: [String],
      saturday: [String],
      sunday: [String]
    },
    preferredLocations: [{
      type: String,
      trim: true,
    }],
    experience: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner"
    },
    interests: [{
      type: String,
      trim: true,
    }],
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    // Additional fields from volunteer onboarding
    dateOfBirth: {
      type: Date,
    },
    education: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    maxDistance: {
      type: Number,
      default: 15,
    },
    hasDriverLicense: {
      type: Boolean,
      default: false,
    },
    hasVehicle: {
      type: Boolean,
      default: false,
    },
    hasCriminalRecord: {
      type: Boolean,
      default: false,
    },
    criminalRecordDetails: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },
    totalHours: {
      type: Number,
      default: 0,
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
userSchema.pre("save", async function (next) {
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
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if password was changed after a token was issued
userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to create password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
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
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model("User", userSchema);
