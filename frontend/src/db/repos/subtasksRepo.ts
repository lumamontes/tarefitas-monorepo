/**
 * Subtasks repository — SQLite access for subtasks.
 */

import type Database from '@tauri-apps/plugin-sql';
import type { SubtaskRow } from '../../domain/types';
import { getDb } from '../index';

export async function listByTask(taskId: string, db?: Database): Promise<SubtaskRow[]> {
  const d = db ?? (await getDb());
  const rows = await d.select<SubtaskRow[]>(
    `SELECT id, task_id, title, done, sort_order, updated_at, deleted_at
     FROM subtasks WHERE task_id = $1 AND deleted_at IS NULL ORDER BY sort_order ASC`,
    [taskId]
  );
  return Array.isArray(rows) ? rows : [];
}

export async function upsert(row: SubtaskRow, db?: Database): Promise<void> {
  const d = db ?? (await getDb());
  await d.execute(
    `INSERT INTO subtasks (id, task_id, title, done, sort_order, updated_at, deleted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       task_id = excluded.task_id,
       title = excluded.title,
       done = excluded.done,
       sort_order = excluded.sort_order,
       updated_at = excluded.updated_at,
       deleted_at = excluded.deleted_at`,
    [
      row.id,
      row.task_id,
      row.title,
      row.done,
      row.sort_order,
      row.updated_at,
      row.deleted_at ?? null,
    ]
  );
}

export async function markDeleted(id: string, db?: Database): Promise<void> {
  const d = db ?? (await getDb());
  const now = Date.now();
  await d.execute(
    'UPDATE subtasks SET deleted_at = $1, updated_at = $1 WHERE id = $2',
    [now, id]
  );
}

/** List all subtasks including soft-deleted (for backup / export). */
export async function listAll(db?: Database): Promise<SubtaskRow[]> {
  const d = db ?? (await getDb());
  const rows = await d.select<SubtaskRow[]>(
    `SELECT id, task_id, title, done, sort_order, updated_at, deleted_at
     FROM subtasks ORDER BY task_id, sort_order`
  );
  return Array.isArray(rows) ? rows : [];
}
