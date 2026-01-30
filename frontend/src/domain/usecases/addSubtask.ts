/**
 * Add subtask use-case.
 */

import { generateId } from '../../shared/lib/rust-commands';
import type { SubtaskRow } from '../types';
import * as subtasksRepo from '../../db/repos/subtasksRepo';

export interface AddSubtaskInput {
  taskId: string;
  title: string;
}

export async function addSubtask(input: AddSubtaskInput): Promise<SubtaskRow> {
  const existing = await subtasksRepo.listByTask(input.taskId);
  const sort_order = existing.length;
  const id = await generateId();
  const now = Date.now();
  const row: SubtaskRow = {
    id,
    task_id: input.taskId,
    title: input.title,
    done: 0,
    sort_order,
    updated_at: now,
    deleted_at: null,
  };
  await subtasksRepo.upsert(row);
  return row;
}
