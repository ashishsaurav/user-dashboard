/**
 * View Groups Service
 * Handles all view group-related API calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { ViewGroup } from '../types';

interface ViewGroupDto {
  viewGroupId: string;
  userId: string;
  name: string;
  isVisible: boolean;
  isDefault: boolean;
  orderIndex: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  viewIds: string[];
}

export class ViewGroupsService {
  /**
   * Get all view groups for a user
   */
  async getUserViewGroups(userId: string): Promise<ViewGroup[]> {
    const viewGroups = await apiClient.get<ViewGroupDto[]>(
      API_ENDPOINTS.VIEW_GROUPS.BY_USER(userId)
    );
    return viewGroups.map(this.transformToFrontend);
  }

  /**
   * Get view group by ID
   */
  async getViewGroup(id: string, userId: string): Promise<ViewGroup> {
    const viewGroup = await apiClient.get<ViewGroupDto>(
      API_ENDPOINTS.VIEW_GROUPS.GET(id, userId)
    );
    return this.transformToFrontend(viewGroup);
  }

  /**
   * Create view group
   */
  async createViewGroup(userId: string, data: {
    name: string;
    isVisible?: boolean;
    isDefault?: boolean;
    orderIndex?: number;
    viewIds?: string[];
  }): Promise<ViewGroup> {
    const viewGroup = await apiClient.post<ViewGroupDto>(
      API_ENDPOINTS.VIEW_GROUPS.CREATE,
      {
        userId,
        data: {
          name: data.name,
          isVisible: data.isVisible ?? true,
          isDefault: data.isDefault ?? false,
          orderIndex: data.orderIndex ?? 0,
          viewIds: data.viewIds || [],
        },
      }
    );
    return this.transformToFrontend(viewGroup);
  }

  /**
   * Update view group
   */
  async updateViewGroup(
    id: string,
    userId: string,
    data: {
      name: string;
      isVisible: boolean;
      isDefault: boolean;
      orderIndex: number;
    }
  ): Promise<ViewGroup> {
    const viewGroup = await apiClient.put<ViewGroupDto>(
      API_ENDPOINTS.VIEW_GROUPS.UPDATE(id),
      {
        userId,
        data,
      }
    );
    return this.transformToFrontend(viewGroup);
  }

  /**
   * Delete view group
   */
  async deleteViewGroup(id: string, userId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.VIEW_GROUPS.DELETE(id, userId));
  }

  /**
   * Reorder view groups
   */
  async reorderViewGroups(
    userId: string,
    items: Array<{ id: string; orderIndex: number }>
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.VIEW_GROUPS.REORDER, {
      userId,
      items,
    });
  }

  /**
   * Add views to group
   */
  async addViewsToGroup(
    viewGroupId: string,
    userId: string,
    viewIds: string[]
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.VIEW_GROUPS.ADD_VIEWS(viewGroupId), {
      userId,
      viewIds,
    });
  }

  /**
   * Remove view from group
   */
  async removeViewFromGroup(
    viewGroupId: string,
    viewId: string,
    userId: string
  ): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.VIEW_GROUPS.REMOVE_VIEW(viewGroupId, viewId, userId)
    );
  }

  /**
   * Reorder views in group
   */
  async reorderViewsInGroup(
    viewGroupId: string,
    userId: string,
    items: Array<{ id: string; orderIndex: number }>
  ): Promise<void> {
    await apiClient.post(
      API_ENDPOINTS.VIEW_GROUPS.REORDER_VIEWS(viewGroupId),
      {
        userId,
        items,
      }
    );
  }

  /**
   * Transform backend DTO to frontend type
   */
  private transformToFrontend(dto: ViewGroupDto): ViewGroup {
    return {
      id: dto.viewGroupId,
      name: dto.name,
      viewIds: dto.viewIds || [],
      isVisible: dto.isVisible,
      order: dto.orderIndex,
      isDefault: dto.isDefault,
      createdBy: dto.createdBy || dto.userId,
    };
  }
}

export const viewGroupsService = new ViewGroupsService();
export default viewGroupsService;
