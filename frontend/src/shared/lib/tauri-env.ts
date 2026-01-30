/**
 * Tauri environment detection.
 * Use to guard code that depends on Tauri (invoke, SQL plugin, etc.).
 */

export function isTauri(): boolean {
  return typeof window !== 'undefined' && window.__TAURI__ != null;
}

/**
 * Detect mobile/touch device (Android, iOS, or narrow screen).
 * Used to show notification/widget options instead of desktop popup.
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isAndroidOrIos = /Android|iPhone|iPad|iPod|webOS/i.test(ua);
  const isNarrow = window.innerWidth < 768;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return isAndroidOrIos || (hasTouch && isNarrow);
}
