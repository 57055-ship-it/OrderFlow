import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('orderflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 unauthorized / deactivation globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.data?.message?.includes('deactivated') || error.response.data?.message?.includes('Not authorized')) {
        // Clear token if invalid or deactivated
        localStorage.removeItem('orderflow_token');
        localStorage.removeItem('orderflow_user');
      }
    }
    return Promise.reject(error.response?.data || { message: error.message || 'Network error' });
  }
);

export default api;
