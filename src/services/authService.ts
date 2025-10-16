/**
 * Authentication Service
 * Handles user authentication and session management
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS, API_CONFIG } from '../config/api.config';
import { User } from '../types';

export interface LoginResponse {
  userId: string;
  username: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
}

export class AuthService {
  /**
   * Login with email
   */
  async login(email: string): Promise<User> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email }
    );

    console.log('🔐 Login Response from backend:', response);
    console.log('🔑 RoleId from backend:', response.roleId);

    // Transform backend response to frontend User type
    const user: User = {
      name: response.userId,
      username: response.username,
      password: '', // Not needed on frontend
      role: response.roleId as 'admin' | 'user' | 'viewer',
    };

    console.log('👤 Transformed User object:', user);
    console.log('👤 User role to be used for API calls:', user.role);

    // Store user in sessionStorage
    sessionStorage.setItem(API_CONFIG.AUTH.USER_KEY, JSON.stringify(user));

    return user;
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User> {
    const response = await apiClient.get<LoginResponse>(
      API_ENDPOINTS.AUTH.GET_USER(userId)
    );

    return {
      name: response.userId,
      username: response.username,
      password: '',
      role: response.roleId as 'admin' | 'user' | 'viewer',
    };
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<LoginResponse[]>(
      API_ENDPOINTS.AUTH.LIST_USERS
    );

    return response.map(r => ({
      name: r.userId,
      username: r.username,
      password: '',
      role: r.roleId as 'admin' | 'user' | 'viewer',
    }));
  }

  /**
   * Logout
   */
  logout(): void {
    sessionStorage.removeItem(API_CONFIG.AUTH.USER_KEY);
  }

  /**
   * Get current user from session
   */
  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem(API_CONFIG.AUTH.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();
export default authService;
