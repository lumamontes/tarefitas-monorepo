/**
 * Idempotent SQLite migrations.
 * Run on startup via getDb().
 */

import type Database from '@tauri-apps/plugin-sql';

const SCHEMA_VERSION = 1;

export async function runMigrations(db: Database): Promise<void> {
  // meta table for schema_version
  await db.execute(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const versionRows = await db.select<{ value: string }[]>(
    'SELECT value FROM meta WHERE key = $1',
    ['schema_version']
  );
  const current = versionRows?.[0]?.value ? Number(versionRows[0].value) : 0;

  if (current >= SCHEMA_VERSION) return;

  // --- tasks ---
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NULL,
      status TEXT NOT NULL,
      due_date TEXT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER NULL
    )
  `);

  // --- subtasks ---
  await db.execute(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      done INTEGER NOT NULL,
      sort_order INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER NULL
    )
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks (task_id)
  `);

  // --- prefs ---
  await db.execute(`
    CREATE TABLE IF NOT EXISTS prefs (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await db.execute(
    'INSERT OR REPLACE INTO meta (key, value) VALUES ($1, $2)',
    ['schema_version', String(SCHEMA_VERSION)]
  );
}
