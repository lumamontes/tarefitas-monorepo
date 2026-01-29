/**
 * useSync hook
 * Handles offline-first sync with conflict resolution
 */

import { useEffect, useCallback, useState } from 'react';
import { useTaskStore } from '../../../entities/task';
import { useAuthStore } from '../../../entities/user';
import { syncTasks, getRemoteTasks } from '../../../shared/lib/api.utils';
import { mergeTasks, SyncStatus, SyncConflict } from '../../../shared/lib/sync.utils';
import { toast } from '../../../shared/ui/toast.component';

export function useSync() {
  const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
  const { isAuthenticated, user } = useAuthStore();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncAt: null,
    isSyncing: false,
    pendingChanges: 0,
    error: null,
  });

  const performSync = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Get remote tasks
      const remoteTasks = await getRemoteTasks();

      // Merge with local tasks
      const { merged, conflicts } = mergeTasks(tasks, remoteTasks, 'last-write-wins');

      // Handle conflicts
      if (conflicts.length > 0) {
        toast.warning(`${conflicts.length} conflict(s) resolved automatically`);
        // In a real app, you'd show a conflict resolution UI
      }

      // Update local store with merged tasks
      // This is simplified - in production you'd want more granular updates
      const localTaskIds = new Set(tasks.map((t) => t.id));
      
      for (const mergedTask of merged) {
        if (localTaskIds.has(mergedTask.id)) {
          const localTask = tasks.find((t) => t.id === mergedTask.id);
          if (localTask && mergedTask.updatedAt > localTask.updatedAt) {
            await updateTask(mergedTask.id, {
              title: mergedTask.title,
              description: mergedTask.description,
              date: mergedTask.date,
              state: mergedTask.state as any,
              energyTag: mergedTask.energyTag,
            });
          }
        } else {
          // New remote task - add it
          await addTask({
            title: mergedTask.title,
            description: mergedTask.description,
            date: mergedTask.date,
            energyTag: mergedTask.energyTag,
          });
        }
      }

      // Sync local changes to server
      await syncTasks(tasks);

      setSyncStatus({
        lastSyncAt: new Date().toISOString(),
        isSyncing: false,
        pendingChanges: 0,
        error: null,
      });

      toast.success('Sync completed');
    } catch (error: any) {
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: error.message || 'Sync failed',
      }));

      if (error.code !== 'NETWORK_ERROR') {
        toast.error('Sync failed. Changes saved locally.');
      }
    }
  }, [tasks, isAuthenticated, user, addTask, updateTask]);

  // Auto-sync when online and authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        performSync();
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    // Sync on mount if online
    if (navigator.onLine) {
      performSync();
    }

    // Sync when coming back online
    const handleOnline = () => {
      performSync();
    };
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
    };
  }, [isAuthenticated, user, performSync]);

  return {
    syncStatus,
    performSync,
  };
}
