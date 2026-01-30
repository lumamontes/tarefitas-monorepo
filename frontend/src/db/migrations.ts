/**
 * Idempotent SQLite migrations.
 * Run on startup via getDb().
 */

import type Database from '@tauri-apps/plugin-sql';

const SCHEMA_VERSION = 2;

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
  let current = versionRows?.[0]?.value ? Number(versionRows[0].value) : 0;

  // --- v1: tasks, subtasks, prefs ---
  if (current < 1) {
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
    await db.execute(`
      CREATE TABLE IF NOT EXISTS prefs (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    await db.execute(
      'INSERT OR REPLACE INTO meta (key, value) VALUES ($1, $2)',
      ['schema_version', '1']
    );
    current = 1;
  }

  // --- v2: tasks.recurring + tasks.energy_tag ---
  if (current < 2) {
    await db.execute('ALTER TABLE tasks ADD COLUMN recurring TEXT');
    await db.execute('ALTER TABLE tasks ADD COLUMN energy_tag TEXT');
    await db.execute(
      'INSERT OR REPLACE INTO meta (key, value) VALUES ($1, $2)',
      ['schema_version', '2']
    );
  }
}
