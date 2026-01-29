/**
 * Main navigation component
 * Accessible, calm navigation
 */

import { Link, useMatchRoute } from '@tanstack/react-router';
import { usePauseMode } from '../../../features/use-pause-mode';

export function Navigation() {
  const { isPaused } = usePauseMode();
  const matchRoute = useMatchRoute();

  if (isPaused) {
    return null; // Hide navigation in pause mode
  }

  const isActive = (path: string) => {
    const match = matchRoute({ to: path });
    return match;
  };

  const getNavLinkClassName = (path: string) => {
    const active = isActive(path);
    return `px-4 py-3 text-sm font-medium transition-colors ${
      active
        ? 'text-theme-accent border-b-2 border-theme-accent'
        : 'text-theme-muted hover:text-theme-text'
    }`;
  };

  return (
    <nav className="bg-theme-sidebar border-b border-theme-border" aria-label="Main navigation">
      <ul className="flex gap-1 px-4">
        <li>
          <Link
            to="/"
            className={getNavLinkClassName('/')}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/tasks"
            className={getNavLinkClassName('/tasks')}
          >
            Tasks
          </Link>
        </li>
        <li>
          <Link
            to="/calendar"
            className={getNavLinkClassName('/calendar')}
          >
            Calendar
          </Link>
        </li>
        <li>
          <Link
            to="/focus"
            className={getNavLinkClassName('/focus')}
          >
            Focus
          </Link>
        </li>
        <li>
          <Link
            to="/settings"
            className={getNavLinkClassName('/settings')}
          >
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  );
}
