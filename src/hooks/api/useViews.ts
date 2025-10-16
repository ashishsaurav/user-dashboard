/**
 * useViews Hook
 * Data fetching hooks for views
 */

import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { viewsService } from '../../services/viewsService';
import { View, ViewFormData } from '../../types';

/**
 * Fetch views for a user
 */
export function useUserViews(userId: string, enabled: boolean = true) {
  return useQuery(
    ['views', 'user', userId],
    () => viewsService.getUserViews(userId),
    {
      enabled: enabled && !!userId,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  );
}

/**
 * Fetch single view by ID
 */
export function useView(id: string, userId: string, enabled: boolean = true) {
  return useQuery(
    ['views', id],
    () => viewsService.getView(id, userId),
    {
      enabled: enabled && !!id && !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Create view mutation
 */
export function useCreateView() {
  return useMutation<View, { userId: string; data: ViewFormData }>(
    ({ userId, data }) => viewsService.createView(userId, data),
    {
      invalidateQueries: 'views',
    }
  );
}

/**
 * Update view mutation
 */
export function useUpdateView() {
  return useMutation<View, { id: string; userId: string; data: any }>(
    ({ id, userId, data }) => viewsService.updateView(id, userId, data),
    {
      invalidateQueries: 'views',
    }
  );
}

/**
 * Delete view mutation
 */
export function useDeleteView() {
  return useMutation<void, { id: string; userId: string }>(
    ({ id, userId }) => viewsService.deleteView(id, userId),
    {
      invalidateQueries: 'views',
    }
  );
}
