import axios from 'axios';
import { offlineService } from './offline';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Cache data on successful responses for offline use
    if (response.config.method === 'get') {
      const url = response.config.url || '';
      
      if (url.includes('/products')) {
        offlineService.cacheData({ products: response.data.results || response.data });
      } else if (url.includes('/customers')) {
        offlineService.cacheData({ customers: response.data.results || response.data });
      } else if (url.includes('/suppliers')) {
        offlineService.cacheData({ suppliers: response.data.results || response.data });
      } else if (url.includes('/settings')) {
        offlineService.cacheData({ settings: response.data });
      }
    }
    
    return response;
  },
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
      return Promise.reject(error);
    }

    // Handle network errors - check if offline
    if (!error.response && error.code === 'ERR_NETWORK') {
      console.log('Network error detected, may be offline');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
