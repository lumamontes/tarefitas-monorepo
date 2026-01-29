/**
 * ND-Specific Store (Zustand)
 * Tracks streaks, context, energy levels, and provides neurodivergent-friendly features
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ContextState } from '../types';

interface NDStore {
  completionStreak: number;
  lastCompletionTime: Date | null;
  currentContext: string | null;
  energyLevel: 'low' | 'medium' | 'high';
  overwhelmLevel: 'calm' | 'elevated' | 'overwhelmed';
  focusSessionStart: Date | null;
  lastTaskCompleted: string | null;
  contextState: ContextState;
  
  // Computed getters
  getTodayEffortMessage: () => string;
  getStreakMessage: () => string | null;
  getFocusSessionDuration: () => number; // minutes
  needsBreakReminder: () => boolean;
  shouldShowCelebration: () => boolean;
  getCelebrationLevel: () => 'small' | 'medium' | 'large';
  
  // Actions
  recordTaskCompletion: (taskId: string) => void;
  startTaskContext: (taskId: string) => void;
  clearTaskContext: () => void;
  endFocusSession: () => void;
  updateEnergyLevel: (level: 'low' | 'medium' | 'high') => void;
  updateOverwhelmLevel: (level: 'calm' | 'elevated' | 'overwhelmed') => void;
  resetDailyCounters: () => void;
}

const defaultContextState: ContextState = {
  currentTask: null,
  previousTask: null,
  sessionStart: null,
  totalCompletions: 0,
  todayCompletions: 0
};

export const useNDStore = create<NDStore>()(
  persist(
    (set, get) => ({
      completionStreak: 0,
      lastCompletionTime: null,
      currentContext: null,
      energyLevel: 'medium',
      overwhelmLevel: 'calm',
      focusSessionStart: null,
      lastTaskCompleted: null,
      contextState: defaultContextState,

      getTodayEffortMessage: () => {
        const { todayCompletions } = get().contextState;
        
        if (todayCompletions === 0) {
          return "Ready to start your day? Every small step counts. 🌱";
        } else if (todayCompletions <= 2) {
          return `You've made progress today! ${todayCompletions} ${todayCompletions === 1 ? 'task' : 'tasks'} completed. 💚`;
        } else if (todayCompletions <= 5) {
          return `Great momentum! ${todayCompletions} tasks done. Your brain is doing wonderful work. ✨`;
        } else {
          return `Amazing effort today! ${todayCompletions} completions. Remember to rest when you need it. 🌟`;
        }
      },

      getStreakMessage: () => {
        const streak = get().completionStreak;
        if (streak === 0) {
          return null;
        } else if (streak < 3) {
          return `${streak} in a row! Building momentum. 🎯`;
        } else if (streak < 5) {
          return `${streak}-task streak! You're on a roll! 🔥`;
        } else {
          return `${streak}-task streak! Incredible focus! 🚀`;
        }
      },

      getFocusSessionDuration: () => {
        const start = get().focusSessionStart;
        if (!start) return 0;
        const startTime = start instanceof Date ? start : new Date(start);
        return Math.floor((Date.now() - startTime.getTime()) / (1000 * 60)); // minutes
      },

      needsBreakReminder: () => {
        return get().getFocusSessionDuration() > 90; // Suggest break after 90 minutes
      },

      shouldShowCelebration: () => {
        const streak = get().completionStreak;
        return streak > 0 && (streak % 3 === 0 || streak === 1);
      },

      getCelebrationLevel: () => {
        const streak = get().completionStreak;
        if (streak >= 10) return 'large';
        if (streak >= 5) return 'medium';
        return 'small';
      },

      recordTaskCompletion: (taskId) => {
        const now = new Date();
        const { lastCompletionTime, completionStreak, contextState } = get();
        
        // Update streak logic (reset if more than 4 hours since last completion)
        let newStreak = 1;
        const lastTime = lastCompletionTime instanceof Date ? lastCompletionTime : (lastCompletionTime ? new Date(lastCompletionTime) : null);
        if (lastTime && (now.getTime() - lastTime.getTime()) < 4 * 60 * 60 * 1000) {
          newStreak = completionStreak + 1;
        }
        
        set({
          lastCompletionTime: now.toISOString(),
          lastTaskCompleted: taskId,
          completionStreak: newStreak,
          contextState: {
            ...contextState,
            totalCompletions: contextState.totalCompletions + 1,
            todayCompletions: contextState.todayCompletions + 1
          }
        });
      },

      startTaskContext: (taskId) => {
        const { contextState, focusSessionStart } = get();
        const now = new Date().toISOString();
        set({
          contextState: {
            ...contextState,
            previousTask: contextState.currentTask,
            currentTask: taskId,
            sessionStart: now
          },
          focusSessionStart: focusSessionStart ? (focusSessionStart instanceof Date ? focusSessionStart.toISOString() : focusSessionStart) : now
        });
      },

      clearTaskContext: () => {
        const { contextState } = get();
        set({
          contextState: {
            ...contextState,
            previousTask: contextState.currentTask,
            currentTask: null
          }
        });
      },

      endFocusSession: () => {
        set({ focusSessionStart: null });
      },

      updateEnergyLevel: (level) => {
        set({ energyLevel: level });
      },

      updateOverwhelmLevel: (level) => {
        set({ overwhelmLevel: level });
      },

      resetDailyCounters: () => {
        const { contextState } = get();
        set({
          contextState: {
            ...contextState,
            todayCompletions: 0
          }
        });
      },
    }),
    {
      name: 'tarefitas-nd',
      version: 1,
      // Custom serialization for dates
      partialize: (state) => ({
        ...state,
        lastCompletionTime: state.lastCompletionTime instanceof Date 
          ? state.lastCompletionTime.toISOString() 
          : state.lastCompletionTime,
        focusSessionStart: state.focusSessionStart instanceof Date 
          ? state.focusSessionStart.toISOString() 
          : state.focusSessionStart,
        contextState: {
          ...state.contextState,
          sessionStart: state.contextState.sessionStart instanceof Date
            ? state.contextState.sessionStart.toISOString()
            : state.contextState.sessionStart
        }
      }),
    }
  )
);

// --- Helper exports ---

export function shouldShowCelebration(): boolean {
  return useNDStore.getState().shouldShowCelebration();
}

export function getCelebrationLevel(): 'small' | 'medium' | 'large' {
  return useNDStore.getState().getCelebrationLevel();
}

export function updateEnergyLevel(level: NDStore['energyLevel']): void {
  useNDStore.getState().updateEnergyLevel(level);
}
