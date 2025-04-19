import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle session expiration
    if (response && response.status === 401) {
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
    }

    // Create a standardized error object
    const errorObj = {
      message: response?.data?.message || "Network error occurred",
      status: response?.status || "unknown",
      data: response?.data || {},
    };

    return Promise.reject(errorObj);
  }
);

// Events API
const eventsApi = {
  // Get all events with optional filters
  getEvents: async (params = {}) => {
    try {
      const response = await api.get("/events", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get NGO dashboard events with pagination and filters
  getNgoDashboardEvents: async (params = {}) => {
    try {
      const response = await api.get("/events/ngo/dashboard", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single event by ID
  getEvent: async (id) => {
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
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get event volunteers
  getEventVolunteers: async (id) => {
    try {
      const response = await api.get(`/events/${id}/volunteers`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Export the configured axios instance and specific API modules
export { api, eventsApi };
export default api;
