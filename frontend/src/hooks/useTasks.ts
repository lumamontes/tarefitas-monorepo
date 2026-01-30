/**
 * Tasks from SQLite via TanStack Query (no useEffect).
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query/client';
import * as tasksRepo from '../db/repos/tasksRepo';
import { taskRowToTask } from '../db/adapters';
import type { Task } from '../types';

async function fetchTasks(): Promise<Task[]> {
  const rows = await tasksRepo.list();
  return rows.map(taskRowToTask);
}

export function useTasks(): {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: fetchTasks,
  });
  return {
    tasks: data ?? [],
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
