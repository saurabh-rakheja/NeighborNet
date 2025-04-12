const Participation = require("../models/participationSchema");
const Event = require("../models/eventSchema");
const User = require("../models/userSchema");
const Shift = require("../models/shiftSchema");

// @desc    Register volunteer for an event
// @route   POST /api/participation/register
// @access  Private (volunteer)
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId, shiftId } = req.body;
    const volunteerId = req.user.id;

    // Check if volunteer role
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: "Only volunteers can register for events",
      });
    }

    // Check if volunteer is verified
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.verificationStatus !== 'Verified') {
      return res.status(403).json({
        success: false,
        message: "Your profile must be verified before registering for events",
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event is active and upcoming
    if (event.status !== 'Upcoming') {
      return res.status(400).json({
        success: false,
        message: "Cannot register for past, ongoing, or cancelled events",
      });
    }

    // If shiftId is provided, check if shift exists and belongs to the event
    if (shiftId) {
      const shift = await Shift.findById(shiftId);
      if (!shift) {
        return res.status(404).json({
          success: false,
          message: "Shift not found",
        });
      }
      
      if (shift.eventId.toString() !== eventId) {
        return res.status(400).json({
          success: false,
          message: "Shift does not belong to this event",
        });
      }
      
      // Check if shift is full
      if (shift.volunteers.length >= shift.volunteersNeeded) {
        return res.status(400).json({
          success: false,
          message: "This shift is already full",
        });
      }
    }

    // Check if already registered
    const existingRegistration = await Participation.findOne({
      volunteerId,
      eventId,
      ...(shiftId && { shiftId }),
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event/shift",
      });
    }

    // Create participation record
    const participation = new Participation({
      volunteerId,
      eventId,
      ...(shiftId && { shiftId }),
      status: "Registered",
    });

    await participation.save();

    // Update event volunteers count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { volunteersRegistered: 1 },
    });

    // If shift provided, add volunteer to shift
    if (shiftId) {
      await Shift.findByIdAndUpdate(shiftId, {
        $push: { volunteers: { volunteerId } },
      });
    }

    res.status(201).json({
      success: true,
      data: participation,
      message: "Successfully registered for the event",
    });
  } catch (error) {
    console.error("Error in registerForEvent:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Cancel registration for an event
// @route   DELETE /api/participation/:id
// @access  Private (volunteer)
exports.cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const volunteerId = req.user.id;

    // Check if volunteer role
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: "Only volunteers can cancel their registrations",
      });
    }

    // Find the participation record
    const participation = await Participation.findById(id);

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check if the registration belongs to the user
    if (participation.volunteerId.toString() !== volunteerId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this registration",
      });
    }

    // Check if event is already completed
    const event = await Event.findById(participation.eventId);
    if (event.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel registration for a completed event",
      });
    }

    // Update participation status
    participation.status = "Cancelled";
    await participation.save();

    // Decrement event volunteers count
    await Event.findByIdAndUpdate(participation.eventId, {
      $inc: { volunteersRegistered: -1 },
    });

    // If shift exists, remove volunteer from shift
    if (participation.shiftId) {
      await Shift.findByIdAndUpdate(participation.shiftId, {
        $pull: { volunteers: { volunteerId } },
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Error in cancelRegistration:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get volunteer's registrations
// @route   GET /api/participation/volunteer
// @access  Private (volunteer)
exports.getVolunteerRegistrations = async (req, res) => {
  try {
    const volunteerId = req.user.id;

    // Check if volunteer role
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const registrations = await Participation.find({ volunteerId })
      .populate('eventId', 'title description startDate endDate location')
      .populate('shiftId', 'name startTime endTime');

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Error in getVolunteerRegistrations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get event participations
// @route   GET /api/participation/event/:eventId
// @access  Private (NGO, admin)
exports.getEventParticipations = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if NGO or admin role
    if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // If NGO, check if they own the event
    if (req.user.role === 'ngo') {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      if (event.organizerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view participations for this event",
        });
      }
    }

    const participations = await Participation.find({ eventId })
      .populate('volunteerId', 'name email phoneNumber')
      .populate('shiftId', 'name startTime endTime');

    res.status(200).json({
      success: true,
      count: participations.length,
      data: participations,
    });
  } catch (error) {
    console.error("Error in getEventParticipations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Check-in volunteer for event
// @route   PUT /api/participation/checkin/:id
// @access  Private (NGO, admin)
exports.checkInVolunteer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if NGO role or admin
    if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Find the participation record
    const participation = await Participation.findById(id);
    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check if event exists and is owned by the NGO
    const event = await Event.findById(participation.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if NGO owns this event
    if (
      req.user.role === 'ngo' &&
      event.organizerId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to check-in volunteers for this event",
      });
    }

    // Update check-in time and status
    participation.checkInTime = new Date();
    participation.status = "Attended"; // Update status to attended
    await participation.save();

    // Also update the shift if applicable
    if (participation.shiftId) {
      const shift = await Shift.findById(participation.shiftId);
      if (shift) {
        const volunteerIndex = shift.volunteers.findIndex(
          v => v.volunteerId.toString() === participation.volunteerId.toString()
        );
        
        if (volunteerIndex >= 0) {
          shift.volunteers[volunteerIndex].status = "Checked In";
          shift.volunteers[volunteerIndex].checkInTime = new Date();
          await shift.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: participation,
      message: "Volunteer checked in successfully",
    });
  } catch (error) {
    console.error("Error in checkInVolunteer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Check-out volunteer from event
// @route   PUT /api/participation/checkout/:id
// @access  Private (NGO, admin)
exports.checkOutVolunteer = async (req, res) => {
  try {
    const { id } = req.params;
    const { hoursLogged } = req.body;

    // Check if NGO role or admin
    if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Find the participation record
    const participation = await Participation.findById(id);
    if (!participation) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    // Check if event exists and is owned by the NGO
    const event = await Event.findById(participation.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if NGO owns this event
    if (
      req.user.role === 'ngo' &&
      event.organizerId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to check-out volunteers for this event",
      });
    }

    // Check if volunteer is checked in
    if (!participation.checkInTime) {
      return res.status(400).json({
        success: false,
        message: "Volunteer has not been checked in yet",
      });
    }

    // Update check-out time and hours logged
    participation.checkOutTime = new Date();
    
    // If hours logged provided, use that, otherwise calculate from check-in/out times
    if (hoursLogged) {
      participation.hoursLogged = parseFloat(hoursLogged);
    } else {
      const checkInTime = new Date(participation.checkInTime);
      const checkOutTime = new Date(participation.checkOutTime);
      const diffMs = checkOutTime - checkInTime;
      const diffHrs = diffMs / (1000 * 60 * 60);
      participation.hoursLogged = parseFloat(diffHrs.toFixed(2));
    }
    
    await participation.save();

    // Update volunteer's total hours in user model
    const volunteer = await User.findById(participation.volunteerId);
    if (volunteer) {
      volunteer.totalHours = (volunteer.totalHours || 0) + participation.hoursLogged;
      await volunteer.save();
    }

    // Also update the shift if applicable
    if (participation.shiftId) {
      const shift = await Shift.findById(participation.shiftId);
      if (shift) {
        const volunteerIndex = shift.volunteers.findIndex(
          v => v.volunteerId.toString() === participation.volunteerId.toString()
        );
        
        if (volunteerIndex >= 0) {
          shift.volunteers[volunteerIndex].status = "Completed";
          shift.volunteers[volunteerIndex].checkOutTime = new Date();
          shift.volunteers[volunteerIndex].hoursLogged = participation.hoursLogged;
          await shift.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: participation,
      message: "Volunteer checked out successfully",
    });
  } catch (error) {
    console.error("Error in checkOutVolunteer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get all participations (admin only)
// @route   GET /api/participation
// @access  Private (admin)
exports.getAllParticipations = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const participations = await Participation.find()
      .populate('volunteerId', 'name email')
      .populate('eventId', 'title startDate endDate')
      .populate('shiftId', 'name startTime endTime');

    res.status(200).json({
      success: true,
      count: participations.length,
      data: participations,
    });
  } catch (error) {
    console.error("Error in getAllParticipations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}; 