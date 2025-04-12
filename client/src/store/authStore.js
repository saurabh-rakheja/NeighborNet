import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import useUserStore from "./slices/userStore";

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  // Add additional configuration for reliability
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Include cookies in cross-site requests
});

// Add request interceptor for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error("API Error Response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response:", {
        request: error.request,
        url: error.config.url,
        method: error.config.method,
      });
    } else {
      // Something happened in setting up the request
      console.error("API Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Auth store with persisted state
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // Set error state
      setError: (error) => set({ error }),

      // Clear error state
      clearError: () => set({ error: null }),

      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/login", { email, password });
          const { user, token } = response.data;

          // Store token in localStorage for interceptor
          localStorage.setItem("auth-token", token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Also fetch user data
          const userStore = useUserStore.getState();
          userStore.fetchProfile();
          userStore.fetchStats();

          return { success: true, message: "Login successful" };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Login failed. Please try again.";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });

        // Log request (without sensitive info) for debugging
        console.log("Registration request initiated:", {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          organization: userData.organization,
          // Exclude passwords
        });

        try {
          // Ensure the API URL is correct
          console.log("API base URL:", api.defaults.baseURL);

          const response = await api.post("/auth/register", userData);
          console.log(
            "Registration response:",
            response.status,
            response.statusText
          );

          const { user, token } = response.data;

          // Store token in localStorage for interceptor
          localStorage.setItem("auth-token", token);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true, message: "Registration successful" };
        } catch (error) {
          console.error("Registration error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });

          const errorMessage =
            error.response?.data?.message ||
            "Registration failed. Please try again.";
          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      // Logout action
      logout: () => {
        // Clear token from localStorage
        localStorage.removeItem("auth-token");

        // Clear user data from userStore
        const userStore = useUserStore.getState();
        userStore.clearUserData();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });

        return { success: true, message: "Logout successful" };
      },

      // Refresh user data
      refreshUserData: async () => {
        if (!get().token)
          return { success: false, message: "No authentication token found" };

        set({ isLoading: true });

        try {
          const response = await api.get("/auth/me");
          set({
            user: response.data.user,
            isLoading: false,
          });

          return { success: true, message: "User data refreshed" };
        } catch (error) {
          // If token is invalid or expired, log out the user
          if (error.response?.status === 401) {
            get().logout();
            return {
              success: false,
              message: "Session expired. Please login again.",
            };
          }

          set({
            isLoading: false,
            error:
              error.response?.data?.message || "Failed to refresh user data",
          });

          return { success: false, message: "Failed to refresh user data" };
        }
      },

      // Check auth status on app initialization
      checkAuthStatus: async () => {
        const token = localStorage.getItem("auth-token");

        if (!token) {
          get().logout();
          return false;
        }

        try {
          const response = await api.get("/auth/me");
          set({
            user: response.data.user,
            token,
            isAuthenticated: true,
          });

          // Also fetch user data
          const userStore = useUserStore.getState();
          userStore.fetchProfile();
          userStore.fetchStats();

          return true;
        } catch (error) {
          // If token is invalid, log out the user
          get().logout();
          return false;
        }
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        if (!get().token)
          return { success: false, message: "Not authenticated" };

        set({ isLoading: true, error: null });

        try {
          const response = await api.put("/auth/change-password", {
            currentPassword,
            newPassword,
          });

          set({ isLoading: false });

          return {
            success: true,
            message: response.data.message || "Password changed successfully",
          };
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to change password",
          });

          return {
            success: false,
            message:
              error.response?.data?.message || "Failed to change password",
          };
        }
      },

      // Request password reset
      requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/forgot-password", { email });

          set({ isLoading: false });

          return {
            success: true,
            message:
              response.data.message ||
              "Password reset instructions sent to your email",
          };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to request password reset";

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },

      // Reset password with token
      resetPassword: async (token, newPassword) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/auth/reset-password", {
            token,
            newPassword,
          });

          set({ isLoading: false });

          return {
            success: true,
            message:
              response.data.message || "Password has been reset successfully",
          };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to reset password";

          set({
            isLoading: false,
            error: errorMessage,
          });

          return { success: false, message: errorMessage };
        }
      },
    }),
    {
      name: "auth-storage",
      // Only persist these fields
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
