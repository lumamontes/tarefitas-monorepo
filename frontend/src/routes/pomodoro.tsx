import { createFileRoute } from '@tanstack/react-router';
import { PomodoroPage } from '../pages/pomodoro';

export const Route = createFileRoute('/pomodoro')({
  component: PomodoroPage,
});
