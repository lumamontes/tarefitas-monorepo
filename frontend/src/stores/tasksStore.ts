/**
 * Tasks and Subtasks Store (Zustand)
 * Manages tasks, subtasks, and selected task state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Subtask } from '../types';

/** Pure helper for filtered list — use in components to avoid selector returning new array every time */
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

interface TasksStore {
  tasks: Task[];
  subtasks: Subtask[];
  selectedTaskId: string | null;
  taskFilter: 'all' | 'today' | 'in-progress' | 'completed' | 'archived';
  
  // Computed getters
  getSelectedTask: () => Task | null;
  getSelectedTaskSubtasks: () => Subtask[];
  getTaskProgress: (taskId: string) => { completed: number; total: number; percentage: number };
  getFilteredTasks: () => Task[];
  
  // Actions
  setTaskFilter: (filter: 'all' | 'today' | 'in-progress' | 'completed' | 'archived') => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => string;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  selectTask: (id: string | null) => void;
  reorderTasks: (reorderedTasks: Task[]) => void;
  addSubtask: (taskId: string, title: string) => string;
  updateSubtask: (id: string, updates: Partial<Omit<Subtask, 'id' | 'taskId'>>) => void;
  deleteSubtask: (id: string) => void;
  toggleSubtaskDone: (id: string) => void;
  reorderSubtasks: (taskId: string, reorderedSubtasks: Subtask[]) => void;
  
  // Calendar helpers
  getTasksForDate: (dateStr: string) => Task[];
  getTaskCountForDate: (dateStr: string) => number;
  hasTasksForDate: (dateStr: string) => boolean;
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      subtasks: [],
      selectedTaskId: null,
      taskFilter: 'all',

      getSelectedTask: () => {
        const { tasks, selectedTaskId } = get();
        if (!selectedTaskId) return null;
        return tasks.find(task => task.id === selectedTaskId) || null;
      },

      getSelectedTaskSubtasks: () => {
        const { subtasks, selectedTaskId } = get();
        if (!selectedTaskId) return [];
        return subtasks
          .filter(subtask => subtask.taskId === selectedTaskId)
          .sort((a, b) => a.order - b.order);
      },

