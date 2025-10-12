// API Configuration
export const API_CONFIG = {
  // Base URL - using localhost for development
  BASE_URL: 'http://localhost:8000',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/api/auth/jwt/create/',
    REGISTER: '/api/users/register/',
    LOGOUT: '/api/auth/logout/',
    REFRESH_TOKEN: '/api/auth/jwt/refresh/',
    
    // User Management
    USER_PROFILE: '/api/users/profile/me/',
    UPDATE_PROFILE: '/api/users/profile/',
    GENERATE_GAMING_ID: '/api/users/profile/generate-gaming-id/',
    SEARCH_USERS: '/api/users/search/',
    
    // Tournaments
    TOURNAMENTS: '/api/tournaments/',
    TOURNAMENT_DETAIL: (id) => `/api/tournaments/${id}/`,
    JOIN_TOURNAMENT: (id) => `/api/tournaments/${id}/join/`,
    LEAVE_TOURNAMENT: (id) => `/api/tournaments/${id}/leave/`,
    
    // Leaderboard
    LEADERBOARD: '/api/leaderboard/',
  },
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Helper function to build full URL
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint
export const getEndpoint = (key, ...params) => {
  const endpoint = API_CONFIG.ENDPOINTS[key];
  return typeof endpoint === 'function' ? endpoint(...params) : endpoint;
};