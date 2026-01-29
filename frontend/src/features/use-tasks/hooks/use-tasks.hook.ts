/**
 * useTasks hook
 * Provides task management functionality
 */

import { useMemo } from 'react';
import { useTaskStore, Task, TaskState } from '../../../entities/task';
import { getTimeDistance, isPastDate } from '../../../shared/lib/time.utils';

export function useTasks() {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    reorderTasks,
    reorderSubtasks,
  } = useTaskStore();

  const activeTasks = useMemo(() => {
    return tasks.filter((task) => task.state === 'active').sort((a, b) => a.order - b.order);
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter((task) => task.state === 'completed').sort((a, b) => a.order - b.order);
  }, [tasks]);

  const archivedTasks = useMemo(() => {
    return tasks.filter((task) => task.state === 'archived').sort((a, b) => a.order - b.order);
  }, [tasks]);

  const todayTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activeTasks.filter((task) => task.date === today);
  }, [activeTasks]);

  const getTasksByState = (state: TaskState) => {
    return tasks.filter((task) => task.state === state).sort((a, b) => a.order - b.order);
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find((task) => task.id === id);
  };

  return {
    tasks,
    activeTasks,
    completedTasks,
    archivedTasks,
    todayTasks,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    reorderTasks,
    reorderSubtasks,
    getTasksByState,
    getTaskById,
  };
}

export function useTaskFilters() {
  const { tasks } = useTaskStore();

  const filterByState = (state: TaskState) => {
    return tasks.filter((task) => task.state === state).sort((a, b) => a.order - b.order);
  };

  const filterByDate = (date: string) => {
    return tasks.filter((task) => task.date === date).sort((a, b) => a.order - b.order);
  };

  const filterByEnergyTag = (tag: string) => {
    return tasks.filter((task) => task.energyTag === tag).sort((a, b) => a.order - b.order);
  };

  return {
    filterByState,
    filterByDate,
    filterByEnergyTag,
  };
}
