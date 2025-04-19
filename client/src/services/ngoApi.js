import api from "./api";

// NGO-related API endpoints
const ngoApi = {
  // Get NGO profile
  getProfile: async () => {
    try {
      const response = await api.get("/ngos/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update NGO profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/ngos/profile", profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get NGO dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get("/ngos/dashboard/stats");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all events created by the NGO
  getEvents: async (params = {}) => {
    try {
      const response = await api.get("/ngos/events", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event details by ID
  getEventById: async (eventId) => {
    try {
      const response = await api.get(`/ngos/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post("/ngos/events", eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an existing event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/ngos/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/ngos/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all volunteer applications for an event
  getEventApplications: async (eventId, params = {}) => {
    try {
      const response = await api.get(`/ngos/events/${eventId}/applications`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all applications for the NGO
  getApplications: async (params = {}) => {
    try {
      const response = await api.get("/ngos/applications", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get count of pending applications
  getPendingApplicationsCount: async () => {
    try {
      const response = await api.get("/ngos/applications/pending/count");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get application details by ID
  getApplicationById: async (applicationId) => {
    try {
      const response = await api.get(`/ngos/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Approve a volunteer application
  approveApplication: async (applicationId) => {
    try {
      const response = await api.put(
        `/ngos/applications/${applicationId}/approve`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject a volunteer application
  rejectApplication: async (applicationId, reason = "") => {
    try {
      const response = await api.put(
        `/ngos/applications/${applicationId}/reject`,
        { reason }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Withdraw a volunteer application
  withdrawApplication: async (applicationId, reason = "") => {
    try {
      const response = await api.put(
        `/ngos/applications/${applicationId}/withdraw`,
        { reason }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove a volunteer from an event
   * @param {string} eventId - The ID of the event
   * @param {string} volunteerId - The ID of the volunteer to remove
   * @param {string} reason - Optional reason for removal
   * @returns {Promise} The API response
   */
  removeVolunteerFromEvent: async (eventId, volunteerId, reason = "") => {
    try {
      const response = await api.put(
        `/events/${eventId}/remove-volunteer/${volunteerId}`,
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error("Error removing volunteer from event:", error);
      throw error;
    }
  },

  // Get all volunteers for an NGO
  getVolunteers: async (params = {}) => {
    try {
      const response = await api.get("/ngos/volunteers", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer details by ID
  getVolunteerById: async (volunteerId) => {
    try {
      const response = await api.get(`/ngos/volunteers/${volunteerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer events by ID
  getVolunteerEvents: async (volunteerId) => {
    try {
      const response = await api.get(`/ngos/volunteers/${volunteerId}/events`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event attendance
  getEventAttendance: async (eventId, params = {}) => {
    try {
      const response = await api.get(`/ngos/events/${eventId}/attendance`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark volunteer attendance for an event
  markAttendance: async (eventId, attendanceData) => {
    try {
      const response = await api.post(
        `/ngos/events/${eventId}/attendance`,
        attendanceData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Issue certificates to volunteers
  issueCertificates: async (eventId, certificateData) => {
    try {
      const response = await api.post(
        `/ngos/events/${eventId}/certificates`,
        certificateData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get feedback from volunteers
  getVolunteerFeedback: async (params = {}) => {
    try {
      const response = await api.get("/ngos/feedback", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit feedback for volunteers
  submitVolunteerFeedback: async (volunteerId, feedbackData) => {
    try {
      const response = await api.post(
        `/ngos/volunteers/${volunteerId}/feedback`,
        feedbackData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get NGO analytics
  getAnalytics: async (params = {}) => {
    try {
      const response = await api.get("/ngos/analytics", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event categories
  getEventCategories: async () => {
    try {
      const response = await api.get("/ngos/event-categories");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer skills
  getVolunteerSkills: async () => {
    try {
      const response = await api.get("/ngos/volunteer-skills");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export { ngoApi };
export default ngoApi;
