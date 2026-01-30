/**
 * UI invalidation signal for SQLite-backed data.
 * Call bumpDbVersion() after any use-case that mutates the DB
 * so hooks (useTasks, useSubtasks, usePrefs) refetch.
 */

import { create } from 'zustand';

interface DbSignalStore {
  dbVersion: number;
  bumpDbVersion: () => void;
}

export const useDbSignalStore = create<DbSignalStore>((set) => ({
  dbVersion: 0,
  bumpDbVersion: () => set((s) => ({ dbVersion: s.dbVersion + 1 })),
}));

export function bumpDbVersion(): void {
  useDbSignalStore.getState().bumpDbVersion();
}
