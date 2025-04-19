const Event = require("../models/eventSchema");
const User = require("../models/userSchema");

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    // Check if user is NGO or admin
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
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
    const { status, category, startDate, endDate, location, search } =
      req.query;

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
    const event = await Event.findById(req.params.id).populate({
        path: "organizerId",
        select: "name email organization",
    });

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
      req.user.role === "ngo" &&
      event.organizerId.toString() !== req.user.id &&
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
      req.user.role === "ngo" &&
      event.organizerId.toString() !== req.user.id &&
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
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only NGOs can access this endpoint",
      });
    }

    const events = await Event.find({
      organizerId: req.user.id,
      active: true,
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

// Get NGO dashboard events with pagination and filtering
exports.getNGODashboardEvents = async (req, res) => {
  try {
    // Check if user is NGO or admin
    if (req.user.role !== "ngo" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only NGOs can access this endpoint",
      });
    }

    const { status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {
      organizerId: req.user.id,
      active: true,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        { "location.state": { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Event.countDocuments(query);

    // Get paginated events
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate status for each event
    const eventsWithStatus = events.map((event) => {
      const now = new Date();
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      let status = "upcoming";

      if (now > endDate) {
        status = "completed";
      } else if (now >= startDate && now <= endDate) {
        status = "ongoing";
      }

      // Add calculated values needed by the frontend
      return {
        ...event.toObject(),
        status,
        volunteersRegistered: event.registeredVolunteers
          ? event.registeredVolunteers.length
          : 0,
      };
    });

    // Return the correct structure that the client expects
    res.status(200).json({
      success: true,
      events: eventsWithStatus || [],
      totalEvents: total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching NGO dashboard events:", error);
    // Return an empty events array to prevent undefined errors
    res.status(500).json({
      success: false,
      message: "Internal server error",
      events: [],
      totalPages: 1,
      currentPage: 1,
    });
  }
};

// Register a volunteer for an event
exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const volunteerId = req.user.id;

    // Find the event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event is active
    if (!event.active) {
      return res.status(400).json({
        success: false,
        message: "This event is no longer active",
      });
    }

    // Initialize registeredVolunteers if it doesn't exist
    if (!event.registeredVolunteers) {
      event.registeredVolunteers = [];
    }

    // Check if volunteer is already registered
    const alreadyRegistered = event.registeredVolunteers.some(
      (registration) => registration.volunteer.toString() === volunteerId
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Check if event is full
    if (event.volunteersRegistered >= event.volunteersNeeded) {
      return res.status(400).json({
        success: false,
        message: "This event is already full",
      });
    }

    // Add volunteer to event
    event.registeredVolunteers.push({
      volunteer: volunteerId,
      status: event.requiresApproval ? "pending" : "approved",
      registeredAt: new Date(),
    });

    // Increment volunteersRegistered count
    event.volunteersRegistered = (event.volunteersRegistered || 0) + 1;

    await event.save();

    res.status(200).json({
      success: true,
      message: event.requiresApproval
        ? "Successfully registered. Awaiting approval from the organizer."
        : "Successfully registered for the event.",
      data: event,
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all events for a specific NGO
exports.getEventsByNGO = async (req, res) => {
  try {
    const { ngoId } = req.params;

    const events = await Event.find({
      organizerId: ngoId,
      active: true,
    }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching NGO events:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get event attendees
exports.getEventAttendees = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // If no registeredVolunteers field or empty array, return empty array
    if (
      !event.registeredVolunteers ||
      event.registeredVolunteers.length === 0
    ) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Extract volunteer IDs
    const volunteerIds = event.registeredVolunteers.map(
      (registration) => registration.volunteer
    );

    // Fetch volunteer details
    const volunteers = await User.find(
      { _id: { $in: volunteerIds } },
      "name email role"
    );

    // Map volunteers to a more friendly format with additional data
    const attendeesData = volunteers.map((volunteer) => {
      const registration = event.registeredVolunteers.find(
        (reg) => reg.volunteer.toString() === volunteer._id.toString()
      );

      return {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        status: registration?.status || "registered",
        registeredAt: registration?.registeredAt,
        shifts: 1, // For now, assume 1 shift per registration
      };
    });

    res.status(200).json({
      success: true,
      count: attendeesData.length,
      data: attendeesData,
    });
  } catch (error) {
    console.error("Error fetching event attendees:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
