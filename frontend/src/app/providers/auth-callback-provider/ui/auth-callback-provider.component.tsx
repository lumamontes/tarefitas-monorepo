/**
 * Auth callback provider
 * Handles OAuth callback
 */

import { useEffect } from 'react';
import { useAuth } from 'features/use-auth';

export function AuthCallbackProvider() {
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      handleAuthCallback(token);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [handleAuthCallback]);

  return null;
}
