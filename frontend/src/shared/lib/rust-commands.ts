/**
 * Tauri Rust commands wrapper
 * Provides type-safe access to Rust backend.
 * In non-Tauri (e.g. Vite dev in browser), falls back to browser APIs.
 */

import { invoke } from '@tauri-apps/api/core';
import { isTauri } from './tauri-env';

/**
 * Generate a unique ID. Uses Rust backend in Tauri, else crypto.randomUUID().
 */
export async function generateId(): Promise<string> {
  if (isTauri()) {
    return invoke<string>('generate_id');
  }
  return crypto.randomUUID();
}
