/**
 * Base type definitions for Tarefitas components
 */

export interface BaseComponentProps {
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  id?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  calendarEnabled?: boolean;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  done: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  archived: boolean;
  // Calendar associations
  scheduledDate?: string;        // YYYY-MM-DD (local date, no time)
  recurring?: {
    type: "daily" | "weekly";
    daysOfWeek?: number[];       // 0–6 (Sun–Sat), only for weekly
  };
}

export type Section = 'tasks' | 'calendar' | 'pomodoro' | 'dashboard' | 'configuracoes';

export type ThemeId = "calm-beige" | "high-contrast" | "low-stimulation" | "custom";
export type FontId = "system" | "inter" | "atkinson" | "lexend" | "opendyslexic";

export interface CustomPalette {
  bg: string;          // app background
  panel: string;       // main panel background
  sidebar: string;     // sidebar background
  text: string;        // primary text
  mutedText: string;   // secondary text/labels
  accent: string;      // highlights, selected pills, progress fill
  border: string;      // subtle separators
}

export interface NDSettings {
  stimLevel: 'understimulated' | 'optimal' | 'overstimulated';
  focusMode: 'hyperfocus-protection' | 'attention-support';
  changeAnxiety: 'high' | 'medium' | 'low';
  executiveLoad: 'minimal' | 'standard' | 'complex';
  animationIntensity: 'none' | 'minimal' | 'standard';
  colorContrast: 'soft' | 'medium' | 'high';
  texturePatterns: boolean;
  focusRingStyle: 'subtle' | 'bold' | 'custom';
  celebrationStyle: 'none' | 'minimal' | 'full';
  streakTracking: boolean;
  contextReminders: boolean;
  routineTemplates: boolean;
  randomizeOrder: boolean;
  hyperfocusBreaks: boolean;
}

export interface SettingsState {
  themeId: ThemeId;
  customPalette: CustomPalette;
  fontId: FontId;
  fontScale: "sm" | "md" | "lg" | "xl";
  density: "cozy" | "compact";
  showProgressBars: boolean;
  reduceMotion: boolean;
  soundEnabled: boolean;
  pomodoroSound: "none" | "white-noise" | "pink-noise" | "brown-noise" | "rain" | "cafe";
  soundVolume: number;
  tickSoundEnabled: boolean;
  focusModeEnabled: boolean;
  ndSettings: NDSettings;
  pomodoro: {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    cyclesBeforeLongBreak: number;
  };
}

export interface ContextState {
  currentTask: string | null;
  previousTask: string | null;
  sessionStart: Date | string | null; // Can be Date object or ISO string
  totalCompletions: number;
  todayCompletions: number;
}
