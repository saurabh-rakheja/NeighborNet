import api from "./api";

// Event-related API endpoints
const eventApi = {
  // Get all events with optional filtering
  getEvents: async (params = {}) => {
    try {
      const response = await api.get("/events", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific event by ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post("/events", eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search events
  searchEvents: async (searchParams) => {
    try {
      const response = await api.get("/events/search", {
        params: searchParams,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event categories
  getCategories: async () => {
    try {
      const response = await api.get("/events/categories");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event skills
  getSkills: async () => {
    try {
      const response = await api.get("/events/skills");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit event feedback
  submitFeedback: async (eventId, feedbackData) => {
    try {
      const response = await api.post(
        `/events/${eventId}/feedback`,
        feedbackData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event attendees
  getAttendees: async (eventId, params = {}) => {
    try {
      const response = await api.get(`/events/${eventId}/attendees`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get featured events
  getFeaturedEvents: async () => {
    try {
      const response = await api.get("/events/featured");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get upcoming events
  getUpcomingEvents: async (params = {}) => {
    try {
      const response = await api.get("/events/upcoming", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event applications
  getEventApplications: async (eventId, params = {}) => {
    try {
      const response = await api.get(`/events/${eventId}/applications`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit an application for an event
  applyForEvent: async (eventId, applicationData) => {
    try {
      const response = await api.post(
        `/events/${eventId}/applications`,
        applicationData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event analytics
  getEventAnalytics: async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/analytics`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event feedback
  getEventFeedback: async (eventId, params = {}) => {
    try {
      const response = await api.get(`/events/${eventId}/feedback`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export { eventApi };
export default eventApi;
