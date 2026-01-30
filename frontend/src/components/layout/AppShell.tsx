/**
 * AppShell Layout Component
 * Composes SidebarLayout (responsive sidebar + main) with focus mode and mini pomodoro.
 */

import { useSettingsStore } from '../../stores/settingsStore';
import { useEffect } from 'react';
import { useStoreInit } from '../../hooks/useStoreInit';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { SidebarLayout } from './SidebarLayout';
import { TasksView } from '../tasks/TasksView';
import { PomodoroView } from '../pomodoro/PomodoroView';
import { CalendarView } from '../calendar/CalendarView';
import { SettingsPage } from '../settings/SettingsPage';
import { FocusModeView } from '../focus/FocusModeView';
import { MiniPomodoro } from '../pomodoro/MiniPomodoro';

interface AppShellProps {
  children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const currentSection = useSettingsStore((s) => s.currentSection);
  const density = useSettingsStore((s) => s.density);
  const focusModeEnabled = useSettingsStore((s) => s.focusModeEnabled);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  useStoreInit({ persistence: true, settings: true, miniTimer: true });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.className = `density-${density}`;
    }
  }, [density]);

  useKeyboardShortcut(
    () => {
      updateSettings({ focusModeEnabled: !focusModeEnabled });
    },
    {
      key: 'f',
      enabled: true,
      ignoreInputs: true,
    }
  );

  const mainContent = (() => {
    switch (currentSection) {
      case 'tasks':
        return <TasksView />;
      case 'pomodoro':
        return <PomodoroView />;
      case 'calendar':
        return <CalendarView />;
      case 'configuracoes':
        return <SettingsPage />;
      default:
        return <TasksView />;
    }
  })();

  if (focusModeEnabled) {
    return (
      <div className="h-screen bg-theme-bg font-sans text-theme-text overflow-hidden">
        <FocusModeView />
        {children}
        <MiniPomodoro />
      </div>
    );
  }

  return (
    <div className="h-screen bg-theme-bg font-sans text-theme-text overflow-hidden flex flex-col">
      <SidebarLayout main={mainContent} />
      {children}
      <MiniPomodoro />
    </div>
  );
}