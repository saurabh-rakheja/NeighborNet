// Volunteer specific routes to manage events
// ... existing routes ...

// Withdraw from an event (volunteer only)
router.delete(
  "/events/:eventId/withdraw",
  authorizeRoles("volunteer"),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const volunteerId = req.user.id;
      const { reason } = req.body;

      // Find the participation record
      const participation = await Participation.findOne({
        eventId,
        volunteerId,
        status: "Confirmed",
      });

      if (!participation) {
        return res.status(404).json({
          success: false,
          message: "You are not registered for this event",
        });
      }

      // Check if the event has already started or ended
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      const eventDate = new Date(event.date);
      if (eventDate < new Date()) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot withdraw from an event that has already started or ended",
        });
      }

      // Update participation status
      participation.status = "Withdrawn";
      if (reason) {
        participation.notes = reason;
      }
      await participation.save();

      // Decrement event volunteers count
      await Event.findByIdAndUpdate(eventId, {
        $inc: { volunteersRegistered: -1 },
      });

      // If shift exists, remove volunteer from shift
      if (participation.shiftId) {
        await Shift.findByIdAndUpdate(participation.shiftId, {
          $pull: { volunteers: { volunteerId } },
        });
      }

      // Notify the NGO
      // TODO: Send notification to NGO about volunteer withdrawal

      res.status(200).json({
        success: true,
        message: "Successfully withdrawn from the event",
      });
    } catch (error) {
      console.error("Error withdrawing from event:", error);
      res.status(500).json({
        success: false,
        message: "Failed to withdraw from event",
      });
    }
  }
);

// ... existing code ...
