const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const ngoSchema = new mongoose.Schema(
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
      default: "ngo",
      enum: {
        values: ["ngo"],
        message: "Invalid role for NGO",
      },
    },
    // Basic profile
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
    profilePicture: {
      type: String, // URL to image
      default: "/images/default-organization.png",
    },
    
    // NGO specific fields
    organization: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
      maxLength: [100, "Organization name cannot exceed 100 characters"],
    },
    organizationDetails: {
      description: { 
        type: String, 
        trim: true,
        maxLength: [1000, "Description cannot exceed 1000 characters"],
      },
      website: { 
        type: String, 
        trim: true,
        match: [/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, "Please provide a valid URL"],
      },
      mission: { 
        type: String, 
        trim: true,
        maxLength: [500, "Mission statement cannot exceed 500 characters"],
      },
      foundedYear: { 
        type: Number,
        min: [1800, "Founded year cannot be earlier than 1800"],
        max: [new Date().getFullYear(), "Founded year cannot be in the future"],
      },
      size: { 
        type: String, 
        enum: ["Small (1-10 employees)", "Medium (11-50 employees)", "Large (50+ employees)"] 
      },
      registrationNumber: { 
        type: String, 
        trim: true 
      },
      taxId: { 
        type: String, 
        trim: true 
      },
      category: {
        type: String,
        enum: [
          "Animal Welfare",
          "Arts and Culture",
          "Community Development",
          "Education",
          "Environment",
          "Health",
          "Human Rights",
          "Humanitarian Aid",
          "International Development",
          "Poverty Alleviation",
          "Other"
        ]
      }
    },
    organizationLogo: {
      type: String, // URL to image
    },
    socialMedia: {
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },
    contactPerson: {
      name: { type: String, trim: true },
      position: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    projectsCreated: {
      type: Number,
      default: 0,
    },
    volunteersManaged: {
      type: Number,
      default: 0,
    },
    impactScore: {
      type: Number,
      default: 0,
    },
    documentsUploaded: [{
      name: String,
      documentType: {
        type: String,
        enum: ["Registration Certificate", "Tax Exemption", "Annual Report", "Other"]
      },
      fileUrl: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
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
ngoSchema.pre("save", async function (next) {
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
ngoSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if password was changed after a token was issued
ngoSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to create password reset token
ngoSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Method to increment login attempts
ngoSchema.methods.incrementLoginAttempts = async function () {
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
ngoSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model("NGO", ngoSchema); 