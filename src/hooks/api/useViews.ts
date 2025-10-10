/**
 * useViews Hook
 * Data fetching hooks for views
 */

import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { viewRepository } from '../../services/api/repositories';
import { View, ViewFormData } from '../../types';

/**
 * Fetch views for a user
 */
export function useUserViews(userId: string, enabled: boolean = true) {
  return useQuery(
    ['views', 'user', userId],
    () => viewRepository.getByUser(userId),
    {
      enabled: enabled && !!userId,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  );
}

/**
 * Fetch single view by ID
 */
export function useView(id: string, enabled: boolean = true) {
  return useQuery(
    ['views', id],
    () => viewRepository.getById(id),
    {
      enabled: enabled && !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Create view mutation
 */
export function useCreateView() {
  return useMutation<View, ViewFormData & { createdBy: string }>(
    (data) => viewRepository.create(data),
    {
      invalidateQueries: 'views',
    }
  );
}

/**
 * Update view mutation
 */
export function useUpdateView() {
  return useMutation<View, { id: string; data: Partial<ViewFormData> }>(
    ({ id, data }) => viewRepository.update(id, data),
    {
      invalidateQueries: 'views',
    }
  );
}

/**
 * Delete view mutation
 */
export function useDeleteView() {
  return useMutation<void, string>(
    (id) => viewRepository.delete(id),
    {
      invalidateQueries: 'views',
    }
  );
}

/**
 * Reorder views mutation
 */
export function useReorderViews() {
  return useMutation<void, string[]>(
    (viewIds) => viewRepository.reorder(viewIds),
    {
      invalidateQueries: 'views',
    }
  );
}
