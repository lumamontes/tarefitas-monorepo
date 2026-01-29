/**
 * Sync provider
 * Initializes sync functionality
 */

import { ReactNode } from 'react';
import { useSync } from '../hooks/use-sync.hook';

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  useSync(); // Initialize sync
  return <>{children}</>;
}
