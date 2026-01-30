/**
 * Toggle subtask done use-case.
 */

import * as subtasksRepo from '../../db/repos/subtasksRepo';
import { getDb } from '../../db';

export async function toggleSubtask(id: string): Promise<void> {
  const db = await getDb();
  const rows = await db.select<{ id: string; done: number }[]>(
    'SELECT id, done FROM subtasks WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row) return;
  const newDone = row.done === 1 ? 0 : 1;
  await db.execute(
    'UPDATE subtasks SET done = $1, updated_at = $2 WHERE id = $3',
    [newDone, Date.now(), id]
  );
}
