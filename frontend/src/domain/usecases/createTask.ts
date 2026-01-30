/**
 * Create task use-case.
 */

import { generateId } from '../../shared/lib/rust-commands';
import type { TaskRow } from '../types';
import * as tasksRepo from '../../db/repos/tasksRepo';

function serializeRecurring(
  r: { type: 'daily' | 'weekly'; daysOfWeek?: number[] } | string | null | undefined
): TaskRow['recurring'] {
  if (r == null) return null;
  if (typeof r === 'string') return r || null;
  return JSON.stringify(r);
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string | null;
  status?: TaskRow['status'];
  recurring?: { type: 'daily' | 'weekly'; daysOfWeek?: number[] } | null;
  energy_tag?: string | null;
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
    recurring: serializeRecurring(input.recurring),
    energy_tag: input.energy_tag ?? null,
    updated_at: now,
    deleted_at: null,
  };
  await tasksRepo.upsert(row);
  return row;
}
