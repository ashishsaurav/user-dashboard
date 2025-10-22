/**
 * Widgets Service
 * Handles all widget-related API calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { Widget } from '../types';

interface WidgetDto {
  widgetId: string;
  widgetName: string;
  widgetUrl?: string;
  widgetType?: string;
  isActive: boolean;
  orderIndex?: number;
}

export class WidgetsService {
  /**
   * Get all widgets
   */
  async getAllWidgets(): Promise<Widget[]> {
    const widgets = await apiClient.get<WidgetDto[]>(API_ENDPOINTS.WIDGETS.LIST);
    return widgets.map(this.transformToFrontend);
  }

  /**
   * Get widgets by role
   */
  async getWidgetsByRole(roleId: string): Promise<Widget[]> {
    const widgets = await apiClient.get<WidgetDto[]>(
      API_ENDPOINTS.WIDGETS.BY_ROLE(roleId)
    );
    return widgets.map(this.transformToFrontend.bind(this));
  }

  /**
   * Get widget by ID
   */
  async getWidget(id: string): Promise<Widget> {
    const widget = await apiClient.get<WidgetDto>(API_ENDPOINTS.WIDGETS.GET(id));
    return this.transformToFrontend(widget);
  }

  /**
   * Create widget
   */
  async createWidget(data: {
    widgetName: string;
    widgetUrl?: string;
    widgetType?: string;
  }): Promise<Widget> {
    const widget = await apiClient.post<WidgetDto>(
      API_ENDPOINTS.WIDGETS.CREATE,
      data
    );
    return this.transformToFrontend(widget);
  }

  /**
   * Update widget
   */
  async updateWidget(
    id: string,
    data: {
      widgetName: string;
      widgetUrl?: string;
      widgetType?: string;
    }
  ): Promise<Widget> {
    const widget = await apiClient.put<WidgetDto>(
      API_ENDPOINTS.WIDGETS.UPDATE(id),
      data
    );
    return this.transformToFrontend(widget);
  }

  /**
   * Delete widget
   */
  async deleteWidget(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.WIDGETS.DELETE(id));
  }

  /**
   * Assign widget to role (single)
   */
  async assignWidgetToRole(
    roleId: string,
    widgetId: string
  ): Promise<void> {
    await this.assignWidgetsToRole(roleId, [widgetId]);
  }

  /**
   * Assign multiple widgets to role (batch)
   */
  async assignWidgetsToRole(
    roleId: string,
    widgetIds: string[]
  ): Promise<void> {
    if (widgetIds.length === 0) return;
    await apiClient.post(API_ENDPOINTS.WIDGETS.ASSIGN_TO_ROLE(roleId), {
      widgetIds,
    });
  }

  /**
   * Unassign widget from role
   */
  async unassignWidgetFromRole(
    roleId: string,
    widgetId: string
  ): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.WIDGETS.UNASSIGN_FROM_ROLE(roleId, widgetId)
    );
  }

  /**
   * Transform backend DTO to frontend type
   */
  private transformToFrontend(dto: WidgetDto): Widget {
    return {
      id: dto.widgetId,
      name: dto.widgetName,
      url: dto.widgetUrl || '',
      type: 'Widget',
      userRoles: [], // Role-based, not needed
    };
  }
}

export const widgetsService = new WidgetsService();
export default widgetsService;