      getTaskProgress: (taskId: string) => {
        const { subtasks } = get();
        const taskSubtasks = subtasks.filter(s => s.taskId === taskId);
        if (taskSubtasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
        
        const completed = taskSubtasks.filter(s => s.done).length;
        const total = taskSubtasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        return { completed, total, percentage };
      },

      getFilteredTasks: () => {
        const { tasks, taskFilter, subtasks } = get();
        return computeFilteredTasks(tasks, taskFilter, subtasks);
      },

      setTaskFilter: (filter) => {
        set({ taskFilter: filter });
      },

      addTask: (task) => {
        const { tasks } = get();
        const newTask: Task = {
          ...task,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          order: tasks.length
        };
        
        set({ tasks: [...tasks, newTask] });
        return newTask.id;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map(task => 
            task.id === id 
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          )
        }));
      },

      deleteTask: (id) => {
        const { subtasks, selectedTaskId } = get();
        
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id),
          subtasks: state.subtasks.filter(subtask => subtask.taskId !== id),
          selectedTaskId: selectedTaskId === id ? null : selectedTaskId
        }));
      },

      selectTask: (id) => {
        set({ selectedTaskId: id });
        // Update ND context tracking would go here
      },

      reorderTasks: (reorderedTasks) => {
        const tasksWithNewOrder = reorderedTasks.map((task, index) => ({
          ...task,
          order: index,
          updatedAt: new Date()
        }));
        
        set({ tasks: tasksWithNewOrder });
      },

      addSubtask: (taskId, title) => {
        const { subtasks } = get();
        const existingSubtasks = subtasks.filter(s => s.taskId === taskId);
        
        const newSubtask: Subtask = {
          id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          taskId,
          title,
          done: false,
          order: existingSubtasks.length
        };
        
        set({ subtasks: [...subtasks, newSubtask] });
        return newSubtask.id;
      },

      updateSubtask: (id, updates) => {
        set((state) => ({
          subtasks: state.subtasks.map(subtask =>
            subtask.id === id 
              ? { ...subtask, ...updates }
              : subtask
          )
        }));
      },

      deleteSubtask: (id) => {
        set((state) => ({
          subtasks: state.subtasks.filter(subtask => subtask.id !== id)
        }));
      },

      toggleSubtaskDone: (id) => {
        set((state) => ({
          subtasks: state.subtasks.map(subtask =>
            subtask.id === id 
              ? { ...subtask, done: !subtask.done }
              : subtask
          )
        }));
      },

      reorderSubtasks: (taskId, reorderedSubtasks) => {
        const { subtasks } = get();
        const otherSubtasks = subtasks.filter(s => s.taskId !== taskId);
        
        const reorderedWithNewOrder = reorderedSubtasks.map((subtask, index) => ({
          ...subtask,
          order: index
        }));
        
        set({ subtasks: [...otherSubtasks, ...reorderedWithNewOrder] });
      },

      getTasksForDate: (dateStr: string) => {
        const { tasks } = get();
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        
        return tasks.filter(task => {
          if (task.archived) return false;
          
          if (task.scheduledDate === dateStr) {
            return true;
          }
          
          if (task.recurring) {
            if (task.recurring.type === 'daily') {
              return true;
            } else if (task.recurring.type === 'weekly' && task.recurring.daysOfWeek) {
              return task.recurring.daysOfWeek.includes(dayOfWeek);
            }
          }
          
          return false;
        });
      },

      getTaskCountForDate: (dateStr: string) => {
        return get().getTasksForDate(dateStr).length;
      },

      hasTasksForDate: (dateStr: string) => {
        return get().getTaskCountForDate(dateStr) > 0;
      },
    }),
    {
      name: 'tarefitas-tasks',
      version: 1,
    }
  )
);

// --- Action/helper exports (for components that call selectTask, addTask, etc.) ---

const getTasksState = () => useTasksStore.getState();

export function selectTask(id: string | null): void {
  getTasksState().selectTask(id);
}

export function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>): string {
  return getTasksState().addTask(task);
}

export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
  getTasksState().updateTask(id, updates);
}

export function deleteTask(id: string): void {
  getTasksState().deleteTask(id);
}

export function setTaskFilter(filter: TasksStore['taskFilter']): void {
  getTasksState().setTaskFilter(filter);
}

export function getTaskProgress(taskId: string): { completed: number; total: number; percentage: number } {
  return getTasksState().getTaskProgress(taskId);
}

export function addSubtask(taskId: string, title: string): string {
  return getTasksState().addSubtask(taskId, title);
}

export function toggleSubtaskDone(id: string): void {
  getTasksState().toggleSubtaskDone(id);
}

export function updateSubtask(id: string, updates: Partial<Omit<Subtask, 'id' | 'taskId'>>): void {
  getTasksState().updateSubtask(id, updates);
}

export function deleteSubtask(id: string): void {
  getTasksState().deleteSubtask(id);
}

export function getTaskCountForDate(dateStr: string): number {
  return getTasksState().getTaskCountForDate(dateStr);
}

export function getScheduledTasksForDate(dateStr: string): Task[] {
  const state = getTasksState();
  return state.tasks.filter((t) => !t.archived && t.scheduledDate === dateStr && !t.recurring);
}

export function getRecurringTasksForDate(dateStr: string): Task[] {
  const state = getTasksState();
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return state.tasks.filter((t) => {
    if (t.archived || !t.recurring) return false;
    if (t.recurring.type === 'daily') return true;
    if (t.recurring.type === 'weekly' && t.recurring.daysOfWeek) {
      return t.recurring.daysOfWeek.includes(dayOfWeek);
    }
    return false;
  });
}
