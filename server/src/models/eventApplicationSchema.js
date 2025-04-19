const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventApplicationSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    volunteer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ngo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn", "completed"],
      default: "pending",
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    responseDate: {
      type: Date,
    },
    motivationLetter: {
      type: String,
    },
    skillsRelevance: {
      type: String,
    },
    availability: {
      type: [String],
    },
    feedback: {
      type: String,
    },
    hoursContributed: {
      type: Number,
      default: 0,
    },
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
    },
    rating: {
      ngoToVolunteer: {
        type: Number,
        min: 1,
        max: 5,
      },
      volunteerToNgo: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Create composite index to ensure a volunteer can only apply once to an event
eventApplicationSchema.index({ event: 1, volunteer: 1 }, { unique: true });

// Pre-hook to update volunteer's participation count when an application is marked as completed
eventApplicationSchema.pre("save", async function (next) {
  const application = this;
  // If status is being changed to completed
  if (application.isModified("status") && application.status === "completed") {
    try {
      const User = mongoose.model("User");
      await User.findByIdAndUpdate(
        application.volunteer,
        {
          $inc: {
            "volunteerInfo.eventsParticipated": 1,
            "volunteerInfo.totalHours": application.hoursContributed || 0,
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating volunteer participation stats:", error);
    }
  }
  next();
});

module.exports = mongoose.model("EventApplication", eventApplicationSchema);
