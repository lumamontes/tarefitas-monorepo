/**
 * Update task use-case.
 */

import type { TaskRow } from '../types';
import * as tasksRepo from '../../db/repos/tasksRepo';

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskRow['status'];
  due_date?: string | null;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<void> {
  const existing = await tasksRepo.get(id);
  if (!existing) return;
  const now = Date.now();
  const title = input.title !== undefined ? (input.title ?? '').trim() : existing.title;
  if (!title) throw new Error('Task title is required');
  const row: TaskRow = {
    ...existing,
    ...input,
    title,
    status: input.status ?? existing.status,
    updated_at: now,
  };
  await tasksRepo.upsert(row);
}
