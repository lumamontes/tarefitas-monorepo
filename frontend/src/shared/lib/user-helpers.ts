/**
 * User helper functions for compatibility
 * Provides functions that match old-frontend API
 */

import { useAuthStore, hasCompletedOnboarding as checkOnboarding, getUserName as getName } from '../../entities/user';

/**
 * Check if user has completed onboarding
 * Compatibility function for old-frontend components
 */
export function hasCompletedOnboarding(): boolean {
  return checkOnboarding();
}

/**
 * Get user name with fallback
 * Compatibility function for old-frontend components
 */
export function getUserName(): string {
  return getName();
}

/**
 * Set user name
 * Compatibility function - updates auth store
 */
export function setUserName(name: string): void {
  const { user, setUser } = useAuthStore.getState();
  if (user) {
    setUser({
      ...user,
      name: name.trim() || 'Pessoa',
    });
  } else {
    // Create a minimal user if none exists
    setUser({
      id: `local-${Date.now()}`,
      email: '',
      name: name.trim() || 'Pessoa',
      provider: 'google',
      createdAt: new Date().toISOString(),
    });
  }
}
