/**
 * Tauri environment detection.
 * Use to guard code that depends on Tauri (invoke, SQL plugin, etc.).
 */

export function isTauri(): boolean {
  return typeof window !== 'undefined' && window.__TAURI__ != null;
}
