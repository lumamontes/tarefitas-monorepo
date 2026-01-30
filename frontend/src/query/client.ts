/**
 * TanStack Query client for SQLite-backed data.
 * Provider sets the client so use-cases can invalidate after mutations.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min
      gcTime: 1000 * 60 * 5, // 5 min (formerly cacheTime)
    },
  },
});

export const queryKeys = {
  tasks: ['tasks'] as const,
  subtasks: (taskId: string | null) => (taskId ? ['subtasks', taskId] : ['subtasks']) as const,
  subtasksAll: ['subtasks', 'all'] as const,
  prefs: (keys?: string[]) => (keys?.length ? ['prefs', keys.join(',')] : ['prefs']) as const,
};
