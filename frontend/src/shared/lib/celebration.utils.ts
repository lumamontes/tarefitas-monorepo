/**
 * Celebration utilities
 * Gentle, optional celebrations for task completion
 */

import confetti from 'canvas-confetti';
import { useSettingsStore } from '../../stores/settingsStore';

const POMODORO_FINISH_SOUND_URL = '/finish.mp3';

let finishAudio: HTMLAudioElement | null = null;

export function initializeCelebration() {
  try {
    finishAudio = new Audio(POMODORO_FINISH_SOUND_URL);
    finishAudio.preload = 'auto';
  } catch (error) {
    console.warn('Could not load finish sound:', error);
  }
}

export function playFinishSound() {
  if (finishAudio) {
    try {
      finishAudio.currentTime = 0;
      finishAudio.play().catch((error) => {
        console.warn('Could not play finish sound:', error);
      });
    } catch (error) {
      console.warn('Error playing finish sound:', error);
    }
  }
}

/**
 * Play the pomodoro finish sound when a focus/break session ends.
 * Respects soundEnabled and soundVolume from settings.
 */
export function playPomodoroFinishSound() {
  const { soundEnabled, soundVolume } = useSettingsStore.getState();
  if (!soundEnabled) return;
  try {
    const audio = new Audio(POMODORO_FINISH_SOUND_URL);
    audio.volume = Math.max(0, Math.min(1, soundVolume));
    audio.play().catch((err) => console.warn('Could not play pomodoro finish sound:', err));
  } catch (error) {
    console.warn('Error playing pomodoro finish sound:', error);
  }
}

export function triggerConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 }
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
}

export function celebrate() {
  playFinishSound();
  triggerConfetti();
}
