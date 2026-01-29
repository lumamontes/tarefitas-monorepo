/**
 * Pause mode banner (MVP #9 — Burnout safety)
 * Calm message when pause mode is on. No urgency language (DESIGN, NON_GOALS).
 */

import { usePauseMode } from '../../../features/use-pause-mode';
import { Button } from '../../../shared/ui';

export function PauseModeBanner() {
  const { isPaused, disablePauseMode } = usePauseMode();

  if (!isPaused) return null;

  return (
    <div
      className="bg-theme-sidebar border-b border-theme-border rounded-none px-4 py-3"
      role="banner"
      aria-live="polite"
      aria-label="Modo pausa ativo"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-theme-text">
          <strong>Modo pausa.</strong> Nada é esperado de você agora.
        </p>
        <Button
          onClick={disablePauseMode}
          variant="secondary"
          size="small"
          className="shrink-0"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
