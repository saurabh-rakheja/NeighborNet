import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// API instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add axios interceptor for authenticated requests
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

// User store with persisted state
const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      profile: null,
      skills: [],
      interests: [],
      stats: {
        hoursLogged: 0,
        eventsCompleted: 0,
        upcomingEvents: 0,
      },
      isLoading: false,
      error: null,
      
      // Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Fetch user profile
      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get("/users/profile");
          
          set({
            profile: response.data.profile,
            isLoading: false,
          });
          
          return { success: true, profile: response.data.profile };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to fetch profile";
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, message: errorMessage };
        }
      },
      
      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.put("/users/profile", profileData);
          
          set({
            profile: response.data.profile,
            isLoading: false,
          });
          
          return { success: true, message: "Profile updated successfully" };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to update profile";
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, message: errorMessage };
        }
      },
      
      // Fetch user skills
      fetchSkills: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get("/users/skills");
          
          set({
            skills: response.data.skills,
            isLoading: false,
          });
          
          return { success: true, skills: response.data.skills };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to fetch skills";
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, message: errorMessage };
        }
      },
      
      // Update user skills
      updateSkills: async (skills) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.put("/users/skills", { skills });
          
          set({
            skills: response.data.skills,
            isLoading: false,
          });
          
          return { success: true, message: "Skills updated successfully" };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to update skills";
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, message: errorMessage };
        }
      },
      
      // Fetch user interests
      fetchInterests: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get("/users/interests");
          
          set({
            interests: response.data.interests,
            isLoading: false,
          });
          
          return { success: true, interests: response.data.interests };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to fetch interests";
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, message: errorMessage };
        }
      },
      
      // Update user interests
      updateInterests: async (interests) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.put("/users/interests", { interests });
          
          set({
            interests: response.data.interests,
            isLoading: false,
          });
          
          return { success: true, message: "Interests updated successfully" };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to update interests";
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, message: errorMessage };
        }
      },
      
      // Fetch user stats
      fetchStats: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get("/users/stats");
          
          set({
            stats: response.data.stats,
            isLoading: false,
          });
          
          return { success: true, stats: response.data.stats };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to fetch stats";
          set({
            isLoading: false,
            error: errorMessage,
          });
          
          return { success: false, message: errorMessage };
        }
      },
      
      // Clear user data (called when logout)
      clearUserData: () => {
        set({
          profile: null,
          skills: [],
          interests: [],
          stats: {
            hoursLogged: 0,
            eventsCompleted: 0,
            upcomingEvents: 0,
          },
          error: null,
        });
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        profile: state.profile,
        skills: state.skills,
        interests: state.interests,
      }),
    }
  )
);

export default useUserStore; 