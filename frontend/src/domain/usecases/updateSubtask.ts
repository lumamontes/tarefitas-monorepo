/**
 * Update subtask (title, done, sort_order) use-case.
 */

import * as subtasksRepo from '../../db/repos/subtasksRepo';
import { getDb } from '../../db';

export interface UpdateSubtaskInput {
  title?: string;
  done?: boolean;
  sort_order?: number;
}

export async function updateSubtask(
  id: string,
  input: UpdateSubtaskInput
): Promise<void> {
  const db = await getDb();
  const rows = await db.select<{ id: string; title: string; done: number; sort_order: number }[]>(
    'SELECT id, title, done, sort_order FROM subtasks WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) return;
  const now = Date.now();
  const title = input.title ?? row.title;
  const done = input.done !== undefined ? (input.done ? 1 : 0) : row.done;
  const sort_order = input.sort_order ?? row.sort_order;
  await db.execute(
    'UPDATE subtasks SET title = $1, done = $2, sort_order = $3, updated_at = $4 WHERE id = $5',
    [title, done, sort_order, now, id]
  );
}
