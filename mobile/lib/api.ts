import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import storage from '@/store/storage';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Get API URL from environment or use default
    this.baseURL = Constants.expoConfig?.extra?.apiBaseUrl || 
                   'http://localhost:5000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        try {
          const token = storage.getString('firebase_id_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Failed to get Firebase ID token from MMKV:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private async handleUnauthorized() {
    try {
      storage.delete('firebase_id_token');
      // Optionally, trigger navigation to login screen
      console.log('User unauthorized, redirecting to login');
    } catch (error) {
      console.error('Failed to handle unauthorized:', error);
    }
  }

  // API methods
  async get(endpoint: string, params?: any) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(endpoint: string, data?: any) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(endpoint: string, data?: any) {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint: string) {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      const message = error.response.data?.message || 
                     error.response.data?.error || 
                     `HTTP ${error.response.status}`;
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Helper method to set Firebase ID token
  setFirebaseIdToken(token: string) {
    try {
      storage.set('firebase_id_token', token);
    } catch (error) {
      console.error('Failed to save Firebase ID token:', error);
    }
  }

  // Helper method to clear Firebase ID token
  clearFirebaseIdToken() {
    try {
      storage.delete('firebase_id_token');
    } catch (error) {
      console.error('Failed to clear Firebase ID token:', error);
    }
  }
}

export default new ApiService();
