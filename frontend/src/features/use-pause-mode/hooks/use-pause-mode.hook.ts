/**
 * usePauseMode hook
 * Burnout safety feature - hides pressure indicators
 */

import { useState, useEffect } from 'react';
import { usePreferencesStore } from '../../../entities/preferences';

export function usePauseMode() {
  const { preferences, updatePreferences } = usePreferencesStore();
  const [isPaused, setIsPaused] = useState(preferences.pauseModeEnabled);

  const enablePauseMode = () => {
    setIsPaused(true);
    updatePreferences({ pauseModeEnabled: true });
  };

  const disablePauseMode = () => {
    setIsPaused(false);
    updatePreferences({ pauseModeEnabled: false });
  };

  const togglePauseMode = () => {
    if (isPaused) {
      disablePauseMode();
    } else {
      enablePauseMode();
    }
  };

  useEffect(() => {
    setIsPaused(preferences.pauseModeEnabled);
  }, [preferences.pauseModeEnabled]);

  return {
    isPaused,
    enablePauseMode,
    disablePauseMode,
    togglePauseMode,
  };
}
