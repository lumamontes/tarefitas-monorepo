/**
 * Store init hook — initializes stores on mount.
 * Settings are loaded once in App; use options.pomodoro for pomodoro init.
 */

import { useEffect, useRef } from 'react';
import { initializePomodoroStore } from '../stores/pomodoroStore';

interface InitOptions {
  persistence?: boolean;
  settings?: boolean;
  miniTimer?: boolean;
  pomodoro?: boolean;
}

export function useStoreInit(options: InitOptions = {}): void {
  const hasInitialized = useRef({ pomodoro: false });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (options.pomodoro && !hasInitialized.current.pomodoro) {
      initializePomodoroStore();
      hasInitialized.current.pomodoro = true;
    }
  }, [options.pomodoro]);
}
