/**
 * Preferences repository — SQLite key/value (JSON values).
 */

import type Database from '@tauri-apps/plugin-sql';
import type { PrefRow } from '../../domain/types';
import { getDb } from '../index';

export async function get(key: string, db?: Database): Promise<string | null> {
  const d = db ?? (await getDb());
  const rows = await d.select<{ value: string }[]>(
    'SELECT value FROM prefs WHERE key = $1',
    [key]
  );
  const row = Array.isArray(rows) ? rows[0] : rows;
  return row?.value ?? null;
}

export async function set(key: string, value: string, db?: Database): Promise<void> {
  const d = db ?? (await getDb());
  const now = Date.now();
  await d.execute(
    `INSERT INTO prefs (key, value, updated_at) VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value, now]
  );
}

export async function listAll(db?: Database): Promise<PrefRow[]> {
  const d = db ?? (await getDb());
  const rows = await d.select<PrefRow[]>(
    'SELECT key, value, updated_at FROM prefs ORDER BY key'
  );
  return Array.isArray(rows) ? rows : [];
}
