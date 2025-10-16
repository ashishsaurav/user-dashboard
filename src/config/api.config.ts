/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 * Connected to .NET Core Backend
 */

export const API_CONFIG = {
  // Base URL - .NET Core backend
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://localhost:7273/api',
  
  // Timeout settings (in milliseconds)
  TIMEOUT: 30000, // 30 seconds
  
  // Retry settings
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
    BACKOFF_MULTIPLIER: 2, // exponential backoff
  },
  
  // Authentication (currently email-based, no JWT yet)
  AUTH: {
    USER_KEY: 'current_user',
    TOKEN_KEY: 'auth_token',
    REFRESH_TOKEN_KEY: 'refresh_token',
    TOKEN_HEADER: 'Authorization',
    TOKEN_PREFIX: 'Bearer',
  },
  
  // Cache settings
  CACHE: {
    ENABLED: false, // Disabled - using real API
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  },
} as const;

/**
 * API Endpoints
 * Centralized endpoint definitions for .NET Core Backend
 */
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/users/login',
    GET_USER: (userId: string) => `/users/${userId}`,
    LIST_USERS: '/users',
  },
  
  // Reports
  REPORTS: {
    LIST: '/reports',
    GET: (id: string) => `/reports/${id}`,
    BY_ROLE: (roleId: string) => `/reports/role/${roleId}`,
    CREATE: '/reports',
    UPDATE: (id: string) => `/reports/${id}`,
    DELETE: (id: string) => `/reports/${id}`,
    ASSIGN_TO_ROLE: (roleId: string) => `/reports/role/${roleId}/assign`,
    UNASSIGN_FROM_ROLE: (roleId: string, reportId: string) => `/reports/role/${roleId}/unassign/${reportId}`,
  },
  
  // Widgets
  WIDGETS: {
    LIST: '/widgets',
    GET: (id: string) => `/widgets/${id}`,
    BY_ROLE: (roleId: string) => `/widgets/role/${roleId}`,
    CREATE: '/widgets',
    UPDATE: (id: string) => `/widgets/${id}`,
    DELETE: (id: string) => `/widgets/${id}`,
    ASSIGN_TO_ROLE: (roleId: string) => `/widgets/role/${roleId}/assign`,
    UNASSIGN_FROM_ROLE: (roleId: string, widgetId: string) => `/widgets/role/${roleId}/unassign/${widgetId}`,
  },
  
  // Views
  VIEWS: {
    BY_USER: (userId: string) => `/views/user/${userId}`,
    GET: (id: string, userId: string) => `/views/${id}?userId=${userId}`,
    CREATE: '/views',
    UPDATE: (id: string) => `/views/${id}`,
    DELETE: (id: string, userId: string) => `/views/${id}?userId=${userId}`,
    ADD_REPORTS: (id: string) => `/views/${id}/reports`,
    REMOVE_REPORT: (viewId: string, reportId: string, userId: string) => `/views/${viewId}/reports/${reportId}?userId=${userId}`,
    ADD_WIDGETS: (id: string) => `/views/${id}/widgets`,
    REMOVE_WIDGET: (viewId: string, widgetId: string, userId: string) => `/views/${viewId}/widgets/${widgetId}?userId=${userId}`,
    REORDER_REPORTS: (id: string) => `/views/${id}/reports/reorder`,
    REORDER_WIDGETS: (id: string) => `/views/${id}/widgets/reorder`,
  },
  
  // View Groups
  VIEW_GROUPS: {
    BY_USER: (userId: string) => `/viewgroups/user/${userId}`,
    GET: (id: string, userId: string) => `/viewgroups/${id}?userId=${userId}`,
    CREATE: '/viewgroups',
    UPDATE: (id: string) => `/viewgroups/${id}`,
    DELETE: (id: string, userId: string) => `/viewgroups/${id}?userId=${userId}`,
    REORDER: '/viewgroups/reorder',
    ADD_VIEWS: (id: string) => `/viewgroups/${id}/views`,
    REMOVE_VIEW: (viewGroupId: string, viewId: string, userId: string) => `/viewgroups/${viewGroupId}/views/${viewId}?userId=${userId}`,
    REORDER_VIEWS: (id: string) => `/viewgroups/${id}/views/reorder`,
  },
  
  // Navigation Settings
  NAVIGATION: {
    GET: (userId: string) => `/navigation/${userId}`,
    UPDATE: (userId: string) => `/navigation/${userId}`,
    RESET: (userId: string) => `/navigation/${userId}`,
  },
  
  // Layout Customizations
  LAYOUT: {
    GET_ALL: (userId: string) => `/layout/${userId}`,
    GET: (userId: string, signature: string) => `/layout/${userId}/${signature}`,
    SAVE: (userId: string) => `/layout/${userId}`,
    DELETE: (userId: string, signature: string) => `/layout/${userId}/${signature}`,
    DELETE_ALL: (userId: string) => `/layout/${userId}`,
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
