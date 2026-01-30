/**
 * Domain types for SQLite-backed tasks, subtasks and preferences.
 * Used by repos, use-cases and BackupService.
 */

export type TaskStatus = 'active' | 'completed' | 'archived';

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null; // YYYY-MM-DD
  updated_at: number; // Unix ms
  deleted_at: number | null; // Unix ms, tombstone
}

export interface SubtaskRow {
  id: string;
  task_id: string;
  title: string;
  done: number; // 0 | 1
  sort_order: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface PrefRow {
  key: string;
  value: string; // JSON string
  updated_at: number;
}

export interface MetaRow {
  key: string;
  value: string;
}

/** Backup file format (versioned) */
export interface BackupFile {
  format: 'tarefitas-backup';
  version: 1;
  exportedAt: number;
  data: {
    tasks: TaskRow[];
    subtasks: SubtaskRow[];
    prefs: PrefRow[];
  };
}
