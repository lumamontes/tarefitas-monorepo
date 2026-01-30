/**
 * Soft-delete subtask use-case.
 */

import * as subtasksRepo from '../../db/repos/subtasksRepo';

export async function deleteSubtask(id: string): Promise<void> {
  await subtasksRepo.markDeleted(id);
}
