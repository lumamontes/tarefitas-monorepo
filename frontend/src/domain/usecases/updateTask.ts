/**
 * Update task use-case.
 */

import type { TaskRow } from '../types';
import * as tasksRepo from '../../db/repos/tasksRepo';

function serializeRecurring(
  r: { type: 'daily' | 'weekly'; daysOfWeek?: number[] } | string | null | undefined
): TaskRow['recurring'] {
  if (r == null) return null;
  if (typeof r === 'string') return r || null;
  return JSON.stringify(r);
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskRow['status'];
  due_date?: string | null;
  recurring?: { type: 'daily' | 'weekly'; daysOfWeek?: number[] } | string | null;
  energy_tag?: string | null;
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<void> {
  const existing = await tasksRepo.get(id);
  if (!existing) return;
  const now = Date.now();
  const title = input.title !== undefined ? (input.title ?? '').trim() : existing.title;
  if (!title) throw new Error('Task title is required');
  const recurring =
    input.recurring !== undefined
      ? serializeRecurring(input.recurring)
      : (existing.recurring ?? null);
  const energy_tag =
    input.energy_tag !== undefined ? (input.energy_tag ?? null) : (existing.energy_tag ?? null);
  const row: TaskRow = {
    ...existing,
    ...input,
    title,
    status: input.status ?? existing.status,
    recurring,
    energy_tag,
    updated_at: now,
  };
  await tasksRepo.upsert(row);
}
