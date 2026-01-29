/**
 * Landing Page — Warm editorial, distinctive.
 * Fixed left “clima” strip, asymmetric layout, display + body type, staggered reveal.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { useSettingsStore } from '../../../stores/settingsStore';
import type { CustomPalette } from '../../../types';
import { interpolatePalette, type Palette } from '../../../shared/lib/color-interpolate.utils';
import { LandingCTA } from '../../../components/landing/LandingCTA';
import { LandingPreview } from '../../../components/landing/LandingPreview';
// @ts-ignore - Vite handles ?url imports
import illustrationSvg from '../../../assets/illustration-landing-page.svg?url';

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

const STRIP_WIDTH = 48;

export function LandingPage() {
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

  const handleSliderChange = (value: number) => {
    const v = Math.max(0, Math.min(100, value));
    setSliderValue(v);
    applyPalette(v);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANDING_THEME_STRIP_KEY, String(v));
    }
  };

  return (
    <main
      className="landing-page min-h-screen bg-theme-bg text-theme-text flex"
      role="main"
      aria-label="Página inicial"
      style={{ marginLeft: `${STRIP_WIDTH}px` }}
    >
      {/* Fixed left: clima strip — signature control */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-20 flex flex-col items-center py-8 border-r border-theme-border bg-theme-panel/90 backdrop-blur-md shadow-sm"
        style={{ width: `${STRIP_WIDTH}px` }}
        role="group"
        aria-label="Clima visual — arraste para cima ou para baixo"
      >
        <span
          className="text-[11px] text-theme-muted font-medium mb-6 select-none tracking-widest uppercase"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          Clima
        </span>
        <div
          className="landing-theme-strip-track flex-1 flex justify-center items-center w-full min-h-[200px] max-h-[50vh]"
          style={{ touchAction: 'none' }}
        >
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={sliderValue}
            onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
            className="landing-theme-slider-vertical"
            aria-label="Ajustar clima visual"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(sliderValue)}
            aria-valuetext={`${Math.round(sliderValue)}%`}
          />
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          {PALETTES.map((p, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-theme-border shrink-0"
              style={{ backgroundColor: p.bg }}
              aria-hidden
            />
          ))}
        </div>
      </aside>

      {/* Content — asymmetric, editorial */}
      <div className="landing-page-content flex-1 flex flex-col w-full">
        <div className="flex-1 grid lg:grid-cols-[1fr,minmax(320px,40%)] gap-12 lg:gap-16 items-center px-6 sm:px-10 py-14 md:py-20 max-w-6xl mx-auto w-full">
          {/* Left: copy block — left-aligned on desktop */}
          <div className="flex flex-col text-left max-w-xl">
            <p
              className="landing-reveal landing-reveal-1 font-landing-body text-lg md:text-xl text-theme-muted leading-relaxed mb-5"
              style={{ fontFamily: 'var(--font-landing-body)' }}
            >
              A gente sabe que é difícil focar.
            </p>
            <h1
              className="landing-reveal landing-reveal-2 font-landing-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] text-theme-text mb-6"
              style={{ fontFamily: 'var(--font-landing-display)' }}
            >
              Então construímos o Tarefitas
            </h1>
            <p
              className="landing-reveal landing-reveal-3 font-landing-body text-base md:text-lg text-theme-muted leading-relaxed mb-4"
              style={{ fontFamily: 'var(--font-landing-body)' }}
            >
              Um planner calmo para organizar tarefas, quebrar em passos e dar aquele foco no seu tempo.
            </p>
            <p
              className="landing-reveal landing-reveal-4 font-landing-body text-sm text-theme-muted mb-10"
              style={{ fontFamily: 'var(--font-landing-body)' }}
            >
              De neurodivergentes, para neurodivergentes.
            </p>
            <div className="landing-reveal landing-reveal-5 flex flex-wrap gap-4">
              <div className="landing-cta">
                <LandingCTA variant="primary">
                  Quero experimentar
                </LandingCTA>
              </div>
              <Link
                to="/tasks"
                className="font-landing-body text-theme-muted hover:text-theme-text transition-colors text-sm underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:ring-offset-2 focus-visible:rounded px-2 py-1"
                style={{ fontFamily: 'var(--font-landing-body)' }}
              >
                Já tenho conta :D
              </Link>
            </div>
          </div>

          {/* Right: illustration + preview — overlap / grid-breaking */}
          <div className="landing-reveal landing-reveal-6 flex flex-col items-center lg:items-end gap-8">
            <div className="w-full max-w-[280px] lg:max-w-[320px] mx-auto lg:mx-0" aria-hidden="true">
              <img
                src={illustrationSvg}
                alt=""
                className="w-full h-auto drop-shadow-lg"
                loading="eager"
              />
            </div>
            <section
              className="landing-reveal landing-reveal-7 w-full rounded-2xl border border-theme-border bg-theme-panel/95 backdrop-blur-sm overflow-hidden shadow-lg"
              aria-label="Prévia do app"
            >
              <LandingPreview />
            </section>
          </div>
        </div>

        <footer
          className="w-full border-t border-theme-border py-5 px-6 text-center text-xs text-theme-muted font-landing-body"
          role="contentinfo"
          style={{ fontFamily: 'var(--font-landing-body)' }}
        >
          Gratuito, offline e feito com carinho. Sem contagem de produtividade.
          <br />
          Dúvidas ou sugestões: <strong className="text-theme-text">oi@tarefitas.com</strong>
        </footer>
      </div>
    </main>
  );
}
