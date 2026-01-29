/**
 * Auth widget
 * Shows login/logout button and user info
 */

import { useAuth } from '../../../features/use-auth';
import { Button } from '../../../shared/ui';

export function AuthWidget() {
  const { user, isAuthenticated, isLoading, loginWithGoogle, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center">
        <span className="text-sm text-theme-muted">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-theme-text">{user.name}</span>
        </div>
        <Button onClick={logout} variant="ghost" size="small">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button onClick={loginWithGoogle} variant="primary" size="small">
        Sign in with Google
      </Button>
    </div>
  );
}
