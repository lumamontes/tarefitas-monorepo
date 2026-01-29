/**
 * Auth store using Zustand
 * Manages user authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '../model';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  // Helper functions for compatibility
  hasCompletedOnboarding: () => boolean;
  getUserName: () => string;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Compatibility helpers
      hasCompletedOnboarding: () => {
        const state = get();
        // Check if user exists or if there's a name in localStorage
        if (state.user) return true;
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('tarefitas-auth');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              return !!parsed.state?.user;
            } catch {
              return false;
            }
          }
        }
        return false;
      },

      getUserName: () => {
        const state = get();
        return state.user?.name || 'Pessoa';
      },
    }),
    {
      name: 'tarefitas-auth',
      version: 1,
    }
  )
);

// Standalone helper functions for compatibility
export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('tarefitas-auth');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return !!parsed.state?.user;
    } catch {
      return false;
    }
  }
  return false;
}

export function getUserName(): string {
  if (typeof window === 'undefined') return 'Pessoa';
  const stored = localStorage.getItem('tarefitas-auth');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.state?.user?.name || 'Pessoa';
    } catch {
      return 'Pessoa';
    }
  }
  return 'Pessoa';
}
