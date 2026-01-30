import { createFileRoute } from '@tanstack/react-router';
import { PomodoroPopupPage } from '../pages/pomodoro-popup';

export const Route = createFileRoute('/pomodoro-popup')({
  component: PomodoroPopupPage,
});
