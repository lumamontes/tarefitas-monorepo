/**
 * Tauri Rust commands wrapper
 * Provides type-safe access to Rust backend
 */

import { invoke } from '@tauri-apps/api/core';

/**
 * Generate a unique ID using Rust backend
 */
export async function generateId(): Promise<string> {
  return invoke<string>('generate_id');
}
