/**
 * Focus timer widget
 * Gentle Pomodoro timer
 */

import { useFocusTimer } from '../../../features/use-focus-timer';
import { Button } from '../../../shared/ui';

export function FocusTimer() {
  const {
    mode,
    isRunning,
    minutes,
    seconds,
    progress,
    start,
    pause,
    reset,
    setMode,
  } = useFocusTimer();

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="flex gap-2 bg-theme-sidebar rounded-lg p-1">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'focus'
              ? 'bg-theme-accent text-white'
              : 'text-theme-muted hover:text-theme-text'
          }`}
          onClick={() => setMode('focus')}
        >
          Focus
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'short-break'
              ? 'bg-theme-accent text-white'
              : 'text-theme-muted hover:text-theme-text'
          }`}
          onClick={() => setMode('short-break')}
        >
          Short Break
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'long-break'
              ? 'bg-theme-accent text-white'
              : 'text-theme-muted hover:text-theme-text'
          }`}
          onClick={() => setMode('long-break')}
        >
          Long Break
        </button>
      </div>

      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress)}`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl font-bold text-theme-text">{formatTime(minutes, seconds)}</div>
        </div>
      </div>

      <div className="flex gap-4">
        {!isRunning ? (
          <Button onClick={start} variant="primary" size="large">
            Start
          </Button>
        ) : (
          <Button onClick={pause} variant="secondary" size="large">
            Pause
          </Button>
        )}
        <Button onClick={reset} variant="ghost" size="large">
          Reset
        </Button>
      </div>
    </div>
  );
}
