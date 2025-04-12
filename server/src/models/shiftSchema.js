const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Shift name is required"],
      trim: true,
    },
    startTime: {
      type: Date,
      required: [true, "Shift start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "Shift end time is required"],
    },
    volunteersNeeded: {
      type: Number,
      required: [true, "Number of volunteers needed is required"],
      min: [1, "At least one volunteer is required"],
    },
    volunteers: [
      {
        volunteerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["Signed Up", "Confirmed", "Checked In", "Completed", "No Show"],
          default: "Signed Up",
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
        }
      }
    ],
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    tasks: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shift", shiftSchema); 