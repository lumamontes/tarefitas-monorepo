/**
 * Pomodoro Store (Zustand)
 * Focus / short break / long break timer state
 */

import { create } from 'zustand';
import { useSettingsStore } from './settingsStore';
import { playPomodoroFinishSound } from '../shared/lib/celebration.utils';

export type PomodoroMode = 'focus' | 'break' | 'longBreak';

interface PomodoroState {
  minutes: number;
  seconds: number;
  mode: PomodoroMode;
  isActive: boolean;
  hasFinished: boolean;
  completedCycles: number;
  completedFocusSessions: number;
  currentTaskId: string | null;
}

let timerInterval: ReturnType<typeof setInterval> | null = null;

function getDurations(): Record<PomodoroMode, number> {
  const s = useSettingsStore.getState();
  return {
    focus: s.pomodoro.focusMinutes,
    break: s.pomodoro.shortBreakMinutes,
    longBreak: s.pomodoro.longBreakMinutes,
  };
}

interface PomodoroStore extends PomodoroState {
  initializeStore: () => void;
  setMode: (mode: PomodoroMode) => void;
  startCountdown: () => void;
  pauseCountdown: () => void;
  resetCountdown: () => void;
  nextMode: () => void;
}

export const usePomodoroStore = create<PomodoroStore>()((set, get) => ({
  minutes: 25,
  seconds: 0,
  mode: 'focus',
  isActive: false,
  hasFinished: false,
  completedCycles: 0,
  completedFocusSessions: 0,
  currentTaskId: null,

  initializeStore: () => {
    const state = get();
    const durations = getDurations();
    const mode = state.mode;
    const expectedMinutes = durations[mode];
    
    // Only update if state is different to prevent unnecessary re-renders
    if (
      state.minutes !== expectedMinutes ||
      state.seconds !== 0 ||
      state.isActive !== false ||
      state.hasFinished !== false
    ) {
      set({
        minutes: expectedMinutes,
        seconds: 0,
        isActive: false,
        hasFinished: false,
      });
    }
  },

  setMode: (mode) => {
    if (get().isActive) return;
    const durations = getDurations();
    set({
      mode,
      minutes: durations[mode],
      seconds: 0,
      hasFinished: false,
    });
  },

  startCountdown: () => {
    if (get().isActive) return;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    set({ isActive: true, hasFinished: false });

    timerInterval = setInterval(() => {
      const { minutes, seconds, mode } = get();
      if (seconds > 0) {
        set({ seconds: seconds - 1 });
      } else if (minutes > 0) {
        set({ minutes: minutes - 1, seconds: 59 });
      } else {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        const state = get();
        set({
          isActive: false,
          hasFinished: true,
          ...(mode === 'focus'
            ? {
                completedFocusSessions: state.completedFocusSessions + 1,
                completedCycles: state.completedCycles + 1,
              }
            : {}),
        });
        playPomodoroFinishSound();
      }
    }, 1000);
  },

  pauseCountdown: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    set({ isActive: false });
  },

  resetCountdown: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const durations = getDurations();
    const mode = get().mode;
    set({
      isActive: false,
      hasFinished: false,
      minutes: durations[mode],
      seconds: 0,
    });
  },

  nextMode: () => {
    const { mode, completedCycles } = get();
    const cyclesBeforeLong = useSettingsStore.getState().pomodoro.cyclesBeforeLongBreak;

    if (mode === 'focus') {
      if (completedCycles > 0 && completedCycles % cyclesBeforeLong === 0) {
        get().setMode('longBreak');
      } else {
        get().setMode('break');
      }
    } else {
      get().setMode('focus');
    }
  },
}));

export function initializePomodoroStore(): void {
  usePomodoroStore.getState().initializeStore();
}

export function setPomodoroMode(mode: PomodoroMode): void {
  usePomodoroStore.getState().setMode(mode);
}

export function startPomodoroCountdown(): void {
  usePomodoroStore.getState().startCountdown();
}

export function pausePomodoroCountdown(): void {
  usePomodoroStore.getState().pauseCountdown();
}

export function resetPomodoroCountdown(): void {
  usePomodoroStore.getState().resetCountdown();
}

export function nextPomodoroMode(): void {
  usePomodoroStore.getState().nextMode();
}
