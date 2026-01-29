/**
 * Store init hook — initializes persistence and stores on mount
 */

import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { initializePomodoroStore } from '../stores/pomodoroStore';

interface InitOptions {
  persistence?: boolean;
  settings?: boolean;
  miniTimer?: boolean;
  pomodoro?: boolean;
}

export function useStoreInit(options: InitOptions = {}): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (options.settings) {
      useSettingsStore.getState().initializeSettings?.();
    }
    if (options.pomodoro) {
      initializePomodoroStore();
    }
  }, [options.settings, options.pomodoro]);
}
