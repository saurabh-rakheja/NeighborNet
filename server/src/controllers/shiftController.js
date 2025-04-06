const Shift = require("../models/shiftSchema");
const Event = require("../models/eventSchema");
const User = require("../models/userSchema");

// Create a new shift
exports.createShift = async (req, res) => {
  try {
    const { eventId } = req.body;
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is organizer
    if (event.organizerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create shifts for this event",
      });
    }
    
    const shiftData = {
      ...req.body,
    };
    
    const shift = await Shift.create(shiftData);
    
    // Add shift to event
    event.shifts.push(shift._id);
    await event.save();
    
    res.status(201).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    console.error("Error creating shift:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get shifts for an event
exports.getShiftsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const shifts = await Shift.find({ 
      eventId,
      active: true,
    }).sort({ startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts,
    });
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get shift by ID
exports.getShiftById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const shift = await Shift.findById(id);
    
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    console.error("Error fetching shift:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update shift
exports.updateShift = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find shift
    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }
    
    // Find event
    const event = await Event.findById(shift.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is organizer
    if (event.organizerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this shift",
      });
    }
    
    // Update shift
    const updatedShift = await Shift.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedShift,
    });
  } catch (error) {
    console.error("Error updating shift:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete shift
exports.deleteShift = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find shift
    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }
    
    // Find event
    const event = await Event.findById(shift.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is organizer
    if (event.organizerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this shift",
      });
    }
    
    // Soft delete - mark as inactive
    shift.active = false;
    await shift.save();
    
    // Remove shift from event
    event.shifts = event.shifts.filter(s => s.toString() !== id);
    await event.save();
    
    res.status(200).json({
      success: true,
      message: "Shift deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting shift:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Sign up volunteer for shift
exports.signUpForShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    
    // Get user with volunteer fields
    const volunteer = await User.findById(req.user.id);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Check if user is a volunteer
    if (volunteer.role !== "volunteer") {
      return res.status(403).json({
        success: false,
        message: "Only volunteers can sign up for shifts",
      });
    }
    
    // Check if volunteer verification status is verified
    if (volunteer.verificationStatus !== "Verified") {
      return res.status(403).json({
        success: false,
        message: "Your profile needs to be verified before signing up for shifts",
      });
    }
    
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }
    
    // Check if shift is full
    const signedUpVolunteers = shift.volunteers.length;
    if (signedUpVolunteers >= shift.volunteersNeeded) {
      return res.status(400).json({
        success: false,
        message: "This shift is already full",
      });
    }
    
    // Check if volunteer is already signed up
    const alreadySignedUp = shift.volunteers.some(
      v => v.volunteerId.toString() === volunteer._id.toString()
    );
    
    if (alreadySignedUp) {
      return res.status(400).json({
        success: false,
        message: "You are already signed up for this shift",
      });
    }
    
    // Add volunteer to shift
    shift.volunteers.push({
      volunteerId: volunteer._id,
      status: "Signed Up",
    });
    
    await shift.save();
    
    // Update event volunteer count
    const event = await Event.findById(shift.eventId);
    event.volunteersRegistered += 1;
    await event.save();
    
    res.status(200).json({
      success: true,
      message: "Successfully signed up for shift",
      data: shift,
    });
  } catch (error) {
    console.error("Error signing up for shift:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Cancel volunteer signup
exports.cancelSignup = async (req, res) => {
  try {
    const { shiftId } = req.params;
    
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }
    
    // Find volunteer in shift
    const volunteerIndex = shift.volunteers.findIndex(
      v => v.volunteerId.toString() === req.user.id
    );
    
    if (volunteerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "You are not signed up for this shift",
      });
    }
    
    // Remove volunteer from shift
    shift.volunteers.splice(volunteerIndex, 1);
    await shift.save();
    
    // Update event volunteer count
    const event = await Event.findById(shift.eventId);
    event.volunteersRegistered -= 1;
    await event.save();
    
    res.status(200).json({
      success: true,
      message: "Successfully cancelled signup",
    });
  } catch (error) {
    console.error("Error cancelling signup:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check in volunteer
exports.checkInVolunteer = async (req, res) => {
  try {
    const { shiftId, volunteerId } = req.params;
    
    // Check if user is authorized (organizer or admin)
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }
    
    const event = await Event.findById(shift.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    if (event.organizerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to check in volunteers",
      });
    }
    
    // Find volunteer in shift
    const volunteerIndex = shift.volunteers.findIndex(
      v => v.volunteerId.toString() === volunteerId
    );
    
    if (volunteerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found in this shift",
      });
    }
    
    // Update volunteer status
    shift.volunteers[volunteerIndex].status = "Checked In";
    shift.volunteers[volunteerIndex].checkInTime = new Date();
    
    await shift.save();
    
    res.status(200).json({
      success: true,
      message: "Volunteer checked in successfully",
      data: shift,
    });
  } catch (error) {
    console.error("Error checking in volunteer:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check out volunteer and log hours
exports.checkOutVolunteer = async (req, res) => {
  try {
    const { shiftId, volunteerId } = req.params;
    
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }
    
    // Find event to check authorization
    const event = await Event.findById(shift.eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    if (event.organizerId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to check out volunteers",
      });
    }
    
    // Find volunteer in shift
    const volunteerIndex = shift.volunteers.findIndex(
      v => v.volunteerId.toString() === volunteerId
    );
    
    if (volunteerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found in this shift",
      });
    }
    
    // Ensure volunteer is checked in
    if (shift.volunteers[volunteerIndex].status !== "Checked In") {
      return res.status(400).json({
        success: false,
        message: "Volunteer must be checked in before checking out",
      });
    }
    
    // Set check out time
    const checkOutTime = new Date();
    shift.volunteers[volunteerIndex].checkOutTime = checkOutTime;
    shift.volunteers[volunteerIndex].status = "Completed";
    
    // Calculate hours
    const checkInTime = new Date(shift.volunteers[volunteerIndex].checkInTime);
    const hoursDiff = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    const roundedHours = Math.round(hoursDiff * 10) / 10; // Round to 1 decimal place
    
    shift.volunteers[volunteerIndex].hoursLogged = roundedHours;
    
    await shift.save();
    
    // Update volunteer total hours in user model
    const volunteer = await User.findById(volunteerId);
    volunteer.totalHours = (volunteer.totalHours || 0) + roundedHours;
    await volunteer.save();
    
    res.status(200).json({
      success: true,
      message: "Volunteer checked out successfully",
      data: {
        shift,
        hoursLogged: roundedHours,
      },
    });
  } catch (error) {
    console.error("Error checking out volunteer:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}; 