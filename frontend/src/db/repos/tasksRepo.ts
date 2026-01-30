/**
 * Tasks repository — SQLite access for tasks.
 */

import type Database from '@tauri-apps/plugin-sql';
import type { TaskRow } from '../../domain/types';
import { getDb } from '../index';

export async function list(db?: Database): Promise<TaskRow[]> {
  const d = db ?? (await getDb());
  const rows = await d.select<TaskRow[]>(
    `SELECT id, title, description, status, due_date, updated_at, deleted_at
     FROM tasks WHERE deleted_at IS NULL ORDER BY updated_at DESC`
  );
  return Array.isArray(rows) ? rows : [];
}

/** All tasks including soft-deleted (for export/backup). */
export async function listAll(db?: Database): Promise<TaskRow[]> {
  const d = db ?? (await getDb());
  const rows = await d.select<TaskRow[]>(
    `SELECT id, title, description, status, due_date, updated_at, deleted_at
     FROM tasks ORDER BY updated_at DESC`
  );
  return Array.isArray(rows) ? rows : [];
}

export async function get(id: string, db?: Database): Promise<TaskRow | null> {
  const d = db ?? (await getDb());
  const rows = await d.select<TaskRow[]>(
    'SELECT id, title, description, status, due_date, updated_at, deleted_at FROM tasks WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  const row = Array.isArray(rows) ? rows[0] : rows;
  return row ?? null;
}

export async function upsert(row: TaskRow, db?: Database): Promise<void> {
  const d = db ?? (await getDb());
  await d.execute(
    `INSERT INTO tasks (id, title, description, status, due_date, updated_at, deleted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       status = excluded.status,
       due_date = excluded.due_date,
       updated_at = excluded.updated_at,
       deleted_at = excluded.deleted_at`,
    [
      row.id,
      row.title ?? '',
      row.description ?? null,
      row.status ?? 'active',
      row.due_date ?? null,
      row.updated_at,
      row.deleted_at ?? null,
    ]
  );
}

export async function markDeleted(id: string, db?: Database): Promise<void> {
  const d = db ?? (await getDb());
  const now = Date.now();
  await d.execute(
    'UPDATE tasks SET deleted_at = $1, updated_at = $1 WHERE id = $2',
    [now, id]
  );
}
