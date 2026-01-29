/**
 * Sync utilities
 * Offline-first sync with conflict resolution
 */

import { Task } from '../../entities/task';

export interface SyncStatus {
  lastSyncAt: string | null;
  isSyncing: boolean;
  pendingChanges: number;
  error: string | null;
}

export interface SyncConflict {
  taskId: string;
  localTask: Task;
  remoteTask: Task;
  conflictType: 'both-modified' | 'local-deleted-remote-modified' | 'local-modified-remote-deleted';
}

/**
 * Merge tasks with conflict resolution
 * Last-write-wins strategy with user preference option
 */
export function mergeTasks(
  localTasks: Task[],
  remoteTasks: Task[],
  strategy: 'local-wins' | 'remote-wins' | 'last-write-wins' = 'last-write-wins'
): { merged: Task[]; conflicts: SyncConflict[] } {
  const merged: Task[] = [];
  const conflicts: SyncConflict[] = [];
  const taskMap = new Map<string, Task>();

  // Add all local tasks
  localTasks.forEach((task) => {
    taskMap.set(task.id, task);
  });

  // Merge remote tasks
  remoteTasks.forEach((remoteTask) => {
    const localTask = taskMap.get(remoteTask.id);

    if (!localTask) {
      // New remote task
      merged.push(remoteTask);
      return;
    }

    // Compare timestamps
    const localUpdated = new Date(localTask.updatedAt).getTime();
    const remoteUpdated = new Date(remoteTask.updatedAt).getTime();

    if (localUpdated === remoteUpdated) {
      // No conflict, use local (already in map)
      return;
    }

    // Conflict detected
    if (strategy === 'last-write-wins') {
      if (remoteUpdated > localUpdated) {
        taskMap.set(remoteTask.id, remoteTask);
      }
      // else keep local
    } else if (strategy === 'remote-wins') {
      taskMap.set(remoteTask.id, remoteTask);
    }
    // else keep local (local-wins)

    conflicts.push({
      taskId: remoteTask.id,
      localTask,
      remoteTask,
      conflictType: 'both-modified',
    });
  });

  // Add all merged tasks
  taskMap.forEach((task) => {
    merged.push(task);
  });

  return { merged, conflicts };
}

/**
 * Check if sync is needed
 */
export function needsSync(lastSyncAt: string | null, localChanges: number): boolean {
  if (!lastSyncAt) return true;
  if (localChanges > 0) return true;
  
  // Sync every 5 minutes if online
  const syncInterval = 5 * 60 * 1000;
  const timeSinceSync = Date.now() - new Date(lastSyncAt).getTime();
  return timeSinceSync > syncInterval;
}
