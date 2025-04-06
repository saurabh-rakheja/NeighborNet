const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    availability: {
      weekdays: {
        type: [String],
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
      timeSlots: {
        type: [String],
        enum: ["Morning", "Afternoon", "Evening"],
      }
    },
    preferredLocations: [{
      type: String,
      trim: true,
    }],
    experience: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner",
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
    verificationStatus: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema); 