/**
 * Tasks store — UI state only (selectedTaskId, taskFilter).
 * Domain data from SQLite via TanStack Query (useTasks, useSubtasks, useAllSubtasks).
 * Actions call use-cases then invalidate queries so data refetches.
 */

import { create } from 'zustand';
import type { Task, Subtask } from '../types';
import { queryClient, queryKeys } from '../query/client';
import { TAURI_REQUIRED } from '../db';
import * as createTaskUc from '../domain/usecases/createTask';
import * as updateTaskUc from '../domain/usecases/updateTask';
import * as deleteTaskUc from '../domain/usecases/deleteTask';
import * as addSubtaskUc from '../domain/usecases/addSubtask';
import * as updateSubtaskUc from '../domain/usecases/updateSubtask';
import * as deleteSubtaskUc from '../domain/usecases/deleteSubtask';
import * as toggleSubtaskUc from '../domain/usecases/toggleSubtask';
import * as reorderSubtasksUc from '../domain/usecases/reorderSubtasks';
import * as toggleTaskCompleteUc from '../domain/usecases/toggleTaskComplete';

/** Pure helper for filtered list — use with data from useTasks() + useAllSubtasks(). */
export function computeFilteredTasks(
  tasks: Task[],
  taskFilter: 'all' | 'today' | 'in-progress' | 'completed' | 'archived',
  subtasks: Subtask[]
): Task[] {
  let filtered = [...tasks];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (taskFilter) {
    case 'today':
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.createdAt);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
      break;
    case 'in-progress':
      filtered = filtered.filter((task) => {
        const taskSubtasks = subtasks.filter((s) => s.taskId === task.id);
        if (taskSubtasks.length === 0) return false;
        return taskSubtasks.some((s) => !s.done);
      });
      break;
    case 'completed':
      filtered = filtered.filter((task) => {
        if (task.completed) return true;
        const taskSubtasks = subtasks.filter((s) => s.taskId === task.id);
        if (taskSubtasks.length === 0) return false;
        return taskSubtasks.every((s) => s.done);
      });
      break;
    case 'archived':
      filtered = filtered.filter((task) => task.archived);
      break;
    case 'all':
    default:
      filtered = filtered.filter((task) => !task.archived);
      break;
  }
  return filtered;
}

/** Pure: progress for a task from its subtasks. */
export function getTaskProgress(
  subtasks: Subtask[],
  taskId: string
): { completed: number; total: number; percentage: number } {
  const taskSubtasks = subtasks.filter((s) => s.taskId === taskId);
  if (taskSubtasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
  const completed = taskSubtasks.filter((s) => s.done).length;
  const total = taskSubtasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}

/** Pure: tasks for a date (scheduled + recurring). */
export function getTasksForDate(tasks: Task[], dateStr: string): Task[] {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return tasks.filter((task) => {
    if (task.archived) return false;
    if (task.scheduledDate === dateStr) return true;
    if (task.recurring) {
      if (task.recurring.type === 'daily') return true;
      if (task.recurring.type === 'weekly' && task.recurring.daysOfWeek) {
        return task.recurring.daysOfWeek.includes(dayOfWeek);
      }
    }
    return false;
  });
}

export function getScheduledTasksForDate(tasks: Task[], dateStr: string): Task[] {
  return tasks.filter(
    (t) => !t.archived && t.scheduledDate === dateStr && !t.recurring
  );
}

export function getRecurringTasksForDate(tasks: Task[], dateStr: string): Task[] {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return tasks.filter((t) => {
    if (t.archived || !t.recurring) return false;
    if (t.recurring.type === 'daily') return true;
    if (t.recurring.type === 'weekly' && t.recurring.daysOfWeek) {
      return t.recurring.daysOfWeek.includes(dayOfWeek);
    }
    return false;
  });
}

// --- Store: UI state only ---

interface TasksStore {
  selectedTaskId: string | null;
  taskFilter: 'all' | 'today' | 'in-progress' | 'completed' | 'archived';
  setTaskFilter: (filter: TasksStore['taskFilter']) => void;
  selectTask: (id: string | null) => void;
}

export const useTasksStore = create<TasksStore>((set) => ({
  selectedTaskId: null,
  taskFilter: 'all',
  setTaskFilter: (filter) => set({ taskFilter: filter }),
  selectTask: (id) => set({ selectedTaskId: id }),
}));

// --- Action exports (call use-cases; components use hooks for data) ---
// Call useTasksStore.getState() directly so store updates are reliable and debuggable.

export function selectTask(id: string | null): void {
  useTasksStore.getState().selectTask(id);
}

export function setTaskFilter(filter: TasksStore['taskFilter']): void {
  useTasksStore.getState().setTaskFilter(filter);
}

function invalidateTasks() {
  queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
}
function invalidateSubtasks() {
  queryClient.invalidateQueries({ queryKey: queryKeys.subtasksAll });
  queryClient.invalidateQueries({ queryKey: ['subtasks'] });
}

function wrapDbAction<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch((e) => {
    if (e instanceof Error && e.message === TAURI_REQUIRED) {
      alert('TAURI_REQUIRED');
      throw new Error(
        'Database is only available in the Tauri app. Run: pnpm tauri dev'
      );
    }
    alert('throw e: ' + e);
    throw e;
  });
}

