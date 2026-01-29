/**
 * Pomodoro Page
 * Full Pomodoro timer view (MVP §7: Gentle Pomodoro)
 */

import { PomodoroView } from '../../../components/pomodoro/PomodoroView';

export function PomodoroPage() {
  return (
    <main className="min-h-screen bg-theme-bg w-full" data-section="pomodoro">
      <PomodoroView />
    </main>
  );
}
