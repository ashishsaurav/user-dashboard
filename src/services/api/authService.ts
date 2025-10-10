/**
 * Authentication Service
 * Handles authentication, token management, and user session
 */

import { apiClient } from './apiClient';
import { API_CONFIG, API_ENDPOINTS } from '../../config/api.config';
import { User } from '../../types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Store tokens
    this.setTokens(response.data.token, response.data.refreshToken);
    
    // Set auth token in API client
    apiClient.setAuthToken(response.data.token);

    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
      apiClient.clearAuthToken();
      apiClient.clearCache();
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    this.setTokens(response.data.token, response.data.refreshToken);
    apiClient.setAuthToken(response.data.token);

    return response.data;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired (if you have JWT)
    // const decoded = this.decodeToken(token);
    // return decoded && decoded.exp > Date.now() / 1000;

    return true; // Simplified check
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(API_CONFIG.AUTH.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
  }

  /**
   * Store tokens
   */
  private setTokens(token: string, refreshToken?: string): void {
    localStorage.setItem(API_CONFIG.AUTH.TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Clear stored tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(API_CONFIG.AUTH.TOKEN_KEY);
    localStorage.removeItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
  }

  /**
   * Initialize auth on app start
   */
  async initialize(): Promise<User | null> {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }

    try {
      apiClient.setAuthToken(token);
      const user = await this.getCurrentUser();
      return user;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.clearTokens();
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
