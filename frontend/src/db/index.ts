/**
 * SQLite singleton for Tarefitas.
 * Initializes DB and runs migrations on first use.
 * Requires Tauri; in browser (e.g. Vite dev) rejects with TAURI_REQUIRED.
 */

import Database from '@tauri-apps/plugin-sql';
import { runMigrations } from './migrations';
import { isTauri } from '../shared/lib/tauri-env';

export const TAURI_REQUIRED = 'TAURI_REQUIRED';

const DB_PATH = 'sqlite:tarefitas.db';

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

/**
 * Returns the app SQLite database. Initializes once and runs migrations.
 * In non-Tauri environment, rejects with TAURI_REQUIRED so callers can show empty state or a message.
 */
export async function getDb(): Promise<Database> {
  if (!isTauri()) {
    return Promise.reject(new Error(TAURI_REQUIRED));
  }
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await Database.load(DB_PATH);
    await runMigrations(db);
    dbInstance = db;
    return db;
  })();

  return initPromise;
}

/**
 * For tests or teardown: close the connection and reset singleton.
 */
export async function closeDb(): Promise<boolean> {
  if (!dbInstance) return true;
  const ok = await dbInstance.close();
  dbInstance = null;
  initPromise = null;
  return ok;
}
