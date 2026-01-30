/**
 * Sidebar Component
 * Left sidebar content: greeting, nav, task filters, pause mode (MVP #9).
 * Layout (drawer vs static) is handled by SidebarLayout.
 */

import { Link, useMatchRoute } from '@tanstack/react-router';
import { useAuthStore, getUserName } from '../../entities/user';
import { usePauseMode } from '../../features/use-pause-mode';
import { TaskFilters } from '../tasks/TaskFilters';
import { CheckSquare, Calendar, Settings, Focus, Timer, Pause } from 'lucide-react';

const SECTIONS = [
  { path: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { path: '/calendar', label: 'Calendário', icon: Calendar },
  { path: '/focus', label: 'Foco', icon: Focus },
  { path: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { path: '/settings', label: 'Configurações', icon: Settings },
] as const;

interface SidebarProps {
  /** Called when user navigates (e.g. close drawer on mobile) */
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const matchRoute = useMatchRoute();
  const user = useAuthStore((s) => s.user);
  const { isPaused, togglePauseMode } = usePauseMode();
  const userName = getUserName();
  const userInitial = userName.charAt(0).toUpperCase();

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedDate = `Hoje, ${currentDate.split(',')[1]?.trim()}`;

  const isTasksActive = !!matchRoute({ to: '/tasks' });

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-theme-border">
        <h1 className="text-xl font-semibold text-theme-text mb-2">
          Bem vinde, {userName} :)
        </h1>
        <p className="text-sm text-theme-muted">{formattedDate}</p>
      </div>

      {/* Nav */}
      <nav
        className="p-6 border-b border-theme-border"
        role="navigation"
        aria-label="Navegação do aplicativo"
      >
        <div className="space-y-2">
          {SECTIONS.map(({ path, label, icon: Icon }) => {
            const isActive = !!matchRoute({ to: path });
            return (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2 focus-visible:ring-offset-theme-sidebar ${
                  isActive
                    ? 'bg-theme-accent/10 text-theme-text'
                    : 'text-theme-muted hover:bg-theme-bg hover:text-theme-text'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Task filters when on tasks */}
      {isTasksActive && (
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 id="tasks-heading" className="text-sm font-medium text-theme-text mb-4">
            Filtros
          </h2>
          <TaskFilters />
        </div>
      )}

      {/* Pause mode — burnout safety (MVP #9, DESIGN: calm, optional) */}
      <div className="px-6 py-4 border-t border-theme-border">
        <button
          type="button"
          onClick={togglePauseMode}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-theme-muted hover:bg-theme-bg hover:text-theme-text transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2 focus-visible:ring-offset-theme-sidebar"
          aria-pressed={isPaused}
          aria-label={isPaused ? 'Sair do modo pausa' : 'Entrar em modo pausa'}
        >
          <Pause className="w-5 h-5 shrink-0" />
          <span>{isPaused ? 'Sair da pausa' : 'Pausar'}</span>
        </button>
      </div>

      {/* User */}
      <div className="p-6 border-t border-theme-border">
        <div className="flex items-center gap-3">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={userName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-theme-accent rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-white">{userInitial}</span>
            </div>
          )}
          <span className="text-sm font-medium text-theme-text truncate">{userName}</span>
        </div>
      </div>
    </div>
  );
}
