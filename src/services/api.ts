/**
 * Generic API Service
 * 
 * This file provides a generic API service using axios for making HTTP requests.
 * It includes an instance of axios with a base URL and a request interceptor
 * to add the auth token to headers if it exists.
 */

import axios from 'axios';
import { Alert } from 'react-native';
import baseURL from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout } from '../store/slices/userSlice';
import { showPaywall } from '../store/slices/paywallSlice';

// Create an axios instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response) {
      // Handle 401 (Unauthorized) errors
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        // Check if user is still authenticated before dispatching logout
        const { user } = store.getState();
        if (user.isAuthenticated) {
          // Dispatch logout action
          store.dispatch(logout());
          
          // Show alert to user
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
            [{ text: 'OK' }]
          );
          
          await AsyncStorage.removeItem('userToken');
        }
      }
      
      // Handle 402 (Payment Required) with paywall payload
      if (error.response.status === 402 && error.response.data?.paywall) {
        try {
          const { feature, trialEndsAt, trialEnded, message } = error.response.data;
          store.dispatch(showPaywall({ feature, trialEndsAt, trialEnded, message }));
        } catch {}
      }

      // Handle 403 (Forbidden) errors
      if (error.response.status === 403) {
        const message = error.response.data?.message;
        // Modify the error message to be more user-friendly
        const modifiedError = new Error();
        modifiedError.message = message || 'You do not have permission to perform this action.';
        
        // Show alert to user
        Alert.alert(
          'Access Denied',
          modifiedError.message,
          [{ text: 'OK' }]
        );
        
        // Replace the default axios error message
        error.message = modifiedError.message;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

