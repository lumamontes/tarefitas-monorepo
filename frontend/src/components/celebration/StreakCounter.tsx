/**
 * StreakCounter Component
 * Visual momentum indicator for completed tasks
 * Provides dopamine feedback through visual progress
 */

import { useNDStore } from '../../stores/ndStore';
import { useSettingsStore } from '../../stores/settingsStore';

export function StreakCounter() {
  const completionStreak = useNDStore((s) => s.completionStreak);
  const getStreakMessage = useNDStore((s) => s.getStreakMessage);
  const streakMessage = getStreakMessage();
  const streakTracking = useSettingsStore((s) => s.ndSettings?.streakTracking);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  if (!streakTracking || completionStreak === 0) {
    return null;
  }

  return (
    <div className="bg-theme-accent/10 border border-theme-accent/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-theme-accent/20 rounded-full">
          <span className="text-xl font-bold text-theme-accent">
            {completionStreak}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-theme-text">Task Streak</h3>
          {streakMessage && (
            <p className="text-sm text-theme-muted">{streakMessage}</p>
          )}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: Math.min(completionStreak, 10) }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-8 rounded-full ${
                i < completionStreak 
                  ? 'bg-theme-accent' 
                  : 'bg-theme-border'
              } ${
                reduceMotion ? '' : 'transition-colors duration-300'
              }`}
              aria-hidden="true"
            />
          ))}
          {completionStreak > 10 && (
            <span className="text-xs text-theme-muted ml-1">+{completionStreak - 10}</span>
          )}
        </div>
      </div>
    </div>
  );
}