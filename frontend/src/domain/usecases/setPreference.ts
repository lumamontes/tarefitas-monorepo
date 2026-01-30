/**
 * Set preference use-case (key/value JSON).
 */

import * as prefsRepo from '../../db/repos/prefsRepo';
export async function setPreference(key: string, value: unknown): Promise<void> {
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  await prefsRepo.set(key, valueStr);
}
