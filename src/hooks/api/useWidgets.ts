/**
 * useWidgets Hook
 * Data fetching hooks for widgets
 */

import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { widgetRepository, WidgetListParams } from '../../services/api/repositories';
import { Widget, WidgetFormData } from '../../types';

/**
 * Fetch all widgets
 */
export function useWidgets(params?: WidgetListParams) {
  return useQuery(
    ['widgets', params],
    () => widgetRepository.getAll(params),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

/**
 * Fetch single widget by ID
 */
export function useWidget(id: string, enabled: boolean = true) {
  return useQuery(
    ['widgets', id],
    () => widgetRepository.getById(id),
    {
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Create widget mutation
 */
export function useCreateWidget() {
  return useMutation<Widget, WidgetFormData>(
    (data) => widgetRepository.create(data),
    {
      invalidateQueries: 'widgets',
    }
  );
}

/**
 * Update widget mutation
 */
export function useUpdateWidget() {
  return useMutation<Widget, { id: string; data: Partial<WidgetFormData> }>(
    ({ id, data }) => widgetRepository.update(id, data),
    {
      invalidateQueries: 'widgets',
    }
  );
}

/**
 * Delete widget mutation
 */
export function useDeleteWidget() {
  return useMutation<void, string>(
    (id) => widgetRepository.delete(id),
    {
      invalidateQueries: 'widgets',
    }
  );
}
