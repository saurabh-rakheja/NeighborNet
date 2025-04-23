const mongoose = require("mongoose");

/**
 * Registration Schema
 * Unified schema for managing volunteer event registrations
 * Combines elements from participation and application schemas
 * without shift-specific features
 */
const registrationSchema = new mongoose.Schema(
  {
    // Core relationship fields
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Registration status
    status: {
      type: String,
      enum: [
        "Pending", // Initial registration, waiting for approval
        "Approved", // Approved but not yet attended
        "Rejected", // Registration rejected by organizer
        "Withdrawn", // Volunteer withdrew from event
        "Attended", // Volunteer attended the event
        "Completed", // Participation complete with hours logged
        "No-Show", // Volunteer didn't attend the event
      ],
      default: "Pending",
    },

    // Timestamps for registration lifecycle
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    responseDate: {
      type: Date,
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },

    // Participation details
    hoursLogged: {
      type: Number,
      default: 0,
    },

    // Application info
    motivationLetter: {
      type: String,
      trim: true,
    },
    skillsRelevance: {
      type: String,
      trim: true,
    },

    // Feedback and rating
    volunteerFeedback: {
      type: String,
      trim: true,
    },
    volunteerRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    organizerFeedback: {
      type: String,
      trim: true,
    },
    organizerRating: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Certificate information
    certificate: {
      issued: {
        type: Boolean,
        default: false,
      },
      issueDate: {
        type: Date,
      },
      certificateId: {
        type: String,
      },
      downloadUrl: {
        type: String,
      },
    },

    // Additional info
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Create compound index to prevent duplicate registrations
registrationSchema.index({ volunteerId: 1, eventId: 1 }, { unique: true });

// Pre-save hook to update volunteer's stats when registration is completed
registrationSchema.pre("save", async function (next) {
  const registration = this;
  // Check if status is being changed to completed
  if (
    registration.isModified("status") &&
    registration.status === "Completed" &&
    registration.hoursLogged > 0
  ) {
    try {
      const User = mongoose.model("User");
      await User.findByIdAndUpdate(
        registration.volunteerId,
        {
          $inc: {
            "volunteerInfo.eventsParticipated": 1,
            "volunteerInfo.totalHours": registration.hoursLogged,
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating volunteer stats:", error);
    }
  }
  next();
});

// Method to check in a volunteer
registrationSchema.methods.checkIn = function () {
  this.status = "Attended";
  this.checkInTime = new Date();
  return this.save();
};

// Method to check out a volunteer and log hours
registrationSchema.methods.checkOut = function (hoursOverride) {
  this.status = "Completed";
  this.checkOutTime = new Date();

  if (hoursOverride && hoursOverride > 0) {
    this.hoursLogged = hoursOverride;
  } else if (this.checkInTime) {
    // Calculate hours based on check-in/out times
    const diffMs = this.checkOutTime - this.checkInTime;
    const diffHrs = diffMs / (1000 * 60 * 60);
    this.hoursLogged = parseFloat(diffHrs.toFixed(2));
  }

  return this.save();
};

// Static method to get volunteer registrations with event details
registrationSchema.statics.getVolunteerRegistrations = function (volunteerId) {
  return this.find({ volunteerId })
    .populate(
      "eventId",
      "title description startDate endDate location category image"
    )
    .populate("organizerId", "name profile.organization profile.profilePicture")
    .sort({ "eventId.startDate": 1 });
};

// Static method to get event registrations with volunteer details
registrationSchema.statics.getEventRegistrations = function (eventId) {
  return this.find({ eventId })
    .populate(
      "volunteerId",
      "name email profile.phoneNumber profile.profilePicture volunteerInfo.skills"
    )
    .sort({ registrationDate: 1 });
};

module.exports = mongoose.model("Registration", registrationSchema);