export async function addTask(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>
): Promise<string> {
  return wrapDbAction(async () => {
    const row = await createTaskUc.createTask({
      title: task.title,
      description: task.description,
      due_date: task.scheduledDate ?? null,
      status: task.archived ? 'archived' : 'active',
    });
    invalidateTasks();
    return row.id;
  });
}

export async function toggleTaskComplete(id: string): Promise<void> {
  return wrapDbAction(async () => {
    await toggleTaskCompleteUc.toggleTaskComplete(id);
    invalidateTasks();
  });
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Promise<void> {
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
}

export async function deleteTask(id: string): Promise<void> {
  return wrapDbAction(async () => {
    const { selectedTaskId, selectTask: setSelected } = useTasksStore.getState();
    await deleteTaskUc.deleteTask(id);
    invalidateTasks();
    invalidateSubtasks();
    if (selectedTaskId === id) setSelected(null);
  });
}

export async function addSubtask(taskId: string, title: string): Promise<string> {
  return wrapDbAction(async () => {
    const row = await addSubtaskUc.addSubtask({ taskId, title });
    invalidateSubtasks();
    return row.id;
  });
}

export async function toggleSubtaskDone(id: string): Promise<void> {
  return wrapDbAction(async () => {
    await toggleSubtaskUc.toggleSubtask(id);
    invalidateSubtasks();
  });
}

export async function updateSubtask(
  id: string,
  updates: Partial<Omit<Subtask, 'id' | 'taskId'>>
): Promise<void> {
  return wrapDbAction(async () => {
    await updateSubtaskUc.updateSubtask(id, {
      title: updates.title,
      done: updates.done,
      sort_order: updates.order,
    });
    invalidateSubtasks();
  });
}

export async function deleteSubtask(id: string): Promise<void> {
  return wrapDbAction(async () => {
    await deleteSubtaskUc.deleteSubtask(id);
    invalidateSubtasks();
  });
}

export async function reorderSubtasks(
  taskId: string,
  reorderedSubtasks: Subtask[]
): Promise<void> {
  return wrapDbAction(async () => {
    await reorderSubtasksUc.reorderSubtasks(
      taskId,
      reorderedSubtasks.map((s) => s.id)
    );
    invalidateSubtasks();
  });
}

/** No-op: task order not stored in DB for MVP. */
export function reorderTasks(_reorderedTasks: Task[]): void {}

export function getTaskCountForDate(
  tasks: Task[],
  dateStr: string
): number {
  return getTasksForDate(tasks, dateStr).length;
}
