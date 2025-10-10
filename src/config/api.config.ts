/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  // Base URL - should come from environment variables
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  
  // API version
  VERSION: 'v1',
  
  // Timeout settings (in milliseconds)
  TIMEOUT: 30000, // 30 seconds
  
  // Retry settings
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
    BACKOFF_MULTIPLIER: 2, // exponential backoff
  },
  
  // Authentication
  AUTH: {
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    TOKEN_HEADER: 'Authorization',
    TOKEN_PREFIX: 'Bearer',
  },
  
  // Cache settings
  CACHE: {
    ENABLED: true,
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  },
} as const;

/**
 * API Endpoints
 * Centralized endpoint definitions
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  
  // Reports
  REPORTS: {
    LIST: '/reports',
    GET: (id: string) => `/reports/${id}`,
    CREATE: '/reports',
    UPDATE: (id: string) => `/reports/${id}`,
    DELETE: (id: string) => `/reports/${id}`,
  },
  
  // Widgets
  WIDGETS: {
    LIST: '/widgets',
    GET: (id: string) => `/widgets/${id}`,
    CREATE: '/widgets',
    UPDATE: (id: string) => `/widgets/${id}`,
    DELETE: (id: string) => `/widgets/${id}`,
  },
  
  // Views
  VIEWS: {
    LIST: '/views',
    GET: (id: string) => `/views/${id}`,
    CREATE: '/views',
    UPDATE: (id: string) => `/views/${id}`,
    DELETE: (id: string) => `/views/${id}`,
    BY_USER: (userId: string) => `/views/user/${userId}`,
  },
  
  // View Groups
  VIEW_GROUPS: {
    LIST: '/view-groups',
    GET: (id: string) => `/view-groups/${id}`,
    CREATE: '/view-groups',
    UPDATE: (id: string) => `/view-groups/${id}`,
    DELETE: (id: string) => `/view-groups/${id}`,
    BY_USER: (userId: string) => `/view-groups/user/${userId}`,
  },
  
  // User Settings
  USER_SETTINGS: {
    GET: (userId: string) => `/users/${userId}/settings`,
    UPDATE: (userId: string) => `/users/${userId}/settings`,
    LAYOUT: (userId: string) => `/users/${userId}/settings/layout`,
  },
  
  // Navigation
  NAVIGATION: {
    GET: (userId: string) => `/users/${userId}/navigation`,
    UPDATE: (userId: string) => `/users/${userId}/navigation`,
  },
} as const;

/**
 * HTTP Methods
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * Response status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}
