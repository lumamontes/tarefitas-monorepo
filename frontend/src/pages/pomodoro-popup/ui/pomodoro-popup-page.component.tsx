/**
 * Pomodoro Popup Page
 * Standalone popup window for the mini pomodoro timer
 */

import { MiniPomodoroPopup } from '../../../components/pomodoro/MiniPomodoroPopup';

export function PomodoroPopupPage() {
  return (
    <main className="min-h-screen bg-theme-bg flex items-center justify-center p-4" data-section="pomodoro-popup">
      <MiniPomodoroPopup />
    </main>
  );
}
