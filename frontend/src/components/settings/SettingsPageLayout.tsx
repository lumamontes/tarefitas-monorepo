/**
 * SettingsPageLayout
 * Wraps settings content; root layout already provides sidebar.
 * Focus mode: full-screen settings without sidebar (handled by root via route).
 */

import { useSettingsStore } from '../../stores/settingsStore';
import { useEffect } from 'react';
import { useStoreInit } from '../../hooks/useStoreInit';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { SettingsPage } from './SettingsPage';

export function SettingsPageLayout() {
  const density = useSettingsStore((s) => s.density);
  const focusModeEnabled = useSettingsStore((s) => s.focusModeEnabled);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  useStoreInit({ persistence: true, settings: true });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.className = `density-${density}`;
    }
  }, [density]);

  useKeyboardShortcut(
    () => {
      updateSettings({ focusModeEnabled: !focusModeEnabled });
    },
    { key: 'f', enabled: true, ignoreInputs: true }
  );

  // Focus mode: full-screen settings only (root still shows sidebar; we just fill main)
  if (focusModeEnabled) {
    return (
      <div className="min-h-full bg-theme-bg font-sans text-theme-text">
        <SettingsPage />
      </div>
    );
  }

  return <SettingsPage />;
}