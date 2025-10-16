/**
 * useReports Hook
 * Data fetching hooks for reports
 */

import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { reportsService } from '../../services/reportsService';
import { Report, ReportFormData } from '../../types';

export interface ReportListParams {
  roleId?: string;
}

/**
 * Fetch all reports
 */
export function useReports(params?: ReportListParams) {
  return useQuery(
    ['reports', params],
    () => params?.roleId 
      ? reportsService.getReportsByRole(params.roleId) 
      : reportsService.getAllReports(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

/**
 * Fetch single report by ID
 */
export function useReport(id: string, enabled: boolean = true) {
  return useQuery(
    ['reports', id],
    () => reportsService.getReport(id),
    {
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Create report mutation
 */
export function useCreateReport() {
  return useMutation<Report, { reportName: string; reportDescription?: string; reportUrl?: string }>(
    (data) => reportsService.createReport(data),
    {
      invalidateQueries: 'reports',
      onSuccess: (data) => {
        console.log('Report created:', data);
      },
      onError: (error) => {
        console.error('Failed to create report:', error);
      },
    }
  );
}

/**
 * Update report mutation
 */
export function useUpdateReport() {
  return useMutation<Report, { id: string; data: { reportName: string; reportDescription?: string; reportUrl?: string } }>(
    ({ id, data }) => reportsService.updateReport(id, data),
    {
      invalidateQueries: 'reports',
      onSuccess: (data) => {
        console.log('Report updated:', data);
      },
      onError: (error) => {
        console.error('Failed to update report:', error);
      },
    }
  );
}

/**
 * Delete report mutation
 */
export function useDeleteReport() {
  return useMutation<void, string>(
    (id) => reportsService.deleteReport(id),
    {
      invalidateQueries: 'reports',
      onSuccess: () => {
        console.log('Report deleted');
      },
      onError: (error) => {
        console.error('Failed to delete report:', error);
      },
    }
  );
}
