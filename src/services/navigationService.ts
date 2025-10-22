/**
 * Navigation Service
 * Handles navigation settings API calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { UserNavigationSettings } from '../types';

interface NavigationSettingDto {
  id: number;
  userId: string;
  viewGroupOrder: string[];
  viewOrders: Record<string, string[]>;
  hiddenViewGroups: string[];
  hiddenViews: string[];
  expandedViewGroups?: string[]; // NEW: Track expanded view groups
  isNavigationCollapsed?: boolean; // NEW: Track navigation panel collapse state
}

export class NavigationService {
  /**
   * Get navigation settings for user
   */
  async getNavigationSettings(userId: string): Promise<UserNavigationSettings> {
    const settings = await apiClient.get<NavigationSettingDto>(
      API_ENDPOINTS.NAVIGATION.GET(userId)
    );
    return this.transformToFrontend(settings);
  }

  /**
   * Update navigation settings
   */
  async updateNavigationSettings(
    userId: string,
    settings: UserNavigationSettings
  ): Promise<UserNavigationSettings> {
    const dto = this.transformToBackend(settings);
    const updated = await apiClient.put<NavigationSettingDto>(
      API_ENDPOINTS.NAVIGATION.UPDATE(userId),
      dto
    );
    return this.transformToFrontend(updated);
  }

  /**
   * Reset navigation settings
   */
  async resetNavigationSettings(userId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NAVIGATION.RESET(userId));
  }

  /**
   * Transform backend DTO to frontend type
   */
  private transformToFrontend(dto: NavigationSettingDto): UserNavigationSettings {
    return {
      userId: dto.userId,
      viewGroupOrder: dto.viewGroupOrder || [],
      viewOrders: dto.viewOrders || {},
      hiddenViewGroups: dto.hiddenViewGroups || [],
      hiddenViews: dto.hiddenViews || [],
      expandedViewGroups: dto.expandedViewGroups || [], // Default to empty (all collapsed)
      isNavigationCollapsed: dto.isNavigationCollapsed || false, // Default to expanded
    };
  }

  /**
   * Transform frontend type to backend DTO
   */
  private transformToBackend(settings: UserNavigationSettings) {
    return {
      viewGroupOrder: settings.viewGroupOrder,
      viewOrders: settings.viewOrders,
      hiddenViewGroups: settings.hiddenViewGroups,
      hiddenViews: settings.hiddenViews,
      expandedViewGroups: settings.expandedViewGroups || [],
      isNavigationCollapsed: settings.isNavigationCollapsed || false,
    };
  }
}

export const navigationService = new NavigationService();
export default navigationService;
