import axios from 'axios';

// Base URL berdasarkan environment variable VITE_API_URL
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8069';  // Fallback ke localhost jika VITE_API_URL tidak tersedia
const BASE_URL = '';  // Fallback ke localhost jika VITE_API_URL tidak tersedia

const apiClient = axios.create({
  baseURL: BASE_URL,
  // timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true  // Penting untuk CORS dengan credentials
});

// Request Interceptor
apiClient.interceptors.request.use(
  config => {
    // Session Headers
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      config.headers['X-Openerp-Session-Id'] = sessionId;
    }

    // Tambahkan Origin header jika di production
    if (import.meta.env.PROD) {
      config.headers['Origin'] = window.location.origin;
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.log('Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
    }

    return config;
  },
  error => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 405) {
      console.error('Method Not Allowed Error:', {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
