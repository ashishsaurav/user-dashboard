/**
 * Reports Service
 * Handles all report-related API calls
 */

import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { Report } from '../types';

interface ReportDto {
  reportId: string;
  reportName: string;
  reportDescription?: string;
  reportUrl?: string;
  isActive: boolean;
  orderIndex?: number;
}

export class ReportsService {
  /**
   * Get all reports
   */
  async getAllReports(): Promise<Report[]> {
    const reports = await apiClient.get<ReportDto[]>(API_ENDPOINTS.REPORTS.LIST);
    return reports.map(this.transformToFrontend);
  }

  /**
   * Get reports by role
   */
  async getReportsByRole(roleId: string): Promise<Report[]> {
    const reports = await apiClient.get<ReportDto[]>(
      API_ENDPOINTS.REPORTS.BY_ROLE(roleId)
    );
    return reports.map(this.transformToFrontend.bind(this));
  }

  /**
   * Get report by ID
   */
  async getReport(id: string): Promise<Report> {
    const report = await apiClient.get<ReportDto>(API_ENDPOINTS.REPORTS.GET(id));
    return this.transformToFrontend(report);
  }

  /**
   * Create report
   */
  async createReport(data: {
    reportName: string;
    reportDescription?: string;
    reportUrl?: string;
  }): Promise<Report> {
    const report = await apiClient.post<ReportDto>(
      API_ENDPOINTS.REPORTS.CREATE,
      data
    );
    return this.transformToFrontend(report);
  }

  /**
   * Update report
   */
  async updateReport(
    id: string,
    data: {
      reportName: string;
      reportDescription?: string;
      reportUrl?: string;
    }
  ): Promise<Report> {
    const report = await apiClient.put<ReportDto>(
      API_ENDPOINTS.REPORTS.UPDATE(id),
      data
    );
    return this.transformToFrontend(report);
  }

  /**
   * Delete report
   */
  async deleteReport(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.REPORTS.DELETE(id));
  }

  /**
   * Transform backend DTO to frontend type
   */
  private transformToFrontend(dto: ReportDto): Report {
    return {
      id: dto.reportId,
      name: dto.reportName,
      url: dto.reportUrl || '',
      type: 'Report',
      userRoles: [], // This is role-based, so we don't need this array anymore
    };
  }
}

export const reportsService = new ReportsService();
export default reportsService;
