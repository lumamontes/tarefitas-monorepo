/**
 * Task store using Zustand
 * Offline-first persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, CreateTaskInput, UpdateTaskInput, CreateSubtaskInput, UpdateSubtaskInput, Subtask } from '../model';
import { generateId } from '../../../shared/lib/rust-commands';

interface TaskStore {
  tasks: Task[];
  addTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addSubtask: (taskId: string, input: CreateSubtaskInput) => Promise<void>;
  updateSubtask: (taskId: string, subtaskId: string, input: UpdateSubtaskInput) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  reorderTasks: (taskIds: string[]) => Promise<void>;
  reorderSubtasks: (taskId: string, subtaskIds: string[]) => Promise<void>;
}

const now = () => new Date().toISOString();

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: async (input) => {
        const id = await generateId();
        const task: Task = {
          id,
          title: input.title,
          description: input.description,
          date: input.date,
          state: 'active',
          subtasks: [],
          energyTag: input.energyTag,
          order: get().tasks.length,
          createdAt: now(),
          updatedAt: now(),
        };

        set((state) => ({
          tasks: [...state.tasks, task],
        }));

        return task;
      },

      updateTask: async (id, input) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...input,
                  updatedAt: now(),
                }
              : task
          ),
        }));
      },

      deleteTask: async (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      addSubtask: async (taskId, input) => {
        const subtaskId = await generateId();
        const subtask: Subtask = {
          id: subtaskId,
          title: input.title,
          description: input.description,
          completed: false,
          order: 0,
        };

        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              subtask.order = task.subtasks.length;
              return {
                ...task,
                subtasks: [...task.subtasks, subtask],
                updatedAt: now(),
              };
            }
            return task;
          }),
        }));
      },

      updateSubtask: async (taskId, subtaskId, input) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === subtaskId
                    ? { ...subtask, ...input }
                    : subtask
                ),
                updatedAt: now(),
              };
            }
            return task;
          }),
        }));
      },

      deleteSubtask: async (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
                updatedAt: now(),
              };
            }
            return task;
          }),
        }));
      },

      reorderTasks: async (taskIds) => {
        set((state) => {
          const taskMap = new Map(state.tasks.map((task) => [task.id, task]));
          const reorderedTasks = taskIds
            .map((id, index) => {
              const task = taskMap.get(id);
              return task ? { ...task, order: index } : null;
            })
            .filter((task): task is Task => task !== null);

          // Add any tasks not in the reorder list
          const remainingTasks = state.tasks
            .filter((task) => !taskIds.includes(task.id))
            .map((task, index) => ({
              ...task,
              order: reorderedTasks.length + index,
            }));

          return {
            tasks: [...reorderedTasks, ...remainingTasks],
          };
        });
      },

      reorderSubtasks: async (taskId, subtaskIds) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              const subtaskMap = new Map(task.subtasks.map((subtask) => [subtask.id, subtask]));
              const reorderedSubtasks = subtaskIds
                .map((id, index) => {
                  const subtask = subtaskMap.get(id);
                  return subtask ? { ...subtask, order: index } : null;
                })
                .filter((subtask): subtask is Subtask => subtask !== null);

              return {
                ...task,
                subtasks: reorderedSubtasks,
                updatedAt: now(),
              };
            }
            return task;
          }),
        }));
      },
    }),
    {
      name: 'tarefitas-tasks',
      version: 1,
    }
  )
);
