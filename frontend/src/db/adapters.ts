/**
 * Map DB rows to UI types (types/index.ts).
 */

import type { Task as UITask, Subtask as UISubtask } from '../types';
import type { TaskRow, SubtaskRow } from '../domain/types';

export function taskRowToTask(row: TaskRow): UITask {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    createdAt: new Date(row.updated_at),
    updatedAt: new Date(row.updated_at),
    order: 0,
    archived: row.status === 'archived',
    scheduledDate: row.due_date ?? undefined,
  };
}

export function subtaskRowToSubtask(row: SubtaskRow): UISubtask {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    done: row.done === 1,
    order: row.sort_order,
  };
}
