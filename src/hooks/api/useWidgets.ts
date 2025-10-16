/**
 * useWidgets Hook
 * Data fetching hooks for widgets
 */

import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { widgetsService } from '../../services/widgetsService';
import { Widget, WidgetFormData } from '../../types';

export interface WidgetListParams {
  roleId?: string;
}

/**
 * Fetch all widgets
 */
export function useWidgets(params?: WidgetListParams) {
  return useQuery(
    ['widgets', params],
    () => params?.roleId 
      ? widgetsService.getWidgetsByRole(params.roleId) 
      : widgetsService.getAllWidgets(),
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
    () => widgetsService.getWidget(id),
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
  return useMutation<Widget, { widgetName: string; widgetDescription?: string; widgetType?: string }>(
    (data) => widgetsService.createWidget(data),
    {
      invalidateQueries: 'widgets',
    }
  );
}

/**
 * Update widget mutation
 */
export function useUpdateWidget() {
  return useMutation<Widget, { id: string; data: { widgetName: string; widgetDescription?: string; widgetType?: string } }>(
    ({ id, data }) => widgetsService.updateWidget(id, data),
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
    (id) => widgetsService.deleteWidget(id),
    {
      invalidateQueries: 'widgets',
    }
  );
}
