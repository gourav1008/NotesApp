import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',  // Use explicit backend URL in development
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
  withCredentials: true  // Enable sending cookies and auth headers
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
    if (error.response?.status === 401) {
      // Clear token on auth error
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
