/**
 * SoundSection Component
 * Pomodoro sound and audio settings (single finish sound)
 */

import { useSettingsStore } from '../../../stores/settingsStore';

export function SoundSection() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const soundVolume = useSettingsStore((s) => s.soundVolume);
  const tickSoundEnabled = useSettingsStore((s) => s.tickSoundEnabled);
  const pomodoro = useSettingsStore((s) => s.pomodoro);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const updatePomodoroSettings = useSettingsStore((s) => s.updatePomodoroSettings);
  const resetSounds = useSettingsStore((s) => s.resetSounds);
  const resetPomodoro = useSettingsStore((s) => s.resetPomodoro);

  return (
    <div className="space-y-6">
      {/* Master Sound Toggle */}
      <div>
        <h3 className="text-base font-medium text-theme-text mb-4">Som</h3>
        <label className="flex items-center justify-between p-3 rounded-lg border border-theme-border hover:border-theme-accent/50 transition-colors cursor-pointer">
          <div>
            <div className="font-medium text-theme-text">Ativar som ao final do pomodoro</div>
            <div className="text-sm text-theme-muted">
              Toca um som quando o tempo de foco ou pausa termina
            </div>
          </div>
          <button
            onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 ${
              soundEnabled ? 'bg-theme-accent' : 'bg-theme-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-theme-sidebar transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Volume Control */}
      <div className={soundEnabled ? '' : 'opacity-50 pointer-events-none'}>
        <h3 className="text-base font-medium text-theme-text mb-4">Volume</h3>
        <div className="p-3 rounded-lg border border-theme-border">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-theme-muted" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12 5a1 1 0 011.414 0L15 6.586l1.586-1.586a1 1 0 011.414 1.414L16.414 8 18 9.586a1 1 0 01-1.414 1.414L15 9.414l-1.586 1.586a1 1 0 01-1.414-1.414L13.586 8 12 6.414A1 1 0 0112 5z" clipRule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={soundVolume}
              onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
              disabled={!soundEnabled}
              className="flex-1 h-2 bg-theme-border rounded-lg appearance-none cursor-pointer slider"
            />
            <svg className="w-4 h-4 text-theme-muted" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-theme-muted min-w-8">{Math.round(soundVolume * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Tick Sound */}
      <div className={soundEnabled ? '' : 'opacity-50 pointer-events-none'}>
        <h3 className="text-base font-medium text-theme-text mb-4">Som de tique</h3>
        <label className="flex items-center justify-between p-3 rounded-lg border border-theme-border hover:border-theme-accent/50 transition-colors cursor-pointer">
          <div>
            <div className="font-medium text-theme-text">Tique do relógio</div>
            <div className="text-sm text-theme-muted">
              Som sutil de tique durante o timer (opcional)
            </div>
          </div>
          <button
            onClick={() => updateSettings({ tickSoundEnabled: !tickSoundEnabled })}
            disabled={!soundEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 ${
              tickSoundEnabled && soundEnabled ? 'bg-theme-accent' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                tickSoundEnabled && soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Pomodoro Durations */}
      <div>
        <h3 className="text-base font-medium text-theme-text mb-4">Durações do Pomodoro</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">
              Tempo de foco (min)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={pomodoro.focusMinutes}
              onChange={(e) => updatePomodoroSettings({ focusMinutes: parseInt(e.target.value) || 25 })}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-sidebar text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">
              Pausa curta (min)
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={pomodoro.shortBreakMinutes}
              onChange={(e) => updatePomodoroSettings({ shortBreakMinutes: parseInt(e.target.value) || 5 })}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-sidebar text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">
              Pausa longa (min)
            </label>
            <input
              type="number"
              min="15"
              max="30"
              value={pomodoro.longBreakMinutes}
              onChange={(e) => updatePomodoroSettings({ longBreakMinutes: parseInt(e.target.value) || 15 })}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-sidebar text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
            />
          </div>
        </div>
      </div>

      {/* Reset Sounds */}
      <div>
        <h3 className="text-base font-medium text-theme-text mb-4">Restaurar sons</h3>
        <div className="p-4 rounded-lg border border-theme-border bg-theme-sidebar">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-theme-text mb-1">Restaurar configurações de som</div>
              <div className="text-sm text-theme-muted">Volta som e volume para os padrões</div>
            </div>
            <button
              onClick={resetSounds}
              className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-theme-accent text-sm font-medium"
            >
              Restaurar
            </button>
          </div>
        </div>
      </div>

      {/* Reset Pomodoro */}
      <div>
        <h3 className="text-base font-medium text-theme-text mb-4">Restaurar Pomodoro</h3>
        <div className="p-4 rounded-lg border border-theme-border bg-theme-sidebar">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-theme-text mb-1">Restaurar configurações do pomodoro</div>
              <div className="text-sm text-theme-muted">Volta durações de foco e pausa para os padrões</div>
            </div>
            <button
              onClick={resetPomodoro}
              className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-theme-accent text-sm font-medium"
            >
              Restaurar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
