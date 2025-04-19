import api from "./api";

// Volunteer-related API endpoints
const volunteerApi = {
  // Get volunteer profile
  getProfile: async () => {
    try {
      const response = await api.get("/volunteers/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update volunteer profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/volunteers/profile", profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get("/volunteers/dashboard/stats");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer upcoming events
  getUpcomingEvents: async (params = {}) => {
    try {
      const response = await api.get("/volunteers/events/upcoming", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer past events
  getPastEvents: async (params = {}) => {
    try {
      const response = await api.get("/volunteers/events/past", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer applications
  getApplications: async (params = {}) => {
    try {
      const response = await api.get("/events/applications", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get application details
  getApplicationById: async (applicationId) => {
    try {
      const response = await api.get(
        `/volunteers/applications/${applicationId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancel an application
  cancelApplication: async (applicationId) => {
    try {
      const response = await api.put(
        `/volunteers/applications/${applicationId}/cancel`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer skills
  getSkills: async () => {
    try {
      const response = await api.get("/volunteers/skills");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update volunteer skills
  updateSkills: async (skillsData) => {
    try {
      const response = await api.put("/volunteers/skills", skillsData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer certificates
  getCertificates: async (params = {}) => {
    try {
      const response = await api.get("/volunteers/certificates", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get certificate details
  getCertificateById: async (certificateId) => {
    try {
      const response = await api.get(
        `/volunteers/certificates/${certificateId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download certificate
  downloadCertificate: async (certificateId) => {
    try {
      const response = await api.get(
        `/volunteers/certificates/${certificateId}/download`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer feedback
  getFeedback: async (params = {}) => {
    try {
      const response = await api.get("/volunteers/feedback", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit feedback for an NGO or event
  submitFeedback: async (feedbackData) => {
    try {
      const response = await api.post("/volunteers/feedback", feedbackData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer hours
  getVolunteerHours: async (params = {}) => {
    try {
      const response = await api.get("/volunteers/hours", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get volunteer impact statistics
  getImpactStats: async () => {
    try {
      const response = await api.get("/volunteers/impact");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get recommended events for volunteer
  getRecommendedEvents: async (params = {}) => {
    try {
      const response = await api.get("/volunteers/events/recommended", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Apply for an event
  applyForEvent: async (eventId, applicationData = {}) => {
    try {
      const response = await api.post(
        `/events/${eventId}/apply`,
        applicationData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Withdraw application from an event
  withdrawApplication: async (applicationId, reason = "") => {
    try {
      const response = await api.put(
        `/volunteers/applications/${applicationId}/withdraw`,
        { reason }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Withdraw from an approved event
  withdrawFromEvent: async (eventId, reason = "") => {
    try {
      const response = await api.put(
        `/events/${eventId}/withdraw-participation`,
        { reason }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search for events
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

  // Submit feedback for completed event
  submitEventFeedback: async (eventId, feedbackData) => {
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

  // Withdraw from an event the volunteer is participating in
  withdrawFromEvent: async (eventId, reason) => {
    try {
      const response = await api.delete(
        `/volunteer/events/${eventId}/withdraw`,
        {
          data: { reason },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error withdrawing from event:", error);
      throw error;
    }
  },
};

export { volunteerApi };
export default volunteerApi;
