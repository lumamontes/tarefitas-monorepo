/**
 * Reorder subtasks use-case (update sort_order).
 */

import { getDb } from '../../db';

export async function reorderSubtasks(
  taskId: string,
  subtaskIds: string[]
): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.execute('BEGIN');
  try {
    for (let i = 0; i < subtaskIds.length; i++) {
      await db.execute(
        'UPDATE subtasks SET sort_order = $1, updated_at = $2 WHERE id = $3 AND task_id = $4',
        [i, now, subtaskIds[i], taskId]
      );
    }
    await db.execute('COMMIT');
  } catch (e) {
    await db.execute('ROLLBACK');
    throw e;
  }
}
