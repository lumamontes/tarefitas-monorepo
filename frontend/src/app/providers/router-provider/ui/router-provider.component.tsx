/**
 * Router provider
 * Sets up TanStack Router with layout
 */

import { RouterProvider as TanStackRouterProvider } from '@tanstack/react-router';
import { getRouter } from '../../../../router';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { SyncProvider } from '../../../../features/use-sync';
import { AuthCallbackProvider } from '../../auth-callback-provider';
import { useEffect } from 'react';

export function RouterProvider() {
  const initializeSettings = useSettingsStore((state) => state.initializeSettings);
  const applyFont = useSettingsStore((state) => state.applyFont);
  const fontId = useSettingsStore((state) => state.fontId);
  const fontScale = useSettingsStore((state) => state.fontScale);

  useEffect(() => {
    // Initialize settings on mount
    initializeSettings();
    applyFont();
  }, [initializeSettings, applyFont]);

  useEffect(() => {
    // Re-apply font when settings change
    applyFont();
  }, [fontId, fontScale, applyFont]);

  const router = getRouter();

  return (
    <SyncProvider>
      <AuthCallbackProvider />
      <TanStackRouterProvider router={router} />
    </SyncProvider>
  );
}
