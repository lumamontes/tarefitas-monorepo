/**
 * Task entity types
 * Matches Rust backend structure
 */

import { TaskState } from '../../../shared/types';

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string; // ISO date string, informational only
  state: TaskState;
  subtasks: Subtask[];
  energyTag?: string; // Optional user-defined energy tag
  order: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  date?: string;
  energyTag?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  date?: string;
  state?: TaskState;
  energyTag?: string;
  order?: number;
}

export interface CreateSubtaskInput {
  title: string;
  description?: string;
}

export interface UpdateSubtaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  order?: number;
}
