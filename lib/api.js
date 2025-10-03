import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API key to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const apiKey = localStorage.getItem('api-key');
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`;
    }
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast for network errors in development
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend API not available:', error.message);
      return Promise.reject(error);
    }
    
    const message = error.response?.data?.message || error.message || 'An error occurred';
    toast.error(message);
    
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('api-key');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: (username, password) => {
    // Mock login - in real app this would call backend
    return new Promise((resolve, reject) => {
      // Use hardcoded values since env vars might not be available in browser
      const adminUsername = process.env.ADMIN_USERNAME || "@dmin";
      const adminPassword = process.env.ADMIN_PASSWORD || "@dm$n9876623";

      if (username === adminUsername && password === adminPassword) {
        const token = "mock-jwt-token";
        const apiKey = process.env.NEXT_PUBLIC_API_KEY || "demo-api-key";

        if (typeof window !== "undefined") {
          localStorage.setItem("auth-token", token);
          localStorage.setItem("api-key", apiKey);
        }
        resolve({ token, user: { username } });
      } else {
        reject(new Error("Invalid credentials"));
      }
    });
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('api-key');
      window.location.href = '/login';
    }
  },
  
  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth-token');
  }
};

// Agents API
export const agentsAPI = {
  list: (params = {}) => api.get('/api/agents?limit=500', { params }),
  get: (id) => api.get(`/api/agents/${id}`),
  create: (data) => api.post('/api/agents', data),
  update: (id, data) => api.put(`/api/agents/${id}`, data),
  delete: (id) => api.delete(`/api/agents/${id}`),
  getStats: (params = {}) => api.get('/api/agents/stats/summary', { params }),
  getTopStats: (params = {}) => api.get('/api/agents/stats/top', { params }),
  getTimeseries: (params = {}) => api.get('/api/agents/stats/timeseries', { params }),
};

// Flex Messages API  
export const flexAPI = {
  list: (params = {}) => api.get('/api/flex', { params }),
  get: (id) => api.get(`/api/flex/${id}`),
  create: (data) => api.post('/api/flex', data),
  update: (id, data) => api.put(`/api/flex/${id}`, data),
  delete: (id) => api.delete(`/api/flex/${id}`),
  import: (data, overwrite = false) => api.post(`/api/flex/import?overwrite=${overwrite}`, data),
};

export default api;
