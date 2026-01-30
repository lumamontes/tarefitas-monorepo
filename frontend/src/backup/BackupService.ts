/**
 * Export/Import backup (JSON). Replace or Merge by id + updated_at.
 */

import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { getDb } from '../db';
import * as tasksRepo from '../db/repos/tasksRepo';
import * as subtasksRepo from '../db/repos/subtasksRepo';
import * as prefsRepo from '../db/repos/prefsRepo';
import type { BackupFile, TaskRow, SubtaskRow, PrefRow } from '../domain/types';
import { queryClient, queryKeys } from '../query/client';

const BACKUP_FORMAT = 'tarefitas-backup';
const BACKUP_VERSION = 1;

function isBackupFile(obj: unknown): obj is BackupFile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (obj as BackupFile).format === BACKUP_FORMAT &&
    (obj as BackupFile).version === BACKUP_VERSION &&
    typeof (obj as BackupFile).data === 'object'
  );
}

/**
 * Export all DB data to a JSON file (save dialog).
 */
export async function exportBackup(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const db = await getDb();
    const [tasks, subtasks, prefs] = await Promise.all([
      tasksRepo.listAll(db),
      subtasksRepo.listAll(db),
      prefsRepo.listAll(db),
    ]);

    const file: BackupFile = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: Date.now(),
      data: { tasks, subtasks, prefs },
    };

    const path = await save({
      defaultPath: `tarefitas-backup-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (!path) return { ok: false, error: 'Nenhum arquivo selecionado.' };

    await writeTextFile(path, JSON.stringify(file, null, 2));
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

/**
 * Import from JSON file. Mode: 'replace' | 'merge'.
 * Replace: clear local data and insert file data.
 * Merge: upsert by id, keep row with greater updated_at; respect deleted_at (tombstone).
 */
export async function importBackup(
  mode: 'replace' | 'merge'
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const path = await open({
      multiple: false,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (!path || typeof path !== 'string') {
      return { ok: false, error: 'Nenhum arquivo selecionado.' };
    }

    const raw = await readTextFile(path);
    const parsed = JSON.parse(raw) as unknown;
    if (!isBackupFile(parsed)) {
      return { ok: false, error: 'Arquivo de backup inválido (formato ou versão).' };
    }

    const db = await getDb();
    await db.execute('BEGIN');
    try {
      if (mode === 'replace') {
        await db.execute('DELETE FROM subtasks');
        await db.execute('DELETE FROM tasks');
        await db.execute('DELETE FROM prefs');
        for (const row of parsed.data.tasks) {
          const t = row as Partial<TaskRow>;
          await tasksRepo.upsert(
            {
              ...row,
              recurring: t.recurring ?? null,
              energy_tag: t.energy_tag ?? null,
            } as TaskRow,
            db
          );
        }
        for (const row of parsed.data.subtasks) {
          await subtasksRepo.upsert(row as SubtaskRow, db);
        }
        for (const row of parsed.data.prefs) {
          await prefsRepo.set(row.key, row.value, db);
        }
      } else {
        // Merge: for each entity, upsert if not exists or if file has greater updated_at
        const existingTasks = await tasksRepo.listAll(db);
        const existingSubtasks = await subtasksRepo.listAll(db);
        const existingPrefs = await prefsRepo.listAll(db);

        const taskMap = new Map(existingTasks.map((t) => [t.id, t]));
        const subtaskMap = new Map(existingSubtasks.map((s) => [s.id, s]));
        const prefMap = new Map(existingPrefs.map((p) => [p.key, p]));

        for (const row of parsed.data.tasks as Partial<TaskRow>[]) {
          const local = taskMap.get(row.id!);
          if (!local || (row.updated_at ?? 0) >= local.updated_at) {
            await tasksRepo.upsert(
              {
                ...row,
                recurring: row.recurring ?? null,
                energy_tag: row.energy_tag ?? null,
              } as TaskRow,
              db
            );
          }
        }

        for (const row of parsed.data.subtasks as SubtaskRow[]) {
          const local = subtaskMap.get(row.id);
          if (!local || row.updated_at >= local.updated_at) {
            await subtasksRepo.upsert(row, db);
          }
        }

        for (const row of parsed.data.prefs as PrefRow[]) {
          const local = prefMap.get(row.key);
          if (!local || row.updated_at >= local.updated_at) {
            await prefsRepo.set(row.key, row.value, db);
          }
        }
      }
      await db.execute('COMMIT');
    } catch (e) {
      await db.execute('ROLLBACK');
      throw e;
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    queryClient.invalidateQueries({ queryKey: queryKeys.subtasksAll });
    queryClient.invalidateQueries({ queryKey: queryKeys.prefs() });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

/**
 * Clear all tasks, subtasks and prefs; set default settings in prefs.
 */
export async function resetAllData(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const db = await getDb();
    await db.execute('BEGIN');
    try {
      await db.execute('DELETE FROM subtasks');
      await db.execute('DELETE FROM tasks');
      await db.execute('DELETE FROM prefs');
      // Default settings key (minimal; app can extend)
      const defaultSettings = JSON.stringify({
        themeId: 'calm-beige',
        fontId: 'system',
        fontScale: 'md',
        density: 'cozy',
        reduceMotion: false,
        soundEnabled: false,
      });
      await db.execute(
        'INSERT INTO prefs (key, value, updated_at) VALUES ($1, $2, $3)',
        ['settings', defaultSettings, Date.now()]
      );
      await db.execute('COMMIT');
    } catch (e) {
      await db.execute('ROLLBACK');
      throw e;
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
    queryClient.invalidateQueries({ queryKey: queryKeys.subtasksAll });
    queryClient.invalidateQueries({ queryKey: queryKeys.prefs() });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}
