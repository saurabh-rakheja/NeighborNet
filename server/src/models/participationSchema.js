const mongoose = require("mongoose");

const participationSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: false, // Optional as a volunteer might register for the event but not for a specific shift yet
    },
    status: {
      type: String,
      enum: ["Registered", "Confirmed", "Attended", "Cancelled", "No-Show"],
      default: "Registered",
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    hoursLogged: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    // For NGO to provide feedback on volunteer
    ngoFeedback: {
      type: String,
      trim: true,
    },
    ngoRating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Create a compound index to prevent duplicate registrations
participationSchema.index({ volunteerId: 1, eventId: 1, shiftId: 1 }, { unique: true });

module.exports = mongoose.model("Participation", participationSchema); 