/**
 * Subtasks from SQLite via TanStack Query (no useEffect).
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query/client';
import * as subtasksRepo from '../db/repos/subtasksRepo';
import type { SubtaskRow } from '../domain/types';
import { subtaskRowToSubtask } from '../db/adapters';
import type { Subtask } from '../types';

async function fetchSubtasks(taskId: string | null): Promise<Subtask[]> {
  if (!taskId) return [];
  const rows = await subtasksRepo.listByTask(taskId);
  return rows.map(subtaskRowToSubtask);
}

async function fetchAllSubtasks(): Promise<Subtask[]> {
  const rows = await subtasksRepo.listAll();
  return rows
    .filter((r: SubtaskRow) => r.deleted_at == null)
    .map(subtaskRowToSubtask);
}

export function useSubtasks(taskId: string | null): {
  subtasks: Subtask[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: taskId ? queryKeys.subtasks(taskId) : ['subtasks', 'none'],
    queryFn: () => fetchSubtasks(taskId),
    enabled: !!taskId,
  });
  return {
    subtasks: data ?? [],
    isLoading,
    error: error instanceof Error ? error : null,
  };
}

export function useAllSubtasks(): {
  subtasks: Subtask[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.subtasksAll,
    queryFn: fetchAllSubtasks,
  });
  return {
    subtasks: data ?? [],
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
