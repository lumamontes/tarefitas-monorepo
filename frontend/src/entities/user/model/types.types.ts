/**
 * User entity types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google';
  lastSyncAt?: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
