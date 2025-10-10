/**
 * Report Repository
 * Data access layer for reports
 */

import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../config/api.config';
import { Report, ReportFormData } from '../../../types';

export interface ReportListParams {
  page?: number;
  limit?: number;
  search?: string;
  userRole?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class ReportRepository {
  /**
   * Get all reports
   */
  async getAll(params?: ReportListParams): Promise<PaginatedResponse<Report>> {
    const response = await apiClient.get<PaginatedResponse<Report>>(
      API_ENDPOINTS.REPORTS.LIST,
      { params: params as any }
    );
    return response.data;
  }

  /**
   * Get report by ID
   */
  async getById(id: string): Promise<Report> {
    const response = await apiClient.get<Report>(
      API_ENDPOINTS.REPORTS.GET(id)
    );
    return response.data;
  }

  /**
   * Create report
   */
  async create(data: ReportFormData): Promise<Report> {
    const response = await apiClient.post<Report>(
      API_ENDPOINTS.REPORTS.CREATE,
      data
    );
    
    // Clear cache after mutation
    apiClient.clearCache();
    
    return response.data;
  }

  /**
   * Update report
   */
  async update(id: string, data: Partial<ReportFormData>): Promise<Report> {
    const response = await apiClient.put<Report>(
      API_ENDPOINTS.REPORTS.UPDATE(id),
      data
    );
    
    // Clear cache after mutation
    apiClient.clearCache();
    
    return response.data;
  }

  /**
   * Delete report
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.REPORTS.DELETE(id));
    
    // Clear cache after mutation
    apiClient.clearCache();
  }

  /**
   * Bulk delete reports
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post(API_ENDPOINTS.REPORTS.LIST + '/bulk-delete', { ids });
    
    // Clear cache after mutation
    apiClient.clearCache();
  }
}

export const reportRepository = new ReportRepository();
export default reportRepository;
