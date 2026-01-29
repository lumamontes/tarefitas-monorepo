/**
 * Preferences store using Zustand
 * Persistent user preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Preferences, defaultPreferences } from '../model';
import { Theme, Density, FontFamily } from '../../../shared/types';

interface PreferencesStore {
  preferences: Preferences;
  updatePreferences: (updates: Partial<Preferences>) => void;
  resetPreferences: () => void;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  setFontFamily: (fontFamily: FontFamily) => void;
  setFontSize: (fontSize: number) => void;
  toggleReduceMotion: () => void;
  toggleAnimations: () => void;
  toggleSounds: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));
      },

      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },

      setTheme: (theme) => {
        set((state) => ({
          preferences: { ...state.preferences, theme },
        }));
      },

      setDensity: (density) => {
        set((state) => ({
          preferences: { ...state.preferences, density },
        }));
      },

      setFontFamily: (fontFamily) => {
        set((state) => ({
          preferences: { ...state.preferences, fontFamily },
        }));
      },

      setFontSize: (fontSize) => {
        set((state) => ({
          preferences: { ...state.preferences, fontSize },
        }));
      },

      toggleReduceMotion: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            reduceMotion: !state.preferences.reduceMotion,
          },
        }));
      },

      toggleAnimations: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            animationsEnabled: !state.preferences.animationsEnabled,
          },
        }));
      },

      toggleSounds: () => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            soundsEnabled: !state.preferences.soundsEnabled,
          },
        }));
      },
    }),
    {
      name: 'tarefitas-preferences',
      version: 1,
    }
  )
);
