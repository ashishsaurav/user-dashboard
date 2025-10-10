/**
 * useReports Hook
 * Data fetching hooks for reports
 */

import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { reportRepository, ReportListParams } from '../../services/api/repositories';
import { Report, ReportFormData } from '../../types';

/**
 * Fetch all reports
 */
export function useReports(params?: ReportListParams) {
  return useQuery(
    ['reports', params],
    () => reportRepository.getAll(params),
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
    () => reportRepository.getById(id),
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
  return useMutation<Report, ReportFormData>(
    (data) => reportRepository.create(data),
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
  return useMutation<Report, { id: string; data: Partial<ReportFormData> }>(
    ({ id, data }) => reportRepository.update(id, data),
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
    (id) => reportRepository.delete(id),
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

/**
 * Bulk delete reports mutation
 */
export function useBulkDeleteReports() {
  return useMutation<void, string[]>(
    (ids) => reportRepository.bulkDelete(ids),
    {
      invalidateQueries: 'reports',
      onSuccess: () => {
        console.log('Reports deleted');
      },
      onError: (error) => {
        console.error('Failed to delete reports:', error);
      },
    }
  );
}
