const Event = require("../models/eventSchema");
const Shift = require("../models/shiftSchema");

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    // Check if user is NGO or admin
    if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only NGOs can create events",
      });
    }

    const eventData = {
      ...req.body,
      organizerId: req.user.id,
    };
    
    const event = await Event.create(eventData);
    
    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// Get all events with filtering
exports.getAllEvents = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      startDate, 
      endDate, 
      location,
      search
    } = req.query;
    
    // Build query
    const query = { active: true };
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (location) query["location.city"] = { $regex: location, $options: "i" };
    
    if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    }
    
    if (endDate) {
      query.endDate = { $lte: new Date(endDate) };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    
    const events = await Event.find(query)
      .populate({
        path: "organizerId",
        select: "name email organization",
      })
      .sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: "organizerId",
        select: "name email organization",
      })
      .populate("shifts");
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update event by ID
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is NGO and is the organizer or is admin
    if (
      (req.user.role === 'ngo' && event.organizerId.toString() !== req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event",
      });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete event (soft delete)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is NGO and is the organizer or is admin
    if (
      (req.user.role === 'ngo' && event.organizerId.toString() !== req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      });
    }
    
    // Set active to false (soft delete)
    event.active = false;
    await event.save();
    
    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get events created by current NGO
exports.getMyEvents = async (req, res) => {
  try {
    // Check if user is NGO or admin
    if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Only NGOs can access this endpoint",
      });
    }

    const events = await Event.find({ 
      organizerId: req.user.id,
      active: true 
    }).sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}; 