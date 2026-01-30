/**
 * Create task use-case.
 */

import { generateId } from '../../shared/lib/rust-commands';
import type { TaskRow } from '../types';
import * as tasksRepo from '../../db/repos/tasksRepo';
export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string | null;
  status?: TaskRow['status'];
}

export async function createTask(input: CreateTaskInput): Promise<TaskRow> {
  const id = await generateId();
  const now = Date.now();
  const title = (input.title ?? '').trim();
  if (!title) throw new Error('Task title is required');
  const row: TaskRow = {
    id,
    title,
    description: input.description ?? null,
    status: input.status ?? 'active',
    due_date: input.due_date ?? null,
    updated_at: now,
    deleted_at: null,
  };
  await tasksRepo.upsert(row);
  return row;
}
