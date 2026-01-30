/**
 * Settings Store (Zustand)
 * UI + preferences. Preferences persist to SQLite via setPreference('settings', ...).
 * No localStorage persist — hydrated from DB on init.
 */

import { create } from 'zustand';
import type { SettingsState, NDSettings, ThemeId, CustomPalette, Section } from '../types';
import { setPreference } from '../domain/usecases/setPreference';
import { queryClient, queryKeys } from '../query/client';

function persistSettingsToDb(): void {
  try {
    const state = useSettingsStore.getState();
    const { previousSettings, isSidebarOpen, ...toSave } = state;
    setPreference('settings', toSave);
    queryClient.invalidateQueries({ queryKey: queryKeys.prefs() });
  } catch {
    // Not in Tauri or DB not ready
  }
}

// Predefined theme palettes
const themePalettes: Record<Exclude<ThemeId, 'custom'>, CustomPalette> = {
  'calm-beige': {
    bg: '#f8f7f4',
    panel: '#ffffff',
    sidebar: '#fefefe',
    text: '#2d3436',
    mutedText: '#636e72',
    accent: '#6c5ce7',
    border: '#dfe6e9'
  },
  'high-contrast': {
    bg: '#ffffff',
    panel: '#ffffff',
    sidebar: '#f5f5f5',
    text: '#000000',
    mutedText: '#444444',
    accent: '#0066cc',
    border: '#000000'
  },
  'low-stimulation': {
    bg: '#f8f8f8',
    panel: '#f0f0f0',
    sidebar: '#ffffff',
    text: '#555555',
    mutedText: '#888888',
    accent: '#666666',
    border: '#dddddd'
  }
};

// Default ND settings
const defaultNDSettings: NDSettings = {
  stimLevel: 'optimal',
  focusMode: 'attention-support',
  changeAnxiety: 'medium',
  executiveLoad: 'standard',
  animationIntensity: 'minimal',
  colorContrast: 'medium',
  texturePatterns: false,
  focusRingStyle: 'subtle',
  celebrationStyle: 'minimal',
  streakTracking: true,
  contextReminders: true,
  routineTemplates: true,
  randomizeOrder: false,
  hyperfocusBreaks: true
};

// Default settings
const defaultSettings: SettingsState = {
  themeId: 'calm-beige',
  customPalette: {
    bg: '#f8f7f4',
    panel: '#ffffff',
    sidebar: '#fefefe',
    text: '#2d3436',
    mutedText: '#636e72',
    accent: '#6c5ce7',
    border: '#dfe6e9'
  },
  fontId: 'system',
  fontScale: 'md',
  density: 'cozy',
  showProgressBars: true,
  showTimeDistanceLabels: true,
  reduceMotion: typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : true,
  soundEnabled: false,
  soundVolume: 0.6,
  tickSoundEnabled: false,
  focusModeEnabled: false,
  ndSettings: defaultNDSettings,
  pomodoro: {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4
  }
};

interface SettingsStore extends SettingsState {
  currentSection: Section | 'configuracoes';
  previousSettings: SettingsState | null;
  isSidebarOpen: boolean;
  
  // Actions
  updateSettings: (updates: Partial<SettingsState>) => void;
  updateNDSettings: (updates: Partial<NDSettings>) => void;
  updatePomodoroSettings: (updates: Partial<SettingsState['pomodoro']>) => void;
  updateCustomPalette: (updates: Partial<CustomPalette>) => void;
  setCurrentSection: (section: Section | 'configuracoes') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  resetSettings: () => void;
  undoSettings: () => void;
  resetAppearance: () => void;
  resetSounds: () => void;
  resetPomodoro: () => void;
  pauseEverything: () => void;
  initializeSettings: () => void;
  loadSettingsFromDb: () => Promise<void>;
  applyTheme: () => void;
  applyFont: () => void;
  getCurrentPalette: () => CustomPalette;
}

