/**
 * Tasks data context — composition over prop drilling.
 * Generic interface: state, actions, meta. Provider is the only place that
 * knows about useQuery/useMutation; UI consumes the context.
 * @see .agents/skills/vercel-composition-patterns
 */

import React, { createContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as tasksRepo from '../db/repos/tasksRepo';
import * as subtasksRepo from '../db/repos/subtasksRepo';
import * as prefsRepo from '../db/repos/prefsRepo';
import { taskRowToTask, subtaskRowToSubtask } from '../db/adapters';
import { queryClient, queryKeys } from '../query/client';
import { useTasksStore } from '../stores/tasksStore';
import type { Task, Subtask } from '../types';
import {
  selectTask,
  setTaskFilter,
  computeFilteredTasks,
  getTaskProgress,
} from '../stores/tasksStore';
import * as createTaskUc from '../domain/usecases/createTask';
import * as updateTaskUc from '../domain/usecases/updateTask';
import * as deleteTaskUc from '../domain/usecases/deleteTask';
import * as addSubtaskUc from '../domain/usecases/addSubtask';
import * as toggleSubtaskUc from '../domain/usecases/toggleSubtask';
import * as updateSubtaskUc from '../domain/usecases/updateSubtask';
import * as deleteSubtaskUc from '../domain/usecases/deleteSubtask';
import * as reorderSubtasksUc from '../domain/usecases/reorderSubtasks';
import { TAURI_REQUIRED } from '../db';
import { isTauri } from '../shared/lib/tauri-env';

// --- Query fetchers (no useEffect; used by useQuery) ---
// When not running in Tauri, DB is unavailable; return empty data so UI still renders.

function isTauriRequiredError(e: unknown): boolean {
  return e instanceof Error && e.message === TAURI_REQUIRED;
}

async function fetchTasks(): Promise<Task[]> {
  try {
    const rows = await tasksRepo.list();
    return rows.map(taskRowToTask);
  } catch (e) {
    if (isTauriRequiredError(e)) return [];
    throw e;
  }
}

async function fetchSubtasks(taskId: string | null): Promise<Subtask[]> {
  if (!taskId) return [];
  try {
    const rows = await subtasksRepo.listByTask(taskId);
    return rows.map(subtaskRowToSubtask);
  } catch (e) {
    if (isTauriRequiredError(e)) return [];
    throw e;
  }
}

async function fetchAllSubtasks(): Promise<Subtask[]> {
  try {
    const rows = await subtasksRepo.listAll();
    return rows.filter((r) => r.deleted_at == null).map(subtaskRowToSubtask);
  } catch (e) {
    if (isTauriRequiredError(e)) return [];
    throw e;
  }
}

async function fetchPrefs(): Promise<Record<string, unknown>> {
  try {
    const rows = await prefsRepo.listAll();
    const map: Record<string, unknown> = {};
    for (const r of rows) {
      try {
        map[r.key] = JSON.parse(r.value) as unknown;
      } catch {
        map[r.key] = r.value;
      }
    }
    return map;
  } catch (e) {
    if (isTauriRequiredError(e)) return {};
    throw e;
  }
}

// --- Context interface (state / actions / meta) ---

export interface TasksDataState {
  tasks: Task[];
  subtasksAll: Subtask[];
  prefs: Record<string, unknown>;
  selectedTaskId: string | null;
  taskFilter: ReturnType<typeof useTasksStore.getState>['taskFilter'];
  filteredTasks: Task[];
}

export interface TasksDataActions {
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<string>;
  toggleSubtaskDone: (id: string) => Promise<void>;
  updateSubtask: (id: string, updates: Partial<Omit<Subtask, 'id' | 'taskId'>>) => Promise<void>;
  deleteSubtask: (id: string) => Promise<void>;
  reorderSubtasks: (taskId: string, list: Subtask[]) => Promise<void>;
  selectTask: (id: string | null) => void;
  setTaskFilter: (filter: TasksDataState['taskFilter']) => void;
}

export interface TasksDataMeta {
  tasksLoading: boolean;
  tasksError: Error | null;
  subtasksLoading: boolean;
  subtasksError: Error | null;
  prefsLoading: boolean;
  prefsError: Error | null;
  /** False when running in browser (e.g. Vite dev); tasks/subtasks/prefs are read-only empty, mutations will fail. */
  isTauriAvailable: boolean;
  getTaskProgress: (taskId: string) => { completed: number; total: number; percentage: number };
}

export interface TasksDataContextValue {
  state: TasksDataState;
  actions: TasksDataActions;
  meta: TasksDataMeta;
}

const TasksDataContext = createContext<TasksDataContextValue | null>(null);

function invalidateTasks() {
  queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
}
function invalidateSubtasks() {
  queryClient.invalidateQueries({ queryKey: queryKeys.subtasksAll });
  queryClient.invalidateQueries({ queryKey: ['subtasks'] });
}
function invalidatePrefs() {
  queryClient.invalidateQueries({ queryKey: queryKeys.prefs() });
}

export function TasksDataProvider({ children }: { children: React.ReactNode }) {
  const store = useTasksStore.getState();
  const selectedTaskId = useTasksStore((s) => s.selectedTaskId);
  const taskFilter = useTasksStore((s) => s.taskFilter);

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: fetchTasks,
  });
  const subtasksQuery = useQuery({
    queryKey: queryKeys.subtasksAll,
    queryFn: fetchAllSubtasks,
  });
  const prefsQuery = useQuery({
    queryKey: queryKeys.prefs(),
    queryFn: fetchPrefs,
  });

  const tasks = tasksQuery.data ?? [];
  const subtasksAll = subtasksQuery.data ?? [];
  const prefs = prefsQuery.data ?? {};

  const filteredTasks = useMemo(
    () => computeFilteredTasks(tasks, taskFilter, subtasksAll),
    [tasks, taskFilter, subtasksAll]
  );

  const wrapDbAction = useMemo(
    () =>
      <T,>(fn: () => Promise<T>): Promise<T> =>
        fn().catch((e) => {
          if (isTauriRequiredError(e)) {
            throw new Error(
              'Database is only available in the Tauri app. Run: pnpm tauri dev'
            );
          }
          throw e;
        }),
    []
  );

  const actions = useMemo<TasksDataActions>(() => ({
    async addTask(input) {
      return wrapDbAction(async () => {
        const row = await createTaskUc.createTask({
          title: input.title,
          description: input.description,
          due_date: input.scheduledDate ?? null,
          status: input.archived ? 'archived' : 'active',
        });
        invalidateTasks();
        return row.id;
      });
    },
    async updateTask(id, updates) {
      return wrapDbAction(async () => {
        let status: 'active' | 'completed' | 'archived' | undefined;
        if (updates.archived !== undefined) {
          status = updates.archived ? 'archived' : 'active';
        } else if (updates.completed !== undefined) {
          status = updates.completed ? 'completed' : 'active';
        }
        await updateTaskUc.updateTask(id, {
          title: updates.title,
          description: updates.description ?? null,
          due_date: updates.scheduledDate ?? null,
          recurring: updates.recurring,
          energy_tag: updates.energyTag ?? null,
          status,
        });
        invalidateTasks();
      });
    },
    async deleteTask(id) {
      return wrapDbAction(async () => {
        await deleteTaskUc.deleteTask(id);
        invalidateTasks();
        invalidateSubtasks();
        if (useTasksStore.getState().selectedTaskId === id) selectTask(null);
      });
    },
    async addSubtask(taskId, title) {
      return wrapDbAction(async () => {
        const row = await addSubtaskUc.addSubtask({ taskId, title });
        invalidateSubtasks();
        return row.id;
      });
    },
    async toggleSubtaskDone(id) {
      return wrapDbAction(async () => {
        await toggleSubtaskUc.toggleSubtask(id);
        invalidateSubtasks();
      });
    },
    async updateSubtask(id, updates) {
      return wrapDbAction(async () => {
        await updateSubtaskUc.updateSubtask(id, {
          title: updates.title,
          done: updates.done,
          sort_order: updates.order,
        });
        invalidateSubtasks();
      });
    },
    async deleteSubtask(id) {
      return wrapDbAction(async () => {
        await deleteSubtaskUc.deleteSubtask(id);
        invalidateSubtasks();
      });
    },
    async reorderSubtasks(taskId, list) {
      return wrapDbAction(async () => {
        await reorderSubtasksUc.reorderSubtasks(taskId, list.map((s) => s.id));
        invalidateSubtasks();
      });
    },
    selectTask,
    setTaskFilter,
  }), [wrapDbAction]);

  const meta = useMemo<TasksDataMeta>(
    () => ({
      tasksLoading: tasksQuery.isLoading,
      tasksError: tasksQuery.error instanceof Error ? tasksQuery.error : null,
      subtasksLoading: subtasksQuery.isLoading,
      subtasksError: subtasksQuery.error instanceof Error ? subtasksQuery.error : null,
      prefsLoading: prefsQuery.isLoading,
      prefsError: prefsQuery.error instanceof Error ? prefsQuery.error : null,
      isTauriAvailable: isTauri(),
      getTaskProgress: (taskId: string) => getTaskProgress(subtasksAll, taskId),
    }),
    [
      tasksQuery.isLoading,
      tasksQuery.error,
      subtasksQuery.isLoading,
      subtasksQuery.error,
      prefsQuery.isLoading,
      prefsQuery.error,
      subtasksAll,
    ]
  );

  const state = useMemo<TasksDataState>(
    () => ({
      tasks,
      subtasksAll,
      prefs,
      selectedTaskId,
      taskFilter,
      filteredTasks,
    }),
    [tasks, subtasksAll, prefs, selectedTaskId, taskFilter, filteredTasks]
  );

  const value = useMemo<TasksDataContextValue>(
    () => ({ state, actions, meta }),
    [state, actions, meta]
  );

  return (
    <TasksDataContext.Provider value={value}>
      {children}
    </TasksDataContext.Provider>
  );
}

export function useTasksData(): TasksDataContextValue {
  const ctx = React.useContext(TasksDataContext);
  if (!ctx) throw new Error('useTasksData must be used within TasksDataProvider');
  return ctx;
}
