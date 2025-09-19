import axios from 'axios';

// In production, use relative path, in development use the fallback port since we know it's running there
const baseURL = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different types of errors
    if (!error.response) {
      // Network error or server not responding
      error.message = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.response.status === 401) {
      // Clear token on auth error
      localStorage.removeItem('token');
      error.message = 'Authentication failed. Please log in again.';
    } else if (error.response.status === 400) {
      error.message = error.response.data?.message || 'Invalid request. Please check your input.';
    } else if (error.response.status === 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
