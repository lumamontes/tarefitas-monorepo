/**
 * useAuth hook
 * Provides authentication functionality
 */

import { useAuthStore } from '../../../entities/user';
import { toast } from '../../../shared/ui/toast.component';

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, setUser, setLoading, setError, logout } = useAuthStore();

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectUri = encodeURIComponent(window.location.origin);
      const authUrl = `${import.meta.env.VITE_API_URL || 'https://api.tarefitas.app'}/auth/google?redirect_uri=${redirectUri}`;
      
      // For Tauri, open in external browser
      if (window.__TAURI__) {
        const { open } = await import('@tauri-apps/plugin-opener');
        await open(authUrl);
        toast.info('Please complete authentication in the browser window');
      } else {
        // Web version - redirect to OAuth
        window.location.href = authUrl;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate login');
      toast.error('Failed to start authentication');
      setLoading(false);
    }
  };

  const handleAuthCallback = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      // Verify token and get user info
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.tarefitas.app'}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const userData = await response.json();
      localStorage.setItem('tarefitas_auth_token', token);
      
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        provider: 'google',
        createdAt: userData.createdAt,
      });

      toast.success('Successfully signed in');
    } catch (err: any) {
      setError(err.message || 'Failed to complete authentication');
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('tarefitas_auth_token');
    toast.info('Signed out');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithGoogle,
    handleAuthCallback,
    logout: handleLogout,
  };
}
