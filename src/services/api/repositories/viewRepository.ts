/**
 * View Repository
 * Data access layer for views
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../config/api.config';
import { View, ViewFormData } from '../../../types';

class ViewRepository {
  /**
   * Get all views for a user
   */
  async getByUser(userId: string): Promise<View[]> {
    const response = await apiClient.get<View[]>(
      API_ENDPOINTS.VIEWS.BY_USER(userId)
    );
    return response.data;
  }

  /**
   * Get view by ID
   */
  async getById(id: string): Promise<View> {
    const response = await apiClient.get<View>(
      API_ENDPOINTS.VIEWS.GET(id)
    );
    return response.data;
  }

  /**
   * Create view
   */
  async create(data: ViewFormData & { createdBy: string }): Promise<View> {
    const response = await apiClient.post<View>(
      API_ENDPOINTS.VIEWS.CREATE,
      data
    );
    
    apiClient.clearCache();
    return response.data;
  }

  /**
   * Update view
   */
  async update(id: string, data: Partial<ViewFormData>): Promise<View> {
    const response = await apiClient.put<View>(
      API_ENDPOINTS.VIEWS.UPDATE(id),
      data
    );
    
    apiClient.clearCache();
    return response.data;
  }

  /**
   * Delete view
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.VIEWS.DELETE(id));
    apiClient.clearCache();
  }

  /**
   * Reorder views
   */
  async reorder(viewIds: string[]): Promise<void> {
    await apiClient.post(API_ENDPOINTS.VIEWS.LIST + '/reorder', { viewIds });
    apiClient.clearCache();
  }
}

export const viewRepository = new ViewRepository();
export default viewRepository;
