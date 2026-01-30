/**
 * Toggle task completed/active use-case.
 */

import * as tasksRepo from '../../db/repos/tasksRepo';

export async function toggleTaskComplete(id: string): Promise<void> {
  const existing = await tasksRepo.get(id);
  if (!existing) return;
  const newStatus = existing.status === 'completed' ? 'active' : 'completed';
  await tasksRepo.upsert({
    ...existing,
    status: newStatus,
    updated_at: Date.now(),
  });
}
