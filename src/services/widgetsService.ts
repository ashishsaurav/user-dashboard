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
  widgetDescription?: string;
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
    widgetDescription?: string;
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
      widgetDescription?: string;
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
   * Transform backend DTO to frontend type
   */
  private transformToFrontend(dto: WidgetDto): Widget {
    return {
      id: dto.widgetId,
      name: dto.widgetName,
      url: '', // Widgets don't have URLs in the backend
      type: 'Widget',
      userRoles: [], // Role-based, not needed
    };
  }
}

export const widgetsService = new WidgetsService();
export default widgetsService;
