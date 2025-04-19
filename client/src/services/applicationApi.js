import api from "./api";

// Application-related API endpoints
const applicationApi = {
  // Get all applications for an NGO
  getApplications: async (params = {}) => {
    try {
      const response = await api.get("/applications", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a specific application by ID
  getApplicationById: async (id) => {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get applications for a specific event
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

  // Approve an application
  approveApplication: async (applicationId) => {
    try {
      const response = await api.put(`/applications/${applicationId}/approve`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reject an application
  rejectApplication: async (applicationId, reason = "") => {
    try {
      const response = await api.put(`/applications/${applicationId}/reject`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get application statistics
  getApplicationStats: async () => {
    try {
      const response = await api.get("/applications/stats");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get pending applications count
  getPendingCount: async () => {
    try {
      const response = await api.get("/applications/pending-count");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new volunteer application
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

  // Update an application
  updateApplication: async (applicationId, applicationData) => {
    try {
      const response = await api.put(
        `/applications/${applicationId}`,
        applicationData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete an application
  deleteApplication: async (applicationId) => {
    try {
      const response = await api.delete(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send message to applicant
  sendMessageToApplicant: async (applicationId, messageData) => {
    try {
      const response = await api.post(
        `/applications/${applicationId}/message`,
        messageData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export { applicationApi };
export default applicationApi;
