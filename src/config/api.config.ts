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
  // Authentication (Note: Backend uses capital 'U' in /Users/)
  AUTH: {
    LOGIN: '/Users/login',
    GET_USER: (userId: string) => `/Users/${userId}`,
    LIST_USERS: '/Users',
  },
  
  // Reports (Note: Backend uses capital 'R' in /Reports/)
  REPORTS: {
    LIST: '/Reports',
    GET: (id: string) => `/Reports/${id}`,
    BY_ROLE: (roleId: string) => `/Reports/role/${roleId}`,
    CREATE: '/Reports',
    UPDATE: (id: string) => `/Reports/${id}`,
    DELETE: (id: string) => `/Reports/${id}`,
    ASSIGN_TO_ROLE: (roleId: string) => `/Reports/role/${roleId}/assign`,
    UNASSIGN_FROM_ROLE: (roleId: string, reportId: string) => `/Reports/role/${roleId}/unassign/${reportId}`,
  },
  
  // Widgets (Note: Backend uses capital 'W' in /Widgets/)
  WIDGETS: {
    LIST: '/Widgets',
    GET: (id: string) => `/Widgets/${id}`,
    BY_ROLE: (roleId: string) => `/Widgets/role/${roleId}`,
    CREATE: '/Widgets',
    UPDATE: (id: string) => `/Widgets/${id}`,
    DELETE: (id: string) => `/Widgets/${id}`,
    ASSIGN_TO_ROLE: (roleId: string) => `/Widgets/role/${roleId}/assign`,
    UNASSIGN_FROM_ROLE: (roleId: string, widgetId: string) => `/Widgets/role/${roleId}/unassign/${widgetId}`,
  },
  
  // Views (Note: Backend uses capital 'V' in /Views/)
  VIEWS: {
    BY_USER: (userId: string) => `/Views/user/${userId}`,
    GET: (id: string, userId: string) => `/Views/${id}?userId=${userId}`,
    CREATE: '/Views',
    UPDATE: (id: string) => `/Views/${id}`,
    DELETE: (id: string, userId: string) => `/Views/${id}?userId=${userId}`,
    ADD_REPORTS: (id: string) => `/Views/${id}/reports`,
    REMOVE_REPORT: (viewId: string, reportId: string, userId: string) => `/Views/${viewId}/reports/${reportId}?userId=${userId}`,
    ADD_WIDGETS: (id: string) => `/Views/${id}/widgets`,
    REMOVE_WIDGET: (viewId: string, widgetId: string, userId: string) => `/Views/${viewId}/widgets/${widgetId}?userId=${userId}`,
    REORDER_REPORTS: (id: string) => `/Views/${id}/reports/reorder`,
    REORDER_WIDGETS: (id: string) => `/Views/${id}/widgets/reorder`,
  },
  
  // View Groups (Note: Backend uses capital 'V' and 'G' in /ViewGroups/)
  VIEW_GROUPS: {
    BY_USER: (userId: string) => `/ViewGroups/user/${userId}`,
    GET: (id: string, userId: string) => `/ViewGroups/${id}?userId=${userId}`,
    CREATE: '/ViewGroups',
    UPDATE: (id: string) => `/ViewGroups/${id}`,
    DELETE: (id: string, userId: string) => `/ViewGroups/${id}?userId=${userId}`,
    REORDER: '/ViewGroups/reorder',
    ADD_VIEWS: (id: string) => `/ViewGroups/${id}/views`,
    REMOVE_VIEW: (viewGroupId: string, viewId: string, userId: string) => `/ViewGroups/${viewGroupId}/views/${viewId}?userId=${userId}`,
    REORDER_VIEWS: (id: string) => `/ViewGroups/${id}/views/reorder`,
  },
  
  // Navigation Settings (Note: Backend uses capital 'N' in /Navigation/)
  NAVIGATION: {
    GET: (userId: string) => `/Navigation/${userId}`,
    UPDATE: (userId: string) => `/Navigation/${userId}`,
    RESET: (userId: string) => `/Navigation/${userId}`,
  },
  
  // Layout Customizations (Note: Backend uses capital 'L' in /Layout/)
  LAYOUT: {
    GET_ALL: (userId: string) => `/Layout/${userId}`,
    GET: (userId: string, signature: string) => `/Layout/${userId}/${signature}`,
    SAVE: (userId: string) => `/Layout/${userId}`,
    DELETE: (userId: string, signature: string) => `/Layout/${userId}/${signature}`,
    DELETE_ALL: (userId: string) => `/Layout/${userId}`,
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
