const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: [true, "Event address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, "Zip code is required"],
        trim: true,
      }
    },
    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Event end date is required"],
    },
    shifts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift"
    }],
    skillsRequired: [{
      type: String,
      trim: true,
    }],
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    volunteersNeeded: {
      type: Number,
      required: [true, "Number of volunteers needed is required"],
      min: [1, "At least one volunteer is required"],
    },
    volunteersRegistered: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: ["Community Service", "Environmental", "Education", "Healthcare", "Animal Welfare", "Food Donation", "Other"],
    },
    image: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema); 