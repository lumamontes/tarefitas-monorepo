/**
 * usePreferences hook
 * Provides preferences management
 */

import { usePreferencesStore } from '../../../entities/preferences';
import { Theme, Density, FontFamily } from '../../../shared/types';

export function usePreferences() {
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    setTheme,
    setDensity,
    setFontFamily,
    setFontSize,
    toggleReduceMotion,
    toggleAnimations,
    toggleSounds,
  } = usePreferencesStore();

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    setTheme,
    setDensity,
    setFontFamily,
    setFontSize,
    toggleReduceMotion,
    toggleAnimations,
    toggleSounds,
  };
}
