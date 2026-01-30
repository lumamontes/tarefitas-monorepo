/**
 * Preferences from SQLite via TanStack Query (no useEffect).
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query/client';
import * as prefsRepo from '../db/repos/prefsRepo';

async function fetchPrefs(keys?: string[]): Promise<Record<string, unknown>> {
  const rows = await prefsRepo.listAll();
  const map: Record<string, unknown> = {};
  for (const r of rows) {
    if (keys && keys.length > 0 && !keys.includes(r.key)) continue;
    try {
      map[r.key] = JSON.parse(r.value) as unknown;
    } catch {
      map[r.key] = r.value;
    }
  }
  return map;
}

export function usePrefs(keys?: string[]): {
  prefs: Record<string, unknown>;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.prefs(keys),
    queryFn: () => fetchPrefs(keys),
  });
  return {
    prefs: data ?? {},
    isLoading,
    error: error instanceof Error ? error : null,
  };
}

export function usePref(key: string): {
  value: unknown;
  isLoading: boolean;
  error: Error | null;
} {
  const { prefs, isLoading, error } = usePrefs([key]);
  return {
    value: key in prefs ? prefs[key] : undefined,
    isLoading,
    error,
  };
}
