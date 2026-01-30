/**
 * Soft-delete task use-case (and subtasks).
 */

import { getDb } from '../../db';
import * as tasksRepo from '../../db/repos/tasksRepo';

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('BEGIN');
  try {
    const now = Date.now();
    await db.execute(
      'UPDATE subtasks SET deleted_at = $1, updated_at = $1 WHERE task_id = $2',
      [now, id]
    );
    await tasksRepo.markDeleted(id, db);
    await db.execute('COMMIT');
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }
}
