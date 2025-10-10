/**
 * Widget Repository
 * Data access layer for widgets
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../config/api.config';
import { Widget, WidgetFormData } from '../../../types';
import { PaginatedResponse } from './reportRepository';

export interface WidgetListParams {
  page?: number;
  limit?: number;
  search?: string;
  userRole?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class WidgetRepository {
  /**
   * Get all widgets
   */
  async getAll(params?: WidgetListParams): Promise<PaginatedResponse<Widget>> {
    const response = await apiClient.get<PaginatedResponse<Widget>>(
      API_ENDPOINTS.WIDGETS.LIST,
      { params: params as any }
    );
    return response.data;
  }

  /**
   * Get widget by ID
   */
  async getById(id: string): Promise<Widget> {
    const response = await apiClient.get<Widget>(
      API_ENDPOINTS.WIDGETS.GET(id)
    );
    return response.data;
  }

  /**
   * Create widget
   */
  async create(data: WidgetFormData): Promise<Widget> {
    const response = await apiClient.post<Widget>(
      API_ENDPOINTS.WIDGETS.CREATE,
      data
    );
    
    apiClient.clearCache();
    return response.data;
  }

  /**
   * Update widget
   */
  async update(id: string, data: Partial<WidgetFormData>): Promise<Widget> {
    const response = await apiClient.put<Widget>(
      API_ENDPOINTS.WIDGETS.UPDATE(id),
      data
    );
    
    apiClient.clearCache();
    return response.data;
  }

  /**
   * Delete widget
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.WIDGETS.DELETE(id));
    apiClient.clearCache();
  }

  /**
   * Bulk delete widgets
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post(API_ENDPOINTS.WIDGETS.LIST + '/bulk-delete', { ids });
    apiClient.clearCache();
  }
}

export const widgetRepository = new WidgetRepository();
export default widgetRepository;
