/**
 * Storage utilities for offline-first persistence
 * Uses localStorage with error handling
 */

const STORAGE_PREFIX = 'tarefitas_';

export function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(getStorageKey(key));
    if (item === null) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to get item ${key}:`, error);
    return null;
  }
}

export function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Failed to set item ${key}:`, error);
    return false;
  }
}

export function removeItem(key: string): boolean {
  try {
    localStorage.removeItem(getStorageKey(key));
    return true;
  } catch (error) {
    console.error(`Failed to remove item ${key}:`, error);
    return false;
  }
}

export function clear(): boolean {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Failed to clear storage:', error);
    return false;
  }
}
