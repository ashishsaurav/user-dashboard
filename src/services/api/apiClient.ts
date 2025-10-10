/**
 * API Client
 * Central HTTP client with interceptors, error handling, and retry logic
 */

import { API_CONFIG, HttpMethod, HttpStatus } from '../../config/api.config';

export interface ApiRequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retry?: boolean;
  cache?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * API Client class with built-in error handling and interceptors
 */
class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: Array<(config: ApiRequestConfig) => ApiRequestConfig> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: (config: ApiRequestConfig) => ApiRequestConfig) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.defaultHeaders[API_CONFIG.AUTH.TOKEN_HEADER] = 
      `${API_CONFIG.AUTH.TOKEN_PREFIX} ${token}`;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    delete this.defaultHeaders[API_CONFIG.AUTH.TOKEN_HEADER];
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * Check cache for GET requests
   */
  private checkCache(url: string): any | null {
    if (!API_CONFIG.CACHE.ENABLED) return null;
    
    const cached = this.cache.get(url);
    if (cached) {
      const isExpired = Date.now() - cached.timestamp > API_CONFIG.CACHE.DEFAULT_TTL;
      if (!isExpired) {
        console.log(`[API Cache] Hit: ${url}`);
        return cached.data;
      }
      this.cache.delete(url);
    }
    return null;
  }

  /**
   * Set cache for GET requests
   */
  private setCache(url: string, data: any) {
    if (!API_CONFIG.CACHE.ENABLED) return;
    
    this.cache.set(url, {
      data,
      timestamp: Date.now(),
    });
    console.log(`[API Cache] Set: ${url}`);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('[API Cache] Cleared');
  }

  /**
   * Make HTTP request with retry logic
   */
  private async requestWithRetry<T>(
    url: string,
    config: ApiRequestConfig,
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.makeRequest<T>(url, config);
      return response;
    } catch (error: any) {
      const shouldRetry = 
        config.retry !== false &&
        attempt < API_CONFIG.RETRY.MAX_ATTEMPTS &&
        (error.status === HttpStatus.SERVICE_UNAVAILABLE || 
         error.status === HttpStatus.INTERNAL_SERVER_ERROR ||
         !error.status); // Network errors

      if (shouldRetry) {
        const delay = API_CONFIG.RETRY.DELAY * Math.pow(API_CONFIG.RETRY.BACKOFF_MULTIPLIER, attempt - 1);
        console.log(`[API Retry] Attempt ${attempt + 1} after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.requestWithRetry<T>(url, config, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Make HTTP request
   */
  private async makeRequest<T>(url: string, config: ApiRequestConfig): Promise<ApiResponse<T>> {
    // Apply request interceptors
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      finalConfig = interceptor(finalConfig);
    }

    const headers = {
      ...this.defaultHeaders,
      ...finalConfig.headers,
    };

    const requestInit: RequestInit = {
      method: finalConfig.method || HttpMethod.GET,
      headers,
      signal: AbortSignal.timeout(finalConfig.timeout || API_CONFIG.TIMEOUT),
    };

    if (finalConfig.body) {
      requestInit.body = JSON.stringify(finalConfig.body);
    }

    console.log(`[API Request] ${requestInit.method} ${url}`);

    let response = await fetch(url, requestInit);

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response);
    }

    // Handle errors
    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      const apiError: ApiError = {
        message: errorData.message || 'An error occurred',
        status: response.status,
        code: errorData.code,
        details: errorData.details,
      };

      console.error(`[API Error] ${response.status}:`, apiError);
      throw apiError;
    }

    // Parse response
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as any;
    }

    console.log(`[API Response] ${response.status}:`, data);

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config.params);
    
    // Check cache for GET requests
    if (config.cache !== false) {
      const cachedData = this.checkCache(url);
      if (cachedData) {
        return {
          data: cachedData,
          status: 200,
          statusText: 'OK (cached)',
          headers: new Headers(),
        };
      }
    }
    
    const response = await this.requestWithRetry<T>(url, { ...config, method: HttpMethod.GET });
    
    // Cache GET responses
    if (config.cache !== false) {
      this.setCache(url, response.data);
    }
    
    return response;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config.params);
    return this.requestWithRetry<T>(url, { ...config, method: HttpMethod.POST, body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config.params);
    return this.requestWithRetry<T>(url, { ...config, method: HttpMethod.PUT, body });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config.params);
    return this.requestWithRetry<T>(url, { ...config, method: HttpMethod.PATCH, body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, config.params);
    return this.requestWithRetry<T>(url, { ...config, method: HttpMethod.DELETE });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Add default interceptors
apiClient.addRequestInterceptor((config) => {
  // Add timestamp to prevent caching issues
  if (!config.params) config.params = {};
  // Uncomment to add timestamp to all requests
  // config.params._t = Date.now();
  return config;
});

apiClient.addResponseInterceptor(async (response) => {
  // Handle 401 Unauthorized - could trigger logout/refresh
  if (response.status === HttpStatus.UNAUTHORIZED) {
    console.warn('[API] Unauthorized access detected');
    // Trigger logout or token refresh here
  }
  return response;
});

export default apiClient;
