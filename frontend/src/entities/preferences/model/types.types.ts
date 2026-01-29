/**
 * Preferences entity types
 */

import { Theme, Density, FontFamily } from '../../../shared/types';

export interface Preferences {
  theme: Theme;
  density: Density;
  fontFamily: FontFamily;
  fontSize: number; // in pixels
  reduceMotion: boolean;
  animationsEnabled: boolean;
  soundsEnabled: boolean;
  defaultView: 'all' | 'today' | 'completed' | 'archived';
  startInFocusMode: boolean;
  timeBlindnessHelperEnabled: boolean;
  pauseModeEnabled: boolean;
}

export const defaultPreferences: Preferences = {
  theme: 'calm',
  density: 'comfortable',
  fontFamily: 'system',
  fontSize: 16,
  reduceMotion: false,
  animationsEnabled: true,
  soundsEnabled: false,
  defaultView: 'all',
  startInFocusMode: false,
  timeBlindnessHelperEnabled: true,
  pauseModeEnabled: false,
};
