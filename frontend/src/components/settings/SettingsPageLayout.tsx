/**
 * SettingsPageLayout
 * Wraps settings content; root layout already provides sidebar.
 * Focus mode: full-screen settings without sidebar (handled by root via route).
 */

import { useStore } from '@nanostores/react';
import { $settings, updateSettings } from '../../../../old-frontend/src/stores/settingsStore';
import { useEffect } from 'react';
import { useStoreInit } from '../../../../old-frontend/src/hooks/useStoreInit';
import { useKeyboardShortcut } from '../../../../old-frontend/src/hooks/useKeyboardShortcut';
import { SettingsPage } from './SettingsPage';

export function SettingsPageLayout() {
  const settings = useStore($settings);

  useStoreInit({ persistence: true, settings: true });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.className = `density-${settings.density}`;
    }
  }, [settings.density]);

  useKeyboardShortcut(
    () => {
      updateSettings({ focusModeEnabled: !settings.focusModeEnabled });
    },
    { key: 'f', enabled: true, ignoreInputs: true }
  );

  // Focus mode: full-screen settings only (root still shows sidebar; we just fill main)
  if (settings.focusModeEnabled) {
    return (
      <div className="min-h-full bg-theme-bg font-sans text-theme-text">
        <SettingsPage />
      </div>
    );
  }

  return <SettingsPage />;
}