export const useSettingsStore = create<SettingsStore>()((set, get) => ({
  ...defaultSettings,
  currentSection: 'tasks',
  previousSettings: null,
  isSidebarOpen: false,

  updateSettings: (updates) => {
    const current = get();
    set({
      previousSettings: current,
      ...current,
      ...updates,
    });
    get().applyTheme();
    get().applyFont();
    persistSettingsToDb();
  },

  updateNDSettings: (updates) => {
    const current = get();
    set({
      previousSettings: current,
      ...current,
      ndSettings: { ...current.ndSettings, ...updates },
    });
    get().applyTheme();
    persistSettingsToDb();
  },

  updatePomodoroSettings: (updates) => {
    const current = get();
    set({
      previousSettings: current,
      ...current,
      pomodoro: { ...current.pomodoro, ...updates },
    });
    persistSettingsToDb();
  },

  updateCustomPalette: (updates) => {
    const current = get();
    set({
      previousSettings: current,
      ...current,
      themeId: 'custom' as ThemeId,
      customPalette: { ...current.customPalette, ...updates },
    });
    get().applyTheme();
    persistSettingsToDb();
  },

      setCurrentSection: (section) => {
        set({ currentSection: section });
      },

  toggleSidebar: () => {
    set({ isSidebarOpen: !get().isSidebarOpen });
  },

  setSidebarOpen: (open) => {
    set({ isSidebarOpen: open });
  },

  resetSettings: () => {
    set({ previousSettings: get() });
    set(defaultSettings);
    get().applyTheme();
    get().applyFont();
    persistSettingsToDb();
  },

      undoSettings: () => {
        const previous = get().previousSettings;
        if (previous) {
          set({ 
            ...previous,
            previousSettings: null 
          });
          get().applyTheme();
          get().applyFont();
        }
      },

  resetAppearance: () => {
    const current = get();
    set({
      previousSettings: current,
      ...current,
      themeId: defaultSettings.themeId,
      customPalette: defaultSettings.customPalette,
      density: defaultSettings.density,
      showProgressBars: defaultSettings.showProgressBars,
    });
    get().applyTheme();
    persistSettingsToDb();
  },

  resetSounds: () => {
    const current = get();
    set({
      previousSettings: current,
      ...current,
      soundEnabled: defaultSettings.soundEnabled,
      soundVolume: defaultSettings.soundVolume,
      tickSoundEnabled: defaultSettings.tickSoundEnabled,
    });
    persistSettingsToDb();
  },

  resetPomodoro: () => {
    const current = get();
    set({
      previousSettings: current,
      ...current,
      pomodoro: defaultSettings.pomodoro,
    });
    persistSettingsToDb();
  },

  pauseEverything: () => {
    const current = get();
    set({
      previousSettings: current,
      ...current,
      soundEnabled: false,
      showTimeDistanceLabels: true,
      reduceMotion: true,
    });
    persistSettingsToDb();
  },

  initializeSettings: () => {
    if (typeof window === 'undefined') return;
    const settings = get();
    if (settings.themeId === 'custom' && (!settings.customPalette || !settings.customPalette.bg)) {
      set({
        ...settings,
        customPalette: settings.customPalette || themePalettes['calm-beige'],
      });
    }
    get().applyTheme();
    get().applyFont();
  },

  loadSettingsFromDb: async () => {
    try {
      const { getDb } = await import('../db');
      const prefsRepo = await import('../db/repos/prefsRepo');
      const db = await getDb();
      const raw = await prefsRepo.get('settings', db);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsState>;
        const { isSidebarOpen: _restoredSidebar, ...rest } = parsed;
        const isMobileViewport =
          typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;
        useSettingsStore.setState((s) => ({
          ...s,
          ...rest,
          previousSettings: null,
          isSidebarOpen: isMobileViewport ? false : (s.isSidebarOpen ?? false),
        }));
        useSettingsStore.getState().applyTheme();
        useSettingsStore.getState().applyFont();
      }
    } catch {
      // Not in Tauri or DB not ready
    }
  },

      applyTheme: () => {
        if (typeof document === 'undefined') return;
        
        const settings = get();
        const palette = settings.themeId === 'custom' 
          ? (settings.customPalette || themePalettes['calm-beige'])
          : (themePalettes[settings.themeId] || themePalettes['calm-beige']);
        
        if (!palette || !palette.bg) {
          const defaultPalette = themePalettes['calm-beige'];
          const root = document.documentElement;
          root.style.setProperty('--bg', defaultPalette.bg);
          root.style.setProperty('--panel', defaultPalette.panel);
          root.style.setProperty('--sidebar', defaultPalette.sidebar);
          root.style.setProperty('--text', defaultPalette.text);
          root.style.setProperty('--muted', defaultPalette.mutedText);
          root.style.setProperty('--accent', defaultPalette.accent);
          root.style.setProperty('--border', defaultPalette.border);
          get().applyNDSettings();
          return;
        }
        
        const root = document.documentElement;
        root.style.setProperty('--bg', palette.bg);
        root.style.setProperty('--panel', palette.panel);
        root.style.setProperty('--sidebar', palette.sidebar);
        root.style.setProperty('--text', palette.text);
        root.style.setProperty('--muted', palette.mutedText);
        root.style.setProperty('--accent', palette.accent);
        root.style.setProperty('--border', palette.border);
        
        get().applyNDSettings();
      },

      applyNDSettings: () => {
        if (typeof document === 'undefined') return;
        
        const settings = get();
        const ndSettings = settings.ndSettings || defaultNDSettings;
        const root = document.documentElement;
        
        // Animation intensity
        if (ndSettings.animationIntensity === 'none') {
          root.style.setProperty('--transition-duration', '0ms');
          root.style.setProperty('--animation-duration', '0ms');
          document.body.classList.add('no-animations');
        } else if (ndSettings.animationIntensity === 'minimal') {
          root.style.setProperty('--transition-duration', '150ms');
          root.style.setProperty('--animation-duration', '300ms');
          document.body.classList.remove('no-animations');
        } else {
          root.style.setProperty('--transition-duration', '200ms');
          root.style.setProperty('--animation-duration', '500ms');
          document.body.classList.remove('no-animations');
        }
        
        // Color contrast adjustments
        if (ndSettings.colorContrast === 'high') {
          root.style.setProperty('--border-opacity', '1');
          root.style.setProperty('--text-contrast', '1');
        } else if (ndSettings.colorContrast === 'soft') {
          root.style.setProperty('--border-opacity', '0.3');
          root.style.setProperty('--text-contrast', '0.8');
        } else {
          root.style.setProperty('--border-opacity', '0.6');
          root.style.setProperty('--text-contrast', '0.9');
        }
        
        // Focus ring styles
        if (ndSettings.focusRingStyle === 'bold') {
          root.style.setProperty('--focus-ring-width', '3px');
          root.style.setProperty('--focus-ring-opacity', '0.8');
        } else if (ndSettings.focusRingStyle === 'subtle') {
          root.style.setProperty('--focus-ring-width', '1px');
          root.style.setProperty('--focus-ring-opacity', '0.4');
        } else {
          root.style.setProperty('--focus-ring-width', '2px');
          root.style.setProperty('--focus-ring-opacity', '0.6');
        }
        
        // Texture patterns
        if (ndSettings.texturePatterns) {
          document.body.classList.add('texture-patterns');
        } else {
          document.body.classList.remove('texture-patterns');
        }
        
        // Executive load complexity
        document.body.classList.remove('complexity-minimal', 'complexity-standard', 'complexity-complex');
        document.body.classList.add(`complexity-${ndSettings.executiveLoad}`);
        
        // Color contrast mode
        document.body.classList.remove('contrast-soft', 'contrast-medium', 'contrast-high');
        document.body.classList.add(`contrast-${ndSettings.colorContrast}`);
        
        // Stimulation level
        document.body.classList.remove('stim-understimulated', 'stim-optimal', 'stim-overstimulated');
        document.body.classList.add(`stim-${ndSettings.stimLevel}`);
      },

      applyFont: () => {
        if (typeof document === 'undefined') return;
        
        const settings = get();
        const fontStacks: Record<string, string> = {
          system: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          inter: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          atkinson: '"Atkinson Hyperlegible", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          lexend: '"Lexend", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          opendyslexic: '"OpenDyslexic", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        };
        
        const scaleMap = { sm: '14px', md: '16px', lg: '18px', xl: '20px' };
        
        const root = document.documentElement;
        root.style.setProperty('--font-family', fontStacks[settings.fontId] || fontStacks.system);
        root.style.setProperty('--font-size-base', scaleMap[settings.fontScale]);
      },

  getCurrentPalette: () => {
    const settings = get();
    if (settings.themeId === 'custom') {
      return settings.customPalette || themePalettes['calm-beige'];
    }
    return themePalettes[settings.themeId] || themePalettes['calm-beige'];
  },
}));

// --- Action wrappers (for components importing updateSettings, resetSettings, etc.) ---

const getSettingsState = () => useSettingsStore.getState();

export function updateSettings(updates: Partial<SettingsState>): void {
  getSettingsState().updateSettings(updates);
}

export function updatePomodoroSettings(updates: Partial<SettingsState['pomodoro']>): void {
  getSettingsState().updatePomodoroSettings(updates);
}

export function updateNDSettings(updates: Partial<SettingsState['ndSettings']>): void {
  getSettingsState().updateNDSettings(updates);
}

export function updateCustomPalette(updates: Partial<CustomPalette>): void {
  getSettingsState().updateCustomPalette(updates);
}

export function setCurrentSection(section: Section | 'configuracoes'): void {
  getSettingsState().setCurrentSection(section);
}

export function resetSettings(): void {
  getSettingsState().resetSettings();
}

export function undoSettings(): void {
  getSettingsState().undoSettings();
}

export function resetAppearance(): void {
  getSettingsState().resetAppearance();
}

export function resetSounds(): void {
  getSettingsState().resetSounds();
}

export function resetPomodoro(): void {
  getSettingsState().resetPomodoro();
}

export function pauseEverything(): void {
  getSettingsState().pauseEverything();
}

