/**
 * useFocusTimer hook
 * Gentle Pomodoro timer without streaks or pressure
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerMode = 'focus' | 'short-break' | 'long-break';

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
}

const defaultSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
};

export function useFocusTimer(settings: TimerSettings = defaultSettings) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(settings.focusDuration * 60); // in seconds
  const intervalRef = useRef<number | null>(null);

  const getDurationForMode = useCallback(
    (timerMode: TimerMode): number => {
      switch (timerMode) {
        case 'focus':
          return settings.focusDuration * 60;
        case 'short-break':
          return settings.shortBreakDuration * 60;
        case 'long-break':
          return settings.longBreakDuration * 60;
      }
    },
    [settings]
  );

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(getDurationForMode(mode));
  }, [mode, getDurationForMode]);

  const setModeAndReset = useCallback(
    (newMode: TimerMode) => {
      setMode(newMode);
      setIsRunning(false);
      setTimeRemaining(getDurationForMode(newMode));
    },
    [getDurationForMode]
  );

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = 1 - timeRemaining / getDurationForMode(mode);

  return {
    mode,
    isRunning,
    timeRemaining,
    minutes,
    seconds,
    progress,
    start,
    pause,
    reset,
    setMode: setModeAndReset,
  };
}
