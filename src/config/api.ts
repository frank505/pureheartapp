/**
 * API Configuration
 * 
 * This file sets up the base URL for the API based on the environment (development or production).
 * It exports the appropriate base URL for use throughout the application.
 */

// Define the base URLs for production and development
const prodBaseURL = 'https://api.thepurityapp.com/api';
// const devBaseURL = 'http://localhost:3036/api';
const devBaseURL = 'https://api.thepurityapp.com/api';

// Export the appropriate base URL based on the environment
const baseURL = __DEV__ ? devBaseURL : prodBaseURL;

export default baseURL;

