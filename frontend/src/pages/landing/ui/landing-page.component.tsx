/**
 * Landing Page — Warm editorial, distinctive.
 * Fixed left theme strip (desktop), horizontal Clima bar (mobile), asymmetric layout.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { CustomPalette } from '../../../types';
import { interpolatePalette, type Palette } from '../../../shared/lib/color-interpolate.utils';
import { LandingCTA } from '../../../components/landing/LandingCTA';
import { LandingPreview } from '../../../components/landing/LandingPreview';
import logo from '../../../assets/home.svg';
import { useIsMobile } from '@/hooks/useIsMobile';

const LANDING_THEME_STRIP_KEY = 'tarefitas-landing-theme-value';

// Journey: colorful/warm (0) → balanced (50) → low stimulus (100)
const PALETTES: Palette[] = [
  {
    bg: '#fef7f0',
    panel: '#fffaf5',
    sidebar: '#fefaf5',
    text: '#4a3728',
    mutedText: '#7d6b5a',
    accent: '#b85c38',
    border: '#eaded4',
  },
  {
    bg: '#f5f5f4',
    panel: '#ffffff',
    sidebar: '#fafafa',
    text: '#2d3436',
    mutedText: '#636e72',
    accent: '#5c7cfa',
    border: '#e5e5e5',
  },
  {
    bg: '#f0f0ef',
    panel: '#f5f5f5',
    sidebar: '#f8f8f8',
    text: '#6b6b6b',
    mutedText: '#9a9a9a',
    accent: '#8a8a8a',
    border: '#e2e2e2',
  },
];

function valueToPalette(value: number): CustomPalette {
  const t = value / 100;
  if (t <= 0.5) {
    return interpolatePalette(PALETTES[0], PALETTES[1], t * 2) as CustomPalette;
  }
  return interpolatePalette(PALETTES[1], PALETTES[2], (t - 0.5) * 2) as CustomPalette;
}

const STRIP_WIDTH = 56;

export function LandingPage() {
  const isMobile = useIsMobile();

  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [sliderValue, setSliderValue] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const raw = window.localStorage.getItem(LANDING_THEME_STRIP_KEY);
    const n = raw ? parseFloat(raw) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
  });


  const applyPalette = useCallback(
    (value: number) => {
      const palette = valueToPalette(value);
      updateSettings({ themeId: 'custom', customPalette: palette });
    },
    [updateSettings]
  );

  useEffect(() => {
    applyPalette(sliderValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(0, Math.min(100, Number(e.target.value)));
    setSliderValue(v);
    applyPalette(v);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANDING_THEME_STRIP_KEY, String(v));
    }
  };

  const sliderInput = (
    <input
      type="range"
      min={0}
      max={100}
      value={sliderValue}
      onChange={handleSliderChange}
      className={isMobile ? 'landing-theme-slider-horizontal w-full' : 'landing-theme-slider-vertical w-full'}
      aria-label="Clima: mais cor (esquerda/cima) a mais suave (direita/baixo)"
    />
  );

  return (
    <main
      className="landing-page min-h-screen bg-theme-bg text-theme-text flex flex-col"
      role="main"
      aria-label="Página inicial"
    >
      {/* Desktop: left theme strip — vertical slider with labels */}
      {!isMobile && (
        <aside
          className="fixed left-0 top-0 bottom-0 w-14 flex flex-col items-center py-8 border-r border-theme-border bg-theme-sidebar/80 shrink-0 z-10"
          aria-label="Ajuste o clima visual"
        >
          <span className="text-[10px] uppercase tracking-wider text-theme-muted mb-2">Mais cor</span>
          <div className="landing-theme-strip-track flex items-center flex-1 min-h-0">
            {sliderInput}
          </div>
          <span className="text-[10px] uppercase tracking-wider text-theme-muted mt-2">Mais suave</span>
          <span className="text-[10px] uppercase tracking-wider text-theme-muted mt-1 block text-center">Clima</span>
        </aside>
      )}

      <div
        className="landing-page-content flex-1 flex flex-col w-full min-w-0"
        style={isMobile ? undefined : { marginLeft: STRIP_WIDTH }}
      >
        <div className="flex-1 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center justify-center px-6 sm:px-10 py-14 md:py-20 max-w-6xl mx-auto w-full">
          {/* Hero: copy + CTA */}
          <div className="flex flex-col items-center text-center lg:text-left max-w-xl">
            <img
              src={logo}
              alt="Tarefitas"
              className="w-full max-w-[280px] h-auto mx-auto lg:mx-0 mb-6"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-theme-text tracking-tight mb-3 text-center">
              Foco no que importa
            </h1>
            <p className="text-lg text-theme-muted leading-relaxed mb-8 text-center">
              Sabemos que é difícil focar. Por isso criamos o Tarefitas.
            </p>
            <div className="flex flex-wrap justify-center w-full">
              <LandingCTA variant="primary" className="rounded-xl px-8 py-4 text-lg font-medium">
                Começar
              </LandingCTA>
            </div>
          </div>

          {/* Illustration + preview */}
          <div className="w-full max-w-md lg:max-w-lg flex flex-col gap-6" id="preview">
            <LandingPreview />
          </div>
        </div>

        {/* Mobile: horizontal Clima bar at bottom with labels */}
        {isMobile && (
          <div
            className="landing-clima-bar flex flex-col gap-2 px-6 pb-6 pt-4 border-t border-theme-border bg-theme-sidebar/60"
            aria-label="Ajuste o clima visual"
          >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-theme-muted">
              <span className="font-medium text-theme-text">Clima</span>
            </div>
            <div className="w-full max-w-xs mx-auto">
              {sliderInput}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